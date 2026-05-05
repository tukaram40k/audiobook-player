export type Track = {
  id: string
  title: string
  src: string
  trackNumber: number
  durationSeconds?: number | null
}

export type Book = {
  id: string
  title: string
  author?: string
  narrator?: string
  coverUrl?: string
  tracks: Track[]
}

export type PlaybackPosition = {
  bookId: string
  trackId: string
  positionSeconds: number
  updatedAt: string
}

export type PlayerApi = {
  getBooks: () => Promise<Book[]>
  openFolder: () => Promise<Book[]>
  savePlaybackPosition: (position: PlaybackPosition) => Promise<void>
}
