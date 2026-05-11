import { createContext } from 'react'
import type { Book } from '../api'

export type LibraryContextValue = {
  books: Book[]
  currentBookId: string | null
  currentBook: Book | null
  isLoading: boolean
  error: string | null
  selectBook: (bookId: string) => void
  reload: () => Promise<void>
  openFolder: () => Promise<void>
}

export const LibraryContext = createContext<LibraryContextValue | undefined>(undefined)
