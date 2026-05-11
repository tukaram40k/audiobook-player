import { createContext } from 'react'
import type { Track } from '../api'

export type PlayerContextValue = {
  currentTrack: Track | null
  isPlaying: boolean
  isReady: boolean
  currentTime: number
  duration: number
  play: () => Promise<void>
  pause: () => void
  toggle: () => Promise<void>
  seek: (seconds: number) => void
  loadTrack: (track: Track, options?: { autoPlay?: boolean }) => Promise<void>
  playTrack: (track: Track) => Promise<void>
  next: () => Promise<void>
  previous: () => Promise<void>
}

export const PlayerContext = createContext<PlayerContextValue | undefined>(undefined)
