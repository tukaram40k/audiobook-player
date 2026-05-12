import type { Book } from '../api/types'

declare global {
  interface Window {
    electronApi?: {
      pickLibraryFolder: () => Promise<string | null>
      readLibrary: (libraryPath: string) => Promise<Book[]>
    }
  }
}

export {}
