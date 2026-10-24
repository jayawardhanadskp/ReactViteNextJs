# React 08 — `useRef`, `useMemo`, `useCallback`, and Custom Hooks

## 1. `useRef` — a box that survives renders but does NOT cause re-renders

```tsx
const ref = useRef(initialValue)
ref.current          // read
ref.current = 5      // write — no re-render!
```

Two main uses.

### a) Access a DOM element (Flutter: `FocusNode`, `GlobalKey`, `ScrollController`)

```tsx
import { useRef } from 'react'

function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <input ref={inputRef} placeholder="Search" />
      <button onClick={() => inputRef.current?.focus()}>Focus the input</button>
    </>
  )
}
```

React fills `inputRef.current` with the real `<input>` DOM element after rendering.
Other uses: `scrollIntoView()`, measuring size, playing a `<video>`, integrating a chart/map library.

In React 19, `ref` is a normal prop, so your own components can accept it:

```tsx
function MyInput({ ref, ...props }: ComponentProps<'input'>) {
  return <input ref={ref} className="my-input" {...props} />
}
```

### b) Remember a value without re-rendering (Flutter: a normal field in `State` that is not shown)

Timer IDs, previous values, "is this the first render" flags:

```tsx
function Stopwatch() {
  const [ms, setMs] = useState(0)
  const intervalRef = useRef<number | null>(null)   // the timer id is not shown on screen

  function start() {
    if (intervalRef.current !== null) return         // already running
    const startedAt = Date.now() - ms
    intervalRef.current = window.setInterval(() => setMs(Date.now() - startedAt), 50)
  }

  function stop() {
    if (intervalRef.current !== null) clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  useEffect(() => stop, [])   // cleanup on unmount

  return (/* ... */)
}
```

### `useState` vs `useRef`

|                                    | `useState`              | `useRef`                       |
| ---------------------------------- | ----------------------- | ------------------------------ |
| Changing it re-renders?            | ✅ yes                  | ❌ no                          |
| Shown in the UI?                   | yes                     | no (don't read `.current` in JSX) |
| Example                            | counter value, form text | timer id, DOM node, previous value |

## 2. `useMemo` — cache an expensive calculation

```tsx
const sorted = useMemo(
  () => hugeList.toSorted((a, b) => a.price - b.price),   // only recalculates when...
  [hugeList],                                              // ...hugeList changes
)
```

## 3. `useCallback` — cache a function

```tsx
const handleSelect = useCallback((id: string) => {
  setSelected(id)
}, [])
```

Used when you pass a function to a child wrapped in `React.memo`, or into an effect's dependency array.

### Do you need them?

**Usually not.** Start without them. React is fast. Add them only when you **measure** a performance
problem. Also, many new projects turn on the **React Compiler**, which adds this memoization
automatically. (Flutter comparison: like `const` constructors — nice optimisation, not required for
correctness.)

## 4. Custom hooks — reuse logic (not UI)

A component reuses **UI**. A custom hook reuses **stateful logic**. A custom hook is just a function
whose name starts with `use` and that calls other hooks.

Flutter comparison: a mixin on `State`, or a reusable `ChangeNotifier`/controller class. Custom hooks
are cleaner because each call gets its **own** state.

### Example 1: `useToggle`

```tsx
function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  const toggle = () => setOn((v) => !v)
  return [on, toggle] as const
}

// usage
const [isOpen, toggleOpen] = useToggle()
const [isDark, toggleDark] = useToggle(true)     // independent state
```

### Example 2: `useLocalStorage` — state that persists (shared_preferences)

```tsx
import { useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const saved = localStorage.getItem(key)
    return saved !== null ? (JSON.parse(saved) as T) : initialValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}

// usage — exactly like useState, but survives page reloads
const [name, setName] = useLocalStorage('name', '')
const [todos, setTodos] = useLocalStorage<Todo[]>('todos', [])
```

### Example 3: `useFetch` — the FutureBuilder logic from lesson 06, reusable

```tsx
type FetchState<T> = { data: T | null; loading: boolean; error: string | null }

export function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null })

  useEffect(() => {
    const controller = new AbortController()
    setState({ data: null, loading: true, error: null })

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<T>
      })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Error' })
      })

    return () => controller.abort()
  }, [url])

  return state
}

// usage — the component is now tiny
function Posts() {
  const { data, loading, error } = useFetch<Post[]>('https://jsonplaceholder.typicode.com/posts?_limit=5')
  if (loading) return <p>Loading…</p>
  if (error) return <p>{error}</p>
  return <ul>{data!.map((p) => <li key={p.id}>{p.title}</li>)}</ul>
}
```

### Example 4: `useDebounce` — wait until the user stops typing

```tsx
export function useDebounce<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)          // restart the timer on each keystroke
  }, [value, delayMs])
  return debounced
}

// usage: search API is called only 400ms after typing stops
const [query, setQuery] = useState('')
const debouncedQuery = useDebounce(query)
const { data } = useFetch(`/api/search?q=${debouncedQuery}`)
```

### Rules for custom hooks

- Name must start with `use` (so React and ESLint apply the rules of hooks).
- Each component that calls the hook gets **its own separate state**. Hooks share **logic**, not state.
  (To share state, use Context.)
- Put them in `src/hooks/useSomething.ts`.

## 5. Other hooks you'll meet

| Hook               | What for                                                                   |
| ------------------ | -------------------------------------------------------------------------- |
| `useId`            | generate unique ids for `htmlFor`/`id` pairs                               |
| `useTransition`    | mark a state update as "not urgent" so the UI stays responsive; gives `isPending` |
| `useDeferredValue` | show old results while new ones are computed (smooth search)               |
| `useActionState`   | form actions with pending/result state (used a lot in Next.js)            |
| `useOptimistic`    | show the result immediately before the server confirms (like optimistic UI in Flutter apps) |
| `use`              | read a Promise (with `<Suspense>`) or a Context                            |
| `useLayoutEffect`  | like `useEffect` but runs before paint (measuring layout). Rare.          |

## 6. Practice

👉 Do **Exercise 7 — Stopwatch** in `practice/01-react-playground` (uses `useRef`, `useEffect`
cleanup, and a custom hook).

## Check yourself

1. Changing `ref.current` — does the component re-render?
2. What makes a function a "custom hook"?
3. Two components call `useToggle()`. Do they share the same `on` value?

<details><summary>Answers</summary>

1. No.
2. Its name starts with `use` and it calls other hooks.
3. No. Each call has its own state. Hooks share logic, not state.

</details>
