# React 06 — `useEffect` and Fetching Data

> Flutter: `initState`, `dispose`, `didUpdateWidget`, `FutureBuilder`, `StreamBuilder`.
> React: **`useEffect`** (one hook for all of them).

## 1. What is an "effect"?

Your component function must be **pure** — it only calculates JSX. But apps need **side effects**:
calling an API, starting a timer, subscribing to a WebSocket, changing `document.title`, reading
`localStorage`. These must not run during render. They go inside `useEffect`, which runs
**after** React has updated the screen.

```tsx
import { useEffect, useState } from 'react'

function Page() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    document.title = `Clicked ${count} times`     // side effect
  }, [count])                                    // ← dependency array

  return <button onClick={() => setCount(count + 1)}>Click</button>
}
```

## 2. The dependency array controls WHEN it runs

```tsx
useEffect(() => { ... })              // ① no array: after EVERY render (rarely what you want)
useEffect(() => { ... }, [])          // ② empty: only once, after the first render → initState
useEffect(() => { ... }, [userId])    // ③ after first render AND whenever userId changes → didUpdateWidget
```

## 3. Cleanup = `dispose()`

Return a function from the effect. React calls it **before the effect runs again** and **when the
component is removed**.

```tsx
function Clock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)   // initState: start timer
    return () => clearInterval(id)                            // dispose: stop timer
  }, [])

  return <p>{now.toLocaleTimeString()}</p>
}
```

Flutter equivalent:

```dart
late Timer _timer;
@override
void initState() { super.initState(); _timer = Timer.periodic(Duration(seconds: 1), (_) => setState(() => now = DateTime.now())); }
@override
void dispose() { _timer.cancel(); super.dispose(); }
```

Without cleanup, every time the component re-mounts you get another timer → memory leaks and bugs.
**In development, StrictMode mounts → unmounts → mounts every component once** on purpose, to show you
missing cleanups. If your effect runs twice in dev, that's why. With a correct cleanup it doesn't matter.

Common things that need cleanup: `setInterval`, `setTimeout`, `addEventListener`, WebSocket,
subscriptions (Firebase `onSnapshot`), `AbortController` for fetch.

```tsx
useEffect(() => {
  function onResize() { setWidth(window.innerWidth) }
  window.addEventListener('resize', onResize)
  return () => window.removeEventListener('resize', onResize)
}, [])
```

## 4. Fetching data — the `FutureBuilder` pattern

`FutureBuilder` gives you `ConnectionState.waiting`, `hasError`, `hasData`. In React you keep those
three things in state yourself:

```tsx
import { useEffect, useState } from 'react'

type User = { id: number; name: string; email: string }

function UserCard({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()       // lets us cancel the request

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: User = await res.json()
        setUser(data)
      } catch (err) {
        if (controller.signal.aborted) return       // cancelled — ignore
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    load()
    return () => controller.abort()               // cleanup: cancel if userId changes or unmount
  }, [userId])                                    // refetch when userId changes

  if (loading) return <p>Loading…</p>
  if (error) return <p className="error">Error: {error}</p>
  if (!user) return null
  return (
    <div className="card">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}
```

Important details:

- **The effect function itself cannot be `async`.** (`useEffect(async () => ...)` is wrong, because an
  async function returns a Promise, but React expects a cleanup function.) So define an `async` function
  inside and call it.
- **Why abort?** If the user switches from user 1 to user 2 quickly, the response for user 1 might arrive
  **after** user 2's and overwrite it (a "race condition"). Aborting the old request fixes this.
- `fetch` does **not** throw on 404/500. Always check `res.ok`.

### Do you always need `useEffect` for data? (Modern answer)

`useEffect` + `fetch` is the **basic** way, and you must understand it. In real projects:

- **React + Vite apps** usually use **TanStack Query** (`useQuery`). It does loading/error/caching/retry/
  refetch for you — like a super `FutureBuilder`. See `05-whats-next.md`.
- **Next.js** fetches data in **Server Components** with plain `await` — no `useEffect` at all (lesson 04-nextjs/04).

## 5. The dependency array — rules and traps

**Rule: every value from the component (props, state, functions defined in the component) that you use
inside the effect must be in the dependency array.** The ESLint rule `react-hooks/exhaustive-deps` checks this.

```tsx
// ❌ Bug: uses `query` but doesn't list it → never refetches when query changes
useEffect(() => { search(query) }, [])

// ✅
useEffect(() => { search(query) }, [query])
```

### Trap: infinite loop

```tsx
// ❌ Effect sets state → re-render → effect runs again (no deps) → sets state → ...
useEffect(() => { setCount(count + 1) })
```

```tsx
// ❌ Object created during render is NEW every render → effect runs every render
const options = { userId }
useEffect(() => { fetchStuff(options) }, [options])

// ✅ Depend on primitive values
useEffect(() => { fetchStuff({ userId }) }, [userId])
```

## 6. When NOT to use `useEffect` (very common mistake)

Effects are for syncing with **outside systems**. You don't need one for:

```tsx
// ❌ Calculating data from props/state with an effect
const [fullName, setFullName] = useState('')
useEffect(() => { setFullName(first + ' ' + last) }, [first, last])

// ✅ Just calculate during render
const fullName = first + ' ' + last
```

```tsx
// ❌ Reacting to a click with an effect
useEffect(() => { if (submitted) sendForm() }, [submitted])

// ✅ Do it in the event handler
function handleSubmit() { sendForm() }
```

Rule of thumb: *"Is this caused by the component appearing on screen (or a value changing)? → effect.
Is it caused by a user action? → event handler. Can it be calculated? → just calculate it."*

## 7. Saving to `localStorage` (Flutter shared_preferences)

```tsx
function useLocalStorageExample() {
  // Lazy initial state: the function runs only on the first render
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'light')

  useEffect(() => {
    localStorage.setItem('theme', theme)          // sync with the outside system
  }, [theme])
}
```

`localStorage` only stores **strings**. For objects: `JSON.stringify` to save, `JSON.parse` to read.

## 8. Lifecycle summary

| Flutter                    | React                                                    |
| -------------------------- | -------------------------------------------------------- |
| `initState`                | `useEffect(() => { ... }, [])`                           |
| `dispose`                  | `return () => { ... }` inside that effect                |
| `didUpdateWidget(old)`     | `useEffect(() => { ... }, [prop])`                       |
| `build`                    | the component function body                              |
| `FutureBuilder`            | effect + `loading`/`error`/`data` state (or TanStack Query) |
| `StreamBuilder`            | effect that subscribes + cleanup that unsubscribes       |
| `WidgetsBinding.addPostFrameCallback` | `useEffect` (runs after paint)                |

## 9. Practice

👉 Do **Exercise 5 — User fetcher** in `practice/01-react-playground`.

## Check yourself

1. Why can't you write `useEffect(async () => {...})`?
2. Your effect starts a `setInterval`. What happens if you don't return a cleanup?
3. Why does my effect run twice in development?
4. Do you need an effect to compute a filtered list from state?

<details><summary>Answers</summary>

1. An async function returns a Promise, but React expects nothing or a cleanup function.
2. The timer keeps running after the component is removed, and a new timer is added each mount → leaks and duplicate updates.
3. StrictMode mounts, unmounts and mounts again in development to reveal missing cleanups.
4. No. Compute it during render.

</details>
