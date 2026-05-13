import { app, BrowserWindow, dialog, ipcMain, protocol } from 'electron'
import { promises as fs } from 'fs'
import { parseFile } from 'music-metadata'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const AUDIO_EXTENSIONS = new Set(['.mp3', '.m4b', '.m4a', '.aac', '.flac', '.ogg', '.wav'])
const AUDIO_PROTOCOL = 'audiobook'
const AUDIO_LOG_LIMIT = 12

protocol.registerSchemesAsPrivileged([
  {
    scheme: AUDIO_PROTOCOL,
    privileges: {
      standard: true,
      secure: true,
      stream: true,
      supportFetchAPI: true,
    },
  },
])

type TrackInfo = {
  id: string
  title: string
  src: string
  trackNumber: number
  durationSeconds: number | null
}

type BookInfo = {
  id: string
  title: string
  author?: string
  narrator?: string
  coverUrl?: string
  folderPath: string
  tracks: TrackInfo[]
}

const isAudioFile = (filePath: string) => {
  return AUDIO_EXTENSIONS.has(path.extname(filePath).toLowerCase())
}

const walkFiles = async (folderPath: string, results: string[]) => {
  const entries = await fs.readdir(folderPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name)
    if (entry.isDirectory()) {
      await walkFiles(fullPath, results)
      continue
    }

    if (entry.isFile() && isAudioFile(fullPath)) {
      results.push(fullPath)
    }
  }
}

const toAudioSrc = (filePath: string) => {
  const encodedPath = Buffer.from(filePath, 'utf8').toString('base64url')
  return `${AUDIO_PROTOCOL}://local?path=${encodedPath}`
}

const readBookMetadata = async (audioPath: string | null) => {
  if (!audioPath) {
    return {}
  }

  try {
    const metadata = await parseFile(audioPath)
    const author = metadata.common.artist ?? metadata.common.albumartist
    const narrator = metadata.common.composer?.[0]
    const picture = metadata.common.picture?.[0]

    const coverUrl = picture
      ? `data:${picture.format || 'image/jpeg'};base64,${Buffer.from(picture.data).toString('base64')}`
      : undefined

    return {
      author,
      narrator,
      coverUrl,
    }
  } catch (error) {
    console.warn('[library] metadata read failed', audioPath, error)
    return {}
  }
}

const readBook = async (bookFolderPath: string): Promise<BookInfo> => {
  const filePaths: string[] = []
  await walkFiles(bookFolderPath, filePaths)

  const sortedFiles = filePaths.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  const tracks = sortedFiles.map((filePath, index) => {
    const title = path.parse(filePath).name
    return {
      id: `${path.basename(bookFolderPath)}-${index + 1}`,
      title,
      src: toAudioSrc(filePath),
      trackNumber: index + 1,
      durationSeconds: null,
    }
  })

  const metadata = await readBookMetadata(sortedFiles[0] ?? null)

  if (tracks.length > 0) {
    const sample = tracks.slice(0, AUDIO_LOG_LIMIT).map((track) => track.src)
    console.log(`[library] ${path.basename(bookFolderPath)}: sample audio srcs`, sample)
  }

  const title = path.basename(bookFolderPath)
  return {
    id: title,
    title,
    author: metadata.author,
    narrator: metadata.narrator,
    coverUrl: metadata.coverUrl,
    folderPath: bookFolderPath,
    tracks,
  }
}

const readLibrary = async (libraryPath: string): Promise<BookInfo[]> => {
  const entries = await fs.readdir(libraryPath, { withFileTypes: true })
  const bookFolders = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(libraryPath, entry.name))

  const books: BookInfo[] = []
  for (const folderPath of bookFolders) {
    const book = await readBook(folderPath)
    books.push(book)
  }

  return books
}

let mainWindow: BrowserWindow | null = null

const createWindow = () => {
  protocol.registerFileProtocol(AUDIO_PROTOCOL, (request, callback) => {
    try {
      const parsedUrl = new URL(request.url)
      const encodedPath = parsedUrl.searchParams.get('path')
      if (!encodedPath) {
        callback({ error: -6 })
        return
      }

      let decodedPath = Buffer.from(encodedPath, 'base64url').toString('utf8')
      if (process.platform === 'win32') {
        decodedPath = decodedPath.replace(/^\/+/, '')
      }

      fs
        .access(decodedPath)
        .then(() => {
          callback({ path: decodedPath })
        })
        .catch((error) => {
          console.error('[library] file access failed', decodedPath, error)
          callback({ error: -6 })
        })
    } catch (error) {
      console.error('[library] failed to resolve audio path', error)
      callback({ error: -6 })
    }
  })

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

ipcMain.handle('library:pick', async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender) ?? mainWindow
  if (!window) {
    return null
  }

  const result = await dialog.showOpenDialog(window, {
    title: 'Select audiobook library folder',
    properties: ['openDirectory'],
  })

  if (result.canceled || result.filePaths.length === 0) {
    console.log('[library] selection canceled')
    return null
  }

  console.log('[library] selected folder:', result.filePaths[0])
  return result.filePaths[0]
})

ipcMain.handle('library:read', async (_event, libraryPath: string) => {
  if (!libraryPath) {
    return []
  }

  const books = await readLibrary(libraryPath)
  console.log(`[library] read ${books.length} books from ${libraryPath}`)
  return books
})

app.whenReady().then(createWindow)