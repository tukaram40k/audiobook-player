import type { Book, PlaybackPosition, PlayerApi } from './types'

const PLAYBACK_KEY = 'audiobook-player.playback'
const LIBRARY_KEY = 'audiobook-player.libraryPath'

const isStorageAvailable = () => {
  try {
    return typeof localStorage !== 'undefined'
  } catch {
    return false
  }
}

const readPositions = (): Record<string, PlaybackPosition> => {
  if (!isStorageAvailable()) {
    return {}
  }

  const raw = localStorage.getItem(PLAYBACK_KEY)
  if (!raw) {
    return {}
  }

  try {
    return JSON.parse(raw) as Record<string, PlaybackPosition>
  } catch {
    return {}
  }
}

const writePositions = (positions: Record<string, PlaybackPosition>) => {
  if (!isStorageAvailable()) {
    return
  }

  localStorage.setItem(PLAYBACK_KEY, JSON.stringify(positions))
}

const getLibraryPath = () => {
  if (!isStorageAvailable()) {
    return null
  }

  return localStorage.getItem(LIBRARY_KEY)
}

const setLibraryPath = (libraryPath: string) => {
  if (!isStorageAvailable()) {
    return
  }

  localStorage.setItem(LIBRARY_KEY, libraryPath)
}

const getElectronApi = () => {
  if (!window.electronApi) {
    throw new Error('Electron API is not available')
  }

  return window.electronApi
}

export const electronApi: PlayerApi = {
  async getBooks() {
    const libraryPath = getLibraryPath()
    if (!libraryPath) {
      return []
    }

    const api = getElectronApi()
    return api.readLibrary(libraryPath)
  },
  async openFolder() {
    const api = getElectronApi()
    const libraryPath = await api.pickLibraryFolder()
    if (!libraryPath) {
      return []
    }

    setLibraryPath(libraryPath)
    return api.readLibrary(libraryPath)
  },
  async savePlaybackPosition(position) {
    const positions = readPositions()
    const key = `${position.bookId}:${position.trackId}`
    positions[key] = position
    writePositions(positions)
  },
}
