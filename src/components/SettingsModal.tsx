import { useEffect } from 'react'
import { useLibrary } from '../state/useLibrary'

type SettingsModalProps = {
  isOpen: boolean
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onClose: () => void
}

const SettingsModal = ({ isOpen, theme, onToggleTheme, onClose }: SettingsModalProps) => {
  const { isLoading, openFolder } = useLibrary()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const themeLabel = theme === 'dark' ? 'Light mode' : 'Dark mode'

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal__header">
          <h2 id="settings-title">Settings</h2>
          <button className="button button--ghost" type="button" onClick={onClose}>
            Close
          </button>
        </header>
        <section className="modal__section">
          <div className="modal__row">
            <div className="modal__text">
              <span className="modal__label">Theme</span>
              <span className="modal__hint">Switch between light and dark.</span>
            </div>
            <button
              className="button"
              type="button"
              onClick={onToggleTheme}
              aria-pressed={theme === 'dark'}
            >
              {themeLabel}
            </button>
          </div>
        </section>
        <section className="modal__section">
          <div className="modal__row">
            <div className="modal__text">
              <span className="modal__label">Library</span>
              <span className="modal__hint">Choose a folder with MP3 files.</span>
            </div>
            <button
              className="button button--ghost"
              type="button"
              onClick={() => void openFolder()}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Open Folder'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default SettingsModal
