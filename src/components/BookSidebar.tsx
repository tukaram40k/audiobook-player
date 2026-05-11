import { useLibrary } from '../state/useLibrary'

const BookSidebar = () => {
  const { books, currentBookId, isLoading, error, selectBook } = useLibrary()

  return (
    <aside className="panel sidebar">
      <div className="panel-header">
        <h2>Books</h2>
        <span className="panel-count">{books.length}</span>
      </div>
      {isLoading ? <p className="muted">Loading library...</p> : null}
      {error ? <p className="muted">{error}</p> : null}
      {!isLoading && books.length === 0 ? <p className="muted">No books found.</p> : null}
      <ul className="sidebar-list">
        {books.map((book) => (
          <li key={book.id}>
            <button
              className={book.id === currentBookId ? 'sidebar-button is-active' : 'sidebar-button'}
              type="button"
              onClick={() => selectBook(book.id)}
            >
              <span className="sidebar-title">{book.title}</span>
              <span className="sidebar-subtitle">{book.author ?? 'Unknown author'}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default BookSidebar
