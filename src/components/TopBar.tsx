import { useLibrary } from '../state/useLibrary'

type TopBarProps = {
  onOpenSettings: () => void
}

const TopBar = ({ onOpenSettings }: TopBarProps) => {
  const { currentBook } = useLibrary()
  const subtitle = currentBook
    ? `${currentBook.author ?? 'Unknown author'}${currentBook.narrator ? ` • ${currentBook.narrator}` : ''}`
    : 'Select a book to begin'

  return (
    <header className="app-topbar">
      <div className="app-topbar__text">
        <span className="app-kicker">Audiobook Player</span>
        <span className="app-title">{currentBook ? currentBook.title : 'No book selected'}</span>
        <span className="app-subtitle">{subtitle}</span>
      </div>
      <div className="app-actions">
        <button className="button button--ghost" type="button" onClick={onOpenSettings}>
          Settings
        </button>
      </div>
    </header>
  )
}

export default TopBar
