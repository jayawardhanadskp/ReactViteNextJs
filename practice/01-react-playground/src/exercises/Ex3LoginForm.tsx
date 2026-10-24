/*
 * EXERCISE 3 — Login form (controlled inputs, validation, submit)    Lesson: 02-react-core/04
 * -------------------------------------------------------------------------------------------
 * Flutter version: Form + TextFormField(validator:) + TextEditingController + ElevatedButton.
 *
 * TODO 1. Make both inputs CONTROLLED: add `email` and `password` state and connect
 *         value={...} + onChange={e => ...}. Trim spaces from the email as the user types.
 * TODO 2. "Show/Hide" button toggles the password input `type` between 'password' and 'text'.
 *         ⚠️ Give it type="button", otherwise it submits the form!
 * TODO 3. Show a live counter under the password: "5/8 characters".
 * TODO 4. Validation (derived values, no extra state):
 *           email is valid if it contains '@' and '.'   → else "Please enter a valid email"
 *           password is valid if length >= 8            → else "Password must be at least 8 characters"
 *         Show the error messages ONLY after the user has tried to submit once
 *         (add a `submitted` boolean state).
 * TODO 5. In handleSubmit: e.preventDefault(), set submitted = true, stop if invalid.
 *         If valid: set `loading` true, `await wait(1000)`, set loading false, and
 *         set `loggedInAs` to the email.
 * TODO 6. While loading: disable the submit button and change its text to "Logging in…".
 * TODO 7. If loggedInAs is set, return a different UI (early return):
 *         "Welcome, <email>! 🎉" + a "Log out" button that clears loggedInAs, password and submitted.
 */
import { useState, type FormEvent } from 'react'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function Ex3LoginForm() {
  // TODO: states for email, password, showPassword, submitted, loading, loggedInAs
  const [loggedInAs, setLoggedInAs] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    // TODO 5
  }

  // TODO 7: if (loggedInAs) return (...)

  return (
    <form onSubmit={handleSubmit} noValidate className="stack" style={{ maxWidth: 360 }}>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" className="input" type="email" placeholder="you@example.com" />
        {/* TODO 4: email error */}
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <div className="row">
          <input id="password" className="input" type="password" />
          <button type="button" className="btn">
            Show
          </button>
        </div>
        {/* TODO 3: character counter */}
        {/* TODO 4: password error */}
      </div>

      <button type="submit" className="btn btn-primary">
        Log in
      </button>
    </form>
  )
}
