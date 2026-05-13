import { useEffect, useState } from 'react'
import BookSidebar from './components/BookSidebar'
import PlayerView from './components/PlayerView'
import SettingsModal from './components/SettingsModal'
import TopBar from './components/TopBar'
import TrackSidebar from './components/TrackSidebar'
import { electronApi, mockApi } from './api'
import { LibraryProvider } from './state/LibraryProvider'
import { PlayerProvider } from './state/PlayerProvider'

type ThemeMode = 'light' | 'dark'
type AppSettings = {
  theme: ThemeMode
  autoAdvance: boolean
}

const SETTINGS_STORAGE_KEY = 'audiobook-player.settings'

const getSystemTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const loadSettings = (): AppSettings => {
  const fallback: AppSettings = {
    theme: getSystemTheme(),
    autoAdvance: true,
  }

  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) {
      return fallback
    }

    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return {
      theme: parsed.theme === 'dark' || parsed.theme === 'light' ? parsed.theme : fallback.theme,
      autoAdvance: typeof parsed.autoAdvance === 'boolean' ? parsed.autoAdvance : fallback.autoAdvance,
    }
  } catch {
    return fallback
  }
}

const App = () => {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings())
  const api = typeof window !== 'undefined' && window.electronApi ? electronApi : mockApi

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // Ignore storage failures (private mode, quota, etc.).
    }
  }, [settings])

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }))
  }

  const toggleAutoAdvance = () => {
    setSettings((prev) => ({
      ...prev,
      autoAdvance: !prev.autoAdvance,
    }))
  }

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const openSettings = () => {
    setIsSettingsOpen(true)
  }

  const closeSettings = () => {
    setIsSettingsOpen(false)
  }

  return (
    <LibraryProvider api={api}>
      <PlayerProvider api={api} autoAdvance={settings.autoAdvance}>
        <div className="app-shell">
          <TopBar onOpenSettings={openSettings} />
          <div className="app-body">
            <BookSidebar />
            <PlayerView />
            <TrackSidebar />
          </div>
        </div>
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={closeSettings}
          theme={settings.theme}
          onToggleTheme={toggleTheme}
          autoAdvance={settings.autoAdvance}
          onToggleAutoAdvance={toggleAutoAdvance}
        />
      </PlayerProvider>
    </LibraryProvider>
  )
}

export default App
