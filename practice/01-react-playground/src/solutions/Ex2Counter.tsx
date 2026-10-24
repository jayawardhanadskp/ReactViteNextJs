// SOLUTION — Exercise 2: Counter (useState)
import { useState } from 'react'

export default function Ex2Counter() {
  const [count, setCount] = useState(0)
  const [step, setStep] = useState(1)

  // Derived values — calculated during render, not stored in state
  const isEven = count % 2 === 0
  const canDecrease = count - step >= 0

  return (
    <div className="stack" style={{ maxWidth: 360 }}>
      <p style={{ fontSize: 56, fontWeight: 800, textAlign: 'center' }}>{count}</p>
      <p className="muted" style={{ textAlign: 'center' }}>
        {count === 0 ? 'Start clicking!' : isEven ? 'Even number' : 'Odd number'}
      </p>

      <div className="row" style={{ justifyContent: 'center' }}>
        <button className="btn" onClick={() => setCount((c) => c - step)} disabled={!canDecrease}>
          − {step}
        </button>
        <button className="btn btn-primary" onClick={() => setCount((c) => c + step)}>
          + {step}
        </button>
        <button className="btn btn-ghost" onClick={() => setCount(0)}>
          Reset
        </button>
      </div>

      <div className="field">
        <label htmlFor="step">Step</label>
        <select id="step" className="input" value={step} onChange={(e) => setStep(Number(e.target.value))}>
          <option value={1}>1</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
        </select>
      </div>

      {/* Uses the updater function three times. With setCount(count + step) it would only add once. */}
      <button
        className="btn"
        onClick={() => {
          setCount((c) => c + step)
          setCount((c) => c + step)
          setCount((c) => c + step)
        }}
      >
        Add {step} three times
      </button>
    </div>
  )
}
