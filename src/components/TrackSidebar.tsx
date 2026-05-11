import { useLibrary } from '../state/useLibrary'
import { usePlayer } from '../state/usePlayer'

const TrackSidebar = () => {
  const { currentBook } = useLibrary()
  const { currentTrack, playTrack } = usePlayer()
  const tracks = currentBook?.tracks ?? []

  return (
    <aside className="panel sidebar">
      <div className="panel-header">
        <h2>Tracks</h2>
        <span className="panel-count">{tracks.length}</span>
      </div>
      {!currentBook ? <p className="muted">Select a book to see tracks.</p> : null}
      <ul className="sidebar-list">
        {tracks.map((track) => (
          <li key={track.id}>
            <button
              className={track.id === currentTrack?.id ? 'sidebar-button is-active' : 'sidebar-button'}
              type="button"
              onClick={() => void playTrack(track)}
            >
              <span className="sidebar-title">{track.trackNumber}. {track.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default TrackSidebar
