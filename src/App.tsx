import { LibraryProvider } from './state/LibraryProvider'
import { useLibrary } from './state/useLibrary'

const LibraryPreview = () => {
  const { books, currentBook, isLoading, error, openFolder, selectBook } = useLibrary()

  return (
    <div>
      <h1>Audiobook Player</h1>
      <button type="button" onClick={() => void openFolder()}>
        Open Folder
      </button>
      {isLoading ? (
        <p>Loading library...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div>
          <h2>Books</h2>
          <ul>
            {books.map((book) => (
              <li key={book.id}>
                <button type="button" onClick={() => selectBook(book.id)}>
                  {book.title}
                </button>
              </li>
            ))}
          </ul>
          <h2>Tracks</h2>
          {currentBook ? (
            <ol>
              {currentBook.tracks.map((track) => (
                <li key={track.id}>{track.title}</li>
              ))}
            </ol>
          ) : (
            <p>No book selected.</p>
          )}
        </div>
      )}
    </div>
  )
}

const App = () => {
  return (
    <LibraryProvider>
      <LibraryPreview />
    </LibraryProvider>
  )
}

export default App
