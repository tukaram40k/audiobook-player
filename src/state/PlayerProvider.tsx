import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { mockApi } from '../api'
import type { PlayerApi, Track } from '../api'
import { PlayerContext } from './playerContext'
import type { PlayerContextValue } from './playerContext'
import { useLibrary } from './useLibrary'

const PERSIST_INTERVAL_MS = 5000
const RESTART_THRESHOLD_SECONDS = 5

type PlayerProviderProps = PropsWithChildren<{
  api?: PlayerApi
  autoAdvance?: boolean
}>

export const PlayerProvider = ({
  children,
  api = mockApi,
  autoAdvance = true,
}: PlayerProviderProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio()
      audio.preload = 'metadata'
      audioRef.current = audio
    }

    return audioRef.current
  }, [])

  const { currentBook, currentBookId } = useLibrary()
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const lastPersistRef = useRef(0)

  const persistPosition = useCallback(
    (time: number, force = false) => {
      if (!currentTrack || !currentBookId || !Number.isFinite(time)) {
        return
      }

      const now = Date.now()
      if (!force && now - lastPersistRef.current < PERSIST_INTERVAL_MS) {
        return
      }

      lastPersistRef.current = now
      void api.savePlaybackPosition({
        bookId: currentBookId,
        trackId: currentTrack.id,
        positionSeconds: time,
        updatedAt: new Date(now).toISOString(),
      })
    },
    [api, currentBookId, currentTrack],
  )

  const loadTrack = useCallback(
    async (track: Track, options?: { autoPlay?: boolean }) => {
      const audio = ensureAudio()
      if (!audio) {
        return
      }

      setCurrentTrack(track)
      setIsReady(false)
      setCurrentTime(0)
      setDuration(0)
      lastPersistRef.current = 0

      audio.src = track.src
      audio.currentTime = 0
      audio.load()

      if (options?.autoPlay) {
        try {
          await audio.play()
        } catch {
          setIsPlaying(false)
        }
      }
    },
    [ensureAudio],
  )

  const playTrack = useCallback(
    async (track: Track) => {
      await loadTrack(track, { autoPlay: true })
    },
    [loadTrack],
  )

  const play = useCallback(async () => {
    const audio = ensureAudio()
    if (!audio) {
      return
    }

    if (!currentTrack) {
      const firstTrack = currentBook?.tracks[0]
      if (!firstTrack) {
        return
      }
      await loadTrack(firstTrack, { autoPlay: true })
      return
    }

    try {
      await audio.play()
    } catch {
      setIsPlaying(false)
    }
  }, [currentBook, currentTrack, ensureAudio, loadTrack])

  const pause = useCallback(() => {
    const audio = ensureAudio()
    if (!audio) {
      return
    }

    audio.pause()
    persistPosition(audio.currentTime, true)
  }, [ensureAudio, persistPosition])

  const toggle = useCallback(async () => {
    const audio = ensureAudio()
    if (!audio) {
      return
    }

    if (audio.paused) {
      await play()
    } else {
      pause()
    }
  }, [ensureAudio, pause, play])

  const seek = useCallback(
    (seconds: number) => {
      const audio = ensureAudio()
      if (!audio || !Number.isFinite(seconds)) {
        return
      }

      const nextTime = Math.max(0, seconds)
      audio.currentTime = nextTime
      setCurrentTime(nextTime)
      persistPosition(nextTime, true)
    },
    [ensureAudio, persistPosition],
  )

  const resolveAdjacentTrack = useCallback(
    (offset: number) => {
      if (!currentBook || !currentTrack) {
        return null
      }

      const index = currentBook.tracks.findIndex((track) => track.id === currentTrack.id)
      if (index < 0) {
        return null
      }

      return currentBook.tracks[index + offset] ?? null
    },
    [currentBook, currentTrack],
  )

  const moveToAdjacent = useCallback(
    async (offset: number, options?: { autoPlay?: boolean }) => {
      const nextTrack = resolveAdjacentTrack(offset)
      if (!nextTrack) {
        return
      }

      await loadTrack(nextTrack, { autoPlay: options?.autoPlay })
    },
    [loadTrack, resolveAdjacentTrack],
  )

  const next = useCallback(async () => {
    await moveToAdjacent(1, { autoPlay: isPlaying })
  }, [isPlaying, moveToAdjacent])

  const previous = useCallback(async () => {
    if (currentTime > RESTART_THRESHOLD_SECONDS) {
      seek(0)
      return
    }

    await moveToAdjacent(-1, { autoPlay: isPlaying })
  }, [currentTime, isPlaying, moveToAdjacent, seek])

  useEffect(() => {
    const audio = ensureAudio()
    if (!audio) {
      return
    }

    const handleLoaded = () => {
      const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0
      setDuration(nextDuration)
      setIsReady(true)
    }

    const handleTimeUpdate = () => {
      const nextTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0
      setCurrentTime(nextTime)
      persistPosition(nextTime)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleEnded = () => {
      if (!autoAdvance) {
        setIsPlaying(false)
        return
      }

      void moveToAdjacent(1, { autoPlay: true })
    }

    const handleError = () => {
      const error = audio.error
      console.error('[player] audio error', {
        code: error?.code,
        message: error?.message,
        src: audio.src,
      })
    }

    audio.addEventListener('loadedmetadata', handleLoaded)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoaded)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [autoAdvance, ensureAudio, moveToAdjacent, persistPosition])

  const value = useMemo<PlayerContextValue>(
    () => ({
      currentTrack,
      isPlaying,
      isReady,
      currentTime,
      duration,
      play,
      pause,
      toggle,
      seek,
      loadTrack,
      playTrack,
      next,
      previous,
    }),
    [
      currentTrack,
      currentTime,
      duration,
      isPlaying,
      isReady,
      loadTrack,
      next,
      pause,
      play,
      playTrack,
      previous,
      seek,
      toggle,
    ],
  )

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  )
}
