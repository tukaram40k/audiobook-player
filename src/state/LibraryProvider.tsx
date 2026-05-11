import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { mockApi } from '../api'
import type { Book, PlayerApi } from '../api'
import { LibraryContext } from './libraryContext'
import type { LibraryContextValue } from './libraryContext'

type LibraryProviderProps = PropsWithChildren<{
  api?: PlayerApi
}>

const resolveCurrentBookId = (books: Book[], preferredId: string | null) => {
  if (preferredId && books.some((book) => book.id === preferredId)) {
    return preferredId
  }

  return books[0]?.id ?? null
}

export const LibraryProvider = ({ children, api = mockApi }: LibraryProviderProps) => {
  const [books, setBooks] = useState<Book[]>([])
  const [currentBookId, setCurrentBookId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hydrate = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const nextBooks = await api.getBooks()
      setBooks(nextBooks)
      setCurrentBookId((prev) => resolveCurrentBookId(nextBooks, prev))
    } catch {
      setError('Failed to load library')
    } finally {
      setIsLoading(false)
    }
  }, [api])

  const openFolder = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const nextBooks = await api.openFolder()
      setBooks(nextBooks)
      setCurrentBookId((prev) => resolveCurrentBookId(nextBooks, prev))
    } catch {
      setError('Failed to open folder')
    } finally {
      setIsLoading(false)
    }
  }, [api])

  useEffect(() => {
    let isActive = true

    api
      .getBooks()
      .then((nextBooks) => {
        if (!isActive) {
          return
        }
        setBooks(nextBooks)
        setCurrentBookId((prev) => resolveCurrentBookId(nextBooks, prev))
      })
      .catch(() => {
        if (isActive) {
          setError('Failed to load library')
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [api])

  const selectBook = useCallback((bookId: string) => {
    setCurrentBookId(bookId)
  }, [])

  const currentBook = useMemo(() => {
    return books.find((book) => book.id === currentBookId) ?? null
  }, [books, currentBookId])

  const value = useMemo<LibraryContextValue>(
    () => ({
      books,
      currentBookId,
      currentBook,
      isLoading,
      error,
      selectBook,
      reload: hydrate,
      openFolder,
    }),
    [books, currentBookId, currentBook, isLoading, error, selectBook, hydrate, openFolder],
  )

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  )
}

