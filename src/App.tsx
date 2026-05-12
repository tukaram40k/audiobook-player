import { useEffect, useState } from 'react'
import BookSidebar from './components/BookSidebar'
import PlayerView from './components/PlayerView'
import TopBar from './components/TopBar'
import TrackSidebar from './components/TrackSidebar'
import { LibraryProvider } from './state/LibraryProvider'
import { PlayerProvider } from './state/PlayerProvider'

const App = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <LibraryProvider>
      <PlayerProvider>
        <div className="app-shell">
          <TopBar theme={theme} onToggleTheme={toggleTheme} />
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
