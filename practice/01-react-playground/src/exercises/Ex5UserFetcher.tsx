/*
 * EXERCISE 5 — User fetcher (useEffect + fetch)            Lesson: 02-react-core/06
 * ---------------------------------------------------------------------------------
 * The React version of FutureBuilder. API: https://jsonplaceholder.typicode.com/users/1
 * (a free fake REST API with users 1–10).
 *
 * TODO 1. Add states: `user` (User | null), `loading` (boolean, start true), `error` (string | null).
 * TODO 2. Write a useEffect that fetches `https://jsonplaceholder.typicode.com/users/${userId}`
 *         - set loading true and error null at the start
 *         - if !res.ok → throw new Error(`Request failed with status ${res.status}`)
 *         - on success → setUser(data)
 *         - on error   → setUser(null) and setError(message)
 *         - finally    → setLoading(false)
 *         Remember: the effect function itself can't be async. Create `async function load()` inside.
 * TODO 3. The effect must run again whenever `userId` changes (dependency array!).
 * TODO 4. Cancel old requests: create an AbortController, pass `signal` to fetch, and
 *         `return () => controller.abort()` as cleanup. In catch/finally, do nothing if
 *         controller.signal.aborted is true.
 * TODO 5. Render: "Loading…" while loading, the error in red if there is one,
 *         and a card with name, email, phone and company.name when loaded.
 * TODO 6. "← Previous" is disabled at user 1. Try "Next" up to #11 to see the error state.
 *
 * Open DevTools → Network tab and click Next quickly: you'll see cancelled requests.
 */
import { useState } from 'react'

type User = {
  id: number
  name: string
  email: string
  phone: string
  company: { name: string }
}

export default function Ex5UserFetcher() {
  const [userId, setUserId] = useState(1)
  // TODO 1

  // TODO 2, 3, 4: useEffect(() => { ... }, [...])

  return (
    <div className="stack" style={{ maxWidth: 400 }}>
      <div className="row">
        <button className="btn" onClick={() => setUserId((id) => id - 1)}>
          ← Previous
        </button>
        <span className="badge">User #{userId}</span>
        <button className="btn" onClick={() => setUserId((id) => id + 1)}>
          Next →
        </button>
      </div>

      {/* TODO 5 */}
      <p className="muted">No data yet — write the effect!</p>
    </div>
  )
}
