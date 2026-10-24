// SOLUTION — Exercise 5: User fetcher (useEffect + fetch + loading/error + abort)
import { useEffect, useState } from 'react'

type User = {
  id: number
  name: string
  email: string
  phone: string
  company: { name: string }
}

export default function Ex5UserFetcher() {
  const [userId, setUserId] = useState(1)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
        const data: User = await res.json()
        setUser(data)
      } catch (err) {
        if (controller.signal.aborted) return
        setUser(null)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [userId])

  return (
    <div className="stack" style={{ maxWidth: 400 }}>
      <div className="row">
        <button className="btn" onClick={() => setUserId((id) => id - 1)} disabled={userId <= 1}>
          ← Previous
        </button>
        <span className="badge">User #{userId}</span>
        <button className="btn" onClick={() => setUserId((id) => id + 1)}>
          Next →
        </button>
      </div>
      <p className="muted" style={{ fontSize: 13 }}>
        The API has users 1–10. Go to #11 to see the error state. Click fast to see abort in the Network tab.
      </p>

      {loading && <p>Loading…</p>}
      {error && <p className="error">⚠️ {error}</p>}
      {!loading && user && (
        <div className="card stack">
          <h3>{user.name}</h3>
          <p>📧 {user.email}</p>
          <p>📞 {user.phone}</p>
          <p className="muted">🏢 {user.company.name}</p>
        </div>
      )}
    </div>
  )
}
