import { usePlayer } from '../state/usePlayer'

const formatTime = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0:00'
  }

  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const PlayerView = () => {
  const {
    currentTrack,
    isPlaying,
    isReady,
    currentTime,
    duration,
    toggle,
    next,
    previous,
    seek,
  } = usePlayer()

  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0
  const clampedTime = Math.min(currentTime, safeDuration)
  const sliderMax = safeDuration > 0 ? safeDuration : 1

  return (
    <section className="panel player-view">
      <div className="player-meta">
        <span className="player-kicker">Now Playing</span>
        <h2 className="player-title">{currentTrack ? currentTrack.title : 'Pick a track'}</h2>
      </div>
      <div className="player-controls">
        <button className="button button--ghost" type="button" onClick={() => void previous()}>
          Prev
        </button>
        <button className="button" type="button" onClick={() => void toggle()}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button className="button button--ghost" type="button" onClick={() => void next()}>
          Next
        </button>
      </div>
      <div className="player-progress">
        <input
          className="player-slider"
          type="range"
          min={0}
          max={sliderMax}
          value={clampedTime}
          onChange={(event) => seek(Number(event.currentTarget.value))}
          disabled={!currentTrack || !isReady}
        />
        <div className="player-time">
          <span>{formatTime(clampedTime)}</span>
          <span>{formatTime(safeDuration)}</span>
        </div>
      </div>
    </section>
  )
}

export default PlayerView
