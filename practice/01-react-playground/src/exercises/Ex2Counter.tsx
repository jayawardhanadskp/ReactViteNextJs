/*
 * EXERCISE 2 — Counter (useState)                          Lesson: 02-react-core/03
 * ---------------------------------------------------------------------------------
 * The famous Flutter counter app — with a few extras.
 *
 * TODO 1. Create a `count` state starting at 0 (replace the `const count = 0` line).
 * TODO 2. Create a `step` state starting at 1.
 * TODO 3. "+ step" button adds `step` to count. Use the updater form: setCount(c => c + step)
 * TODO 4. "− step" button subtracts `step`. It must be DISABLED if count - step would go below 0.
 * TODO 5. "Reset" button sets count back to 0.
 * TODO 6. Under the number show: "Start clicking!" when count is 0, otherwise "Even number" / "Odd number".
 *         (Derived value — do NOT create another state for this.)
 * TODO 7. Connect the <select> to `step` (value + onChange). Remember: e.target.value is a string!
 * TODO 8. "Add step three times" button: call setCount THREE times in one click so it adds step × 3.
 *         First try setCount(count + step) three times and see that it only adds once. Then fix it
 *         with the updater function. (Read lesson 03, section 3 for why.)
 */
export default function Ex2Counter() {
  const count = 0 // TODO 1
  const step = 1 // TODO 2

  return (
    <div className="stack" style={{ maxWidth: 360 }}>
      <p style={{ fontSize: 56, fontWeight: 800, textAlign: 'center' }}>{count}</p>
      <p className="muted" style={{ textAlign: 'center' }}>
        {/* TODO 6 */}
      </p>

      <div className="row" style={{ justifyContent: 'center' }}>
        <button className="btn">− {step}</button>
        <button className="btn btn-primary">+ {step}</button>
        <button className="btn btn-ghost">Reset</button>
      </div>

      <div className="field">
        <label htmlFor="step">Step</label>
        <select id="step" className="input">
          <option value={1}>1</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
        </select>
      </div>

      <button className="btn">Add {step} three times</button>
    </div>
  )
}
