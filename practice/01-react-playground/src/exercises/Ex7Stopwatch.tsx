/*
 * EXERCISE 7 — Stopwatch (useRef + useEffect cleanup + custom hook)    Lesson: 02-react-core/08
 * ---------------------------------------------------------------------------------------------
 * Build the logic inside a CUSTOM HOOK `useStopwatch()`, so the component only does UI.
 *
 * TODO 1. In useStopwatch, add state: `elapsed` (ms, number), `running` (boolean), `laps` (number[]).
 * TODO 2. Add refs (NOT state, because they are not shown on screen):
 *           intervalRef = useRef<number | null>(null)   // the setInterval id
 *           startedAtRef = useRef(0)                    // Date.now() when started
 * TODO 3. start(): if already running (intervalRef.current !== null) do nothing.
 *         Otherwise startedAtRef.current = Date.now() - elapsed  (so Resume continues),
 *         intervalRef.current = window.setInterval(() => setElapsed(Date.now() - startedAtRef.current), 30)
 *         and setRunning(true).
 * TODO 4. stop(): clearInterval, set intervalRef.current = null, setRunning(false).
 * TODO 5. reset(): stop, elapsed = 0, laps = [].   lap(): add the current elapsed to the START of laps.
 * TODO 6. Cleanup (Flutter dispose): a useEffect with [] that returns a function clearing the interval.
 *         Test it: start the stopwatch and switch to another exercise. Without cleanup the timer
 *         keeps running in the background (you can see it with a console.log in the interval).
 * TODO 7. Return { elapsed, running, laps, start, stop, reset, lap } and connect the buttons.
 *         Show "Stop" while running, otherwise "Start" (or "Resume" if elapsed > 0).
 *         Disable Lap when not running and Reset when elapsed is 0. Show laps in the <ol>.
 * BONUS.  Use a ref to focus the Start button when the exercise opens (useRef<HTMLButtonElement>).
 */
import { useState } from 'react'

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const centis = Math.floor((ms % 1000) / 10)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(minutes)}:${pad(seconds)}.${pad(centis)}`
}

function useStopwatch() {
  const [elapsed, setElapsed] = useState(0)
  // TODO 1 – 6

  function start() {}
  function stop() {}
  function reset() {}
  function lap() {}

  return { elapsed, running: false, laps: [] as number[], start, stop, reset, lap }
}

export default function Ex7Stopwatch() {
  const { elapsed, running, laps, start, stop, reset, lap } = useStopwatch()

  return (
    <div className="stack" style={{ maxWidth: 360 }}>
      <p style={{ fontSize: 48, fontWeight: 700, fontVariantNumeric: 'tabular-nums', textAlign: 'center' }}>
        {formatTime(elapsed)}
      </p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button className="btn btn-primary">Start</button>
        <button className="btn">Lap</button>
        <button className="btn btn-ghost">Reset</button>
      </div>
      <ol className="card" style={{ margin: 0, paddingLeft: 32 }}>
        {/* TODO 7: laps */}
      </ol>
    </div>
  )
}
