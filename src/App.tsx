import BookSidebar from './components/BookSidebar'
import PlayerView from './components/PlayerView'
import TopBar from './components/TopBar'
import TrackSidebar from './components/TrackSidebar'
import { LibraryProvider } from './state/LibraryProvider'
import { PlayerProvider } from './state/PlayerProvider'

const App = () => {
  return (
    <LibraryProvider>
      <PlayerProvider>
        <div className="app-shell">
          <TopBar />
          <div className="app-body">
            <BookSidebar />
            <PlayerView />
            <TrackSidebar />
          </div>
        </div>
      </PlayerProvider>
    </LibraryProvider>
  )
}

export default App
