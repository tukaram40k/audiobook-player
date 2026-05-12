import { app, BrowserWindow, dialog } from 'electron'
import path from 'path'

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  const pickLibraryFolder = async () => {
    const result = await dialog.showOpenDialog(win, {
      title: 'Select audiobook library folder',
      properties: ['openDirectory'],
    })

    if (result.canceled || result.filePaths.length === 0) {
      console.log('[library] selection canceled')
      return
    }

    console.log('[library] selected folder:', result.filePaths[0])
  }

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  void pickLibraryFolder()
})