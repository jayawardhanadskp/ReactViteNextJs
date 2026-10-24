// SOLUTION — Exercise 3: Login form (controlled inputs, validation, submit)
import { useState, type FormEvent } from 'react'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function Ex3LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loggedInAs, setLoggedInAs] = useState<string | null>(null)

  const errors = {
    email: email.includes('@') && email.includes('.') ? null : 'Please enter a valid email',
    password: password.length >= 8 ? null : 'Password must be at least 8 characters',
  }
  const isValid = errors.email === null && errors.password === null

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
    if (!isValid) return

    setLoading(true)
    await wait(1000) // pretend to call an API
    setLoading(false)
    setLoggedInAs(email)
  }

  if (loggedInAs) {
    return (
      <div className="stack" style={{ maxWidth: 360 }}>
        <h3 className="success">Welcome, {loggedInAs}! 🎉</h3>
        <button
          className="btn"
          onClick={() => {
            setLoggedInAs(null)
            setPassword('')
            setSubmitted(false)
          }}
        >
          Log out
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="stack" style={{ maxWidth: 360 }}>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
          placeholder="you@example.com"
        />
        {submitted && errors.email && <p className="error">{errors.email}</p>}
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <div className="row">
          <input
            id="password"
            className="input"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" className="btn" onClick={() => setShowPassword((s) => !s)}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="muted" style={{ fontSize: 12 }}>
          {password.length}/8 characters
        </p>
        {submitted && errors.password && <p className="error">{errors.password}</p>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  )
}
