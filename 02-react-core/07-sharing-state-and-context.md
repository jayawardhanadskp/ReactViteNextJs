# React 07 — Sharing State: Lifting State Up, Context, and useReducer

> Flutter: lifting state up → `InheritedWidget` / `Provider` → `ChangeNotifier` / Bloc / Riverpod.
> React: lifting state up → **Context** → **`useReducer`** (+ libraries like Zustand).

## 1. Lifting state up

Two sibling components need the same data. Example: a search box filters a list.

```
       SearchPage            ← put the state HERE (closest common parent)
       ├── SearchBar         ← needs to CHANGE query
       └── ResultList        ← needs to READ query
```

```tsx
function SearchPage() {
  const [query, setQuery] = useState('')          // state lives in the parent

  return (
    <>
      <SearchBar value={query} onChange={setQuery} />   {/* down: value + callback */}
      <ResultList query={query} />                       {/* down: value */}
    </>
  )
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />
}

function ResultList({ query }: { query: string }) {
  const results = allItems.filter((i) => i.includes(query))
  return <ul>{results.map((r) => <li key={r}>{r}</li>)}</ul>
}
```

**Data goes down as props, events go up as callbacks.** Same as Flutter.

## 2. The problem: prop drilling

When the state is needed **deep** in the tree, you pass props through many components that don't use them:

```
App (user) → Layout (user) → Sidebar (user) → Menu (user) → Avatar (user)   😩
```

Flutter solved this with `InheritedWidget` / `Provider`. React solves it with **Context**.

## 3. Context — React's `Provider`

Three steps: **create** → **provide** → **consume**.

```tsx
// src/context/ThemeContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'
type ThemeContextValue = { theme: Theme; toggleTheme: () => void }

// ① CREATE — the default value is used only if there is no provider above
const ThemeContext = createContext<ThemeContextValue | null>(null)

// ② PROVIDE — a component that owns the state and shares it
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>
}

// ③ CONSUME — a custom hook so components don't touch the context directly
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
```

> In React 19 you render the context itself as the provider: `<ThemeContext value={...}>`.
> Older code (and many tutorials) write `<ThemeContext.Provider value={...}>` — same thing.

Wrap the app (like `ChangeNotifierProvider` at the top of `MaterialApp`):

```tsx
// main.tsx or App.tsx
<ThemeProvider>
  <App />
</ThemeProvider>
```

Use it anywhere below, no matter how deep (like `context.watch<Theme>()` / `Provider.of`):

```tsx
function Avatar() {
  const { theme, toggleTheme } = useTheme()
  return <button onClick={toggleTheme}>Current: {theme}</button>
}
```

When the provider's value changes, **every component that uses that context re-renders**.

### Good uses for Context

Theme, logged-in user / auth, language (i18n), a shopping cart, app settings — data many components
need. **Don't** put everything in one giant context; split by topic (`AuthContext`, `CartContext`).

## 4. `useReducer` — Bloc-style state

When state logic gets complex (many actions that change the same state), `useState` with many setters
gets messy. `useReducer` puts all update logic in **one pure function**:

```
 UI ──dispatch({ type: 'added', title })──▶  reducer(state, action) ──▶ new state ──▶ UI re-renders
```

Flutter Bloc comparison: **action = event**, **reducer = `on<Event>` handlers**, **state = state**.

```tsx
import { useReducer } from 'react'

type Todo = { id: string; title: string; done: boolean }

// All possible actions (like Bloc events) — a discriminated union
type Action =
  | { type: 'added'; title: string }
  | { type: 'toggled'; id: string }
  | { type: 'deleted'; id: string }
  | { type: 'clearedCompleted' }

// Pure function: (old state, action) → new state. No API calls, no mutation.
function todosReducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case 'added':
      return [...state, { id: crypto.randomUUID(), title: action.title, done: false }]
    case 'toggled':
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t))
    case 'deleted':
      return state.filter((t) => t.id !== action.id)
    case 'clearedCompleted':
      return state.filter((t) => !t.done)
  }
}

function TodoApp() {
  const [todos, dispatch] = useReducer(todosReducer, [])

  return (
    <>
      <button onClick={() => dispatch({ type: 'added', title: 'New task' })}>Add</button>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            <input type="checkbox" checked={t.done} onChange={() => dispatch({ type: 'toggled', id: t.id })} />
            {t.title}
            <button onClick={() => dispatch({ type: 'deleted', id: t.id })}>×</button>
          </li>
        ))}
      </ul>
      <button onClick={() => dispatch({ type: 'clearedCompleted' })}>Clear completed</button>
    </>
  )
}
```

Benefits: all changes in one place, easy to test (it's a plain function), components just "send events".

## 5. Context + Reducer = a mini state-management solution

Combine them to share complex state with the whole app (like `BlocProvider`):

```tsx
// src/context/TodosContext.tsx
import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react'

const TodosContext = createContext<{ todos: Todo[]; dispatch: Dispatch<Action> } | null>(null)

export function TodosProvider({ children }: { children: ReactNode }) {
  const [todos, dispatch] = useReducer(todosReducer, [])
  return <TodosContext value={{ todos, dispatch }}>{children}</TodosContext>
}

export function useTodos() {
  const ctx = useContext(TodosContext)
  if (!ctx) throw new Error('useTodos must be used inside <TodosProvider>')
  return ctx
}

// Any component:
const { todos, dispatch } = useTodos()
```

**Guided project #1 (Vite Task Manager) uses exactly this pattern** — you'll build it for real.

## 6. Which state tool when?

| Situation                                           | Use                                   | Flutter equivalent          |
| --------------------------------------------------- | ------------------------------------- | --------------------------- |
| Only one component needs it                         | `useState`                            | `setState`                  |
| Parent + a few children                             | lift state up + props                 | lift state up               |
| Complex update logic in one component               | `useReducer`                          | Bloc / Cubit (local)        |
| Many components across the app                      | Context (+ `useReducer`)              | Provider / BlocProvider     |
| Big app, lots of global state, performance matters  | **Zustand** or Redux Toolkit          | Riverpod / Bloc             |
| Data from a server (cache, refetch, loading)        | **TanStack Query** (Vite) / Server Components (Next) | FutureProvider / repository + cache |
| Data that should be in the URL (filters, page, tab) | URL search params (router)            | route arguments             |

## 7. Practice

👉 Do **Exercise 6 — Theme switcher** in `practice/01-react-playground`.

## Check yourself

1. Two siblings need the same state. Where do you put it?
2. What are the 3 steps to use Context?
3. In `useReducer`, what is a reducer allowed to do?

<details><summary>Answers</summary>

1. In their closest common parent, and pass it down with props + callbacks.
2. `createContext` → wrap a part of the tree with the provider and a `value` → `useContext` in children.
3. Only calculate and return the new state from (state, action). No mutations, no API calls, no randomness that should be outside (ids are a common exception).

</details>
