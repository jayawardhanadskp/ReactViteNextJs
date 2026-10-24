// SOLUTION — Exercise 7: Stopwatch (useRef + useEffect cleanup + a custom hook)
import { useEffect, useRef, useState } from 'react'

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const centis = Math.floor((ms % 1000) / 10)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(minutes)}:${pad(seconds)}.${pad(centis)}`
}

// The custom hook: all the timer LOGIC, no UI.
function useStopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const intervalRef = useRef<number | null>(null) // timer id: not shown → ref, not state
  const startedAtRef = useRef(0)

  function start() {
    if (intervalRef.current !== null) return
    startedAtRef.current = Date.now() - elapsed
    intervalRef.current = window.setInterval(() => {
      setElapsed(Date.now() - startedAtRef.current)
    }, 30)
    setRunning(true)
  }

  function stop() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setRunning(false)
  }

  function reset() {
    stop()
    setElapsed(0)
    setLaps([])
  }

  function lap() {
    setLaps((prev) => [elapsed, ...prev])
  }

  // dispose(): stop the timer if the component is removed while running
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current)
    }
  }, [])

  return { elapsed, running, laps, start, stop, reset, lap }
}

export default function Ex7Stopwatch() {
  const { elapsed, running, laps, start, stop, reset, lap } = useStopwatch()
  const startButtonRef = useRef<HTMLButtonElement>(null)

  // Focus the start button when the exercise opens (DOM access through a ref)
  useEffect(() => {
    startButtonRef.current?.focus()
  }, [])

  return (
    <div className="stack" style={{ maxWidth: 360 }}>
      <p style={{ fontSize: 48, fontWeight: 700, fontVariantNumeric: 'tabular-nums', textAlign: 'center' }}>
        {formatTime(elapsed)}
      </p>
      <div className="row" style={{ justifyContent: 'center' }}>
        {running ? (
          <button className="btn btn-primary" onClick={stop}>
            Stop
          </button>
        ) : (
          <button ref={startButtonRef} className="btn btn-primary" onClick={start}>
            {elapsed === 0 ? 'Start' : 'Resume'}
          </button>
        )}
        <button className="btn" onClick={lap} disabled={!running}>
          Lap
        </button>
        <button className="btn btn-ghost" onClick={reset} disabled={elapsed === 0}>
          Reset
        </button>
      </div>
      {laps.length > 0 && (
        <ol className="card" style={{ margin: 0, paddingLeft: 32 }}>
          {laps.map((time, i) => (
            <li key={laps.length - i} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(time)}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
