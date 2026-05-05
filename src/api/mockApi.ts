import type { Book, PlaybackPosition, PlayerApi } from './types'

const STORAGE_KEY = 'audiobook-player.playback'

const mockBooks: Book[] = [
  {
    id: 'book-1',
    title: 'Sample Book',
    author: 'Unknown Author',
    narrator: 'Unknown Narrator',
    coverUrl: '/icons.svg',
    tracks: [
      {
        id: 'track-1',
        title: 'Chapter 1',
        src: '/file1.mp3',
        trackNumber: 1,
        durationSeconds: null,
      },
      {
        id: 'track-2',
        title: 'Chapter 2',
        src: '/file2.mp3',
        trackNumber: 2,
        durationSeconds: null,
      },
      {
        id: 'track-3',
        title: 'Chapter 3',
        src: '/file3.mp3',
        trackNumber: 3,
        durationSeconds: null,
      },
    ],
  },
]

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

  const raw = localStorage.getItem(STORAGE_KEY)
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

  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions))
}

export const mockApi: PlayerApi = {
  async getBooks() {
    return mockBooks
  },
  async openFolder() {
    return mockBooks
  },
  async savePlaybackPosition(position) {
    const positions = readPositions()
    const key = `${position.bookId}:${position.trackId}`
    positions[key] = position
    writePositions(positions)
  },
}
