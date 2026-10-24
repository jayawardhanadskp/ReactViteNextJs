# Guided Project #1 — Task Manager (React + Vite)

You will build a complete multi-page React app **from an empty folder**, step by step.
Every step explains **why**, compares it with **Flutter**, and gives you the **full code**.

The finished app is in this folder (`practice/02-vite-task-manager`). Run it first to see the goal:

```bash
cd practice/02-vite-task-manager
npm install
npm run dev
```

Then build your **own** copy in a different folder (for example `~/Desktop/my-task-manager`) by
following this tutorial. **Type the code** — don't copy-paste. Only look at the finished files when stuck.

---

## What you will build

```
┌────────────────────────────────────────────────────────────┐
│ ✅ Task Manager    [Dashboard] [Tasks 3] [About]           │  ← AppLayout (shared Scaffold)
├────────────────────────────────────────────────────────────┤
│  Tasks                                                     │
│  [ What do you need to do?          ] [Medium ▾] [Add task]│  ← TaskForm
│  ( All | Active | Done )  [ Search tasks…            ]     │  ← FilterBar (state in the URL)
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ☐ Read the React core lessons            high    ✕   │  │  ← TaskItem (CSS Module)
│  │ ☐ Finish the playground exercises        medium  ✕   │  │
│  │ ☑ ~~Build this task manager myself~~     low     ✕   │  │
│  └──────────────────────────────────────────────────────┘  │
│  Showing 3 of 3        [⬇ Import 5 sample tasks] [Clear 1] │  ← fetch from a real API
└────────────────────────────────────────────────────────────┘
   /             → Dashboard (stats, progress bar, derived data)
   /tasks        → the list above   (/tasks?status=active&q=react)
   /tasks/:id    → edit one task (title, priority, notes, done, delete)
   /about, /anything-else → About / 404
```

### Architecture (Flutter comparison)

| This app                         | File(s)                                   | Flutter equivalent                     |
| -------------------------------- | ----------------------------------------- | -------------------------------------- |
| Models                           | `src/types.ts`                            | `lib/models/task.dart`                 |
| State logic (pure)               | `src/state/tasksReducer.ts`               | a Bloc's event handlers                |
| State provider                   | `src/state/TasksContext.tsx`              | `BlocProvider` / `ChangeNotifierProvider` |
| Routes                           | `src/App.tsx`                             | `GoRouter(routes: [...])`              |
| Shared shell                     | `src/components/AppLayout.tsx`            | `ShellRoute` + `Scaffold`              |
| Screens                          | `src/pages/*.tsx`                         | `lib/screens/*.dart`                   |
| Reusable widgets                 | `src/components/*.tsx`                    | `lib/widgets/*.dart`                   |
| Persistence                      | `localStorage` in `TasksContext`          | `shared_preferences`                   |

### What you'll practise

Components & props · `useState` · controlled forms · lists & keys · `useReducer` · Context ·
`useEffect` · custom hooks · `fetch` · React Router (layout, params, search params, navigate) ·
CSS Modules · TypeScript types · building & deploying.

---

## Step 1 — Create the project

```bash
npm create vite@latest my-task-manager -- --template react-ts
cd my-task-manager
npm install
npm install react-router
npm run dev
```

Clean up the template:

1. Delete `src/App.css` and the `src/assets/` folder.
2. Empty `src/index.css` (we'll write our own in Step 6).
3. Replace `src/App.tsx` with:

```tsx
export default function App() {
  return <h1>Task Manager</h1>
}
```

You should see "Task Manager" in the browser. ✅

Create these folders inside `src/`: `state/`, `hooks/`, `components/`, `pages/`.

---

## Step 2 — The model types (`src/types.ts`)

Before any UI, define the shape of your data — like writing a Dart model class first.

📄 **`src/types.ts`**

```ts
// Shared types for the whole app (like a models/ folder in Flutter)

export type Priority = 'low' | 'medium' | 'high'

export type Task = {
  id: string
  title: string
  notes: string
  priority: Priority
  done: boolean
  createdAt: string // ISO date string — JSON can't store Date objects
}

export type StatusFilter = 'all' | 'active' | 'done'
```

Why `createdAt: string` and not `Date`? We'll save tasks with `JSON.stringify`, and JSON has no date
type. An ISO string (`"2026-10-19T08:30:00.000Z"`) is easy to save, sort and convert back with `new Date(...)`.

Why `Priority` as a union of strings instead of an enum? It's the TypeScript habit (lesson 02 of
web foundations): simple, works with JSON, and gives autocomplete.

---

## Step 3 — The reducer: all state changes in one place (`src/state/tasksReducer.ts`)

This is the "business logic". It has **no React** in it — just a pure function. In Bloc terms:
each `action` is an event, the `switch` is your `on<Event>` handlers, and the return value is the new state.

📄 **`src/state/tasksReducer.ts`**

```ts
// All the ways the task list can change, in ONE pure function.
// Flutter Bloc comparison: Action = Event, tasksReducer = the on<Event> handlers.
import type { Priority, Task } from '../types.ts'

export type TasksAction =
  | { type: 'added'; task: Task }
  | { type: 'toggled'; id: string }
  | { type: 'updated'; id: string; changes: Partial<Pick<Task, 'title' | 'notes' | 'priority'>> }
  | { type: 'deleted'; id: string }
  | { type: 'clearedCompleted' }
  | { type: 'imported'; tasks: Task[] }

export function tasksReducer(tasks: Task[], action: TasksAction): Task[] {
  switch (action.type) {
    case 'added':
      return [action.task, ...tasks]
    case 'toggled':
      return tasks.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t))
    case 'updated':
      return tasks.map((t) => (t.id === action.id ? { ...t, ...action.changes } : t))
    case 'deleted':
      return tasks.filter((t) => t.id !== action.id)
    case 'clearedCompleted':
      return tasks.filter((t) => !t.done)
    case 'imported':
      return [...action.tasks, ...tasks]
  }
}

// Creating a task needs random ids and the current time, which are NOT pure.
// So we create it here (outside the reducer) and send the finished task in the action.
export function createTask(title: string, priority: Priority = 'medium'): Task {
  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    notes: '',
    priority,
    done: false,
    createdAt: new Date().toISOString(),
  }
}
```

Things to notice:

- **Every case returns a NEW array** (`[...]`, `map`, `filter`). Never `push` or modify (lesson 03).
- `{ ...t, ...action.changes }` = Dart's `copyWith`.
- `Partial<Pick<Task, 'title' | 'notes' | 'priority'>>` means "an object with any of those 3 fields".
- **`createTask` is outside the reducer.** A reducer must be pure: same input → same output.
  `crypto.randomUUID()` and `new Date()` give different results each time, so we create the task first
  and put the finished task inside the action. (In development, StrictMode runs reducers twice to
  catch impure code!)
- TypeScript checks the `switch` is complete: if you add a new action type and forget a case,
  you get an error, like Dart's exhaustive `switch` on a sealed class.

---

## Step 4 — Share the state with Context (`src/state/TasksContext.tsx`)

Now we make the tasks available to **every** component, without passing props down through every
level — like putting a `BlocProvider` above `MaterialApp`.

📄 **`src/state/TasksContext.tsx`**

```tsx
// Context + useReducer = app-wide state (like BlocProvider / ChangeNotifierProvider at the top of the app)
import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react'
import type { Task } from '../types.ts'
import { createTask, tasksReducer, type TasksAction } from './tasksReducer.ts'

const STORAGE_KEY = 'task-manager:tasks'

type TasksContextValue = {
  tasks: Task[]
  dispatch: Dispatch<TasksAction>
}

const TasksContext = createContext<TasksContextValue | null>(null)

// Runs only once, on the first render (lazy initial state).
function loadTasks(): Task[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved) as Task[]
  } catch {
    // corrupted JSON or storage blocked → start with the welcome tasks
  }
  return [
    createTask('Read the React core lessons', 'high'),
    createTask('Finish the playground exercises', 'medium'),
    createTask('Build this task manager myself', 'low'),
  ]
}

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, dispatch] = useReducer(tasksReducer, undefined, loadTasks)

  // Sync with an outside system (localStorage) whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // storage full or blocked — the app keeps working in memory
    }
  }, [tasks])

  return <TasksContext value={{ tasks, dispatch }}>{children}</TasksContext>
}

// The linter prefers files that export only components (for hot reload). A hook next to its
// provider is a common, accepted exception.
// oxlint-disable-next-line react/only-export-components
export function useTasks() {
  const ctx = useContext(TasksContext)
  if (!ctx) throw new Error('useTasks must be used inside <TasksProvider>')
  return ctx
}
```

Line by line:

1. `createContext<TasksContextValue | null>(null)` — creates the "channel". `null` means "no provider".
2. `useReducer(tasksReducer, undefined, loadTasks)` — the **3rd argument** is a lazy initializer: it runs
   **once** to create the initial state. We load from `localStorage` (Flutter: `SharedPreferences.getString`).
   If nothing is saved, we start with 3 welcome tasks.
3. `useEffect(..., [tasks])` — every time `tasks` changes, save them. Saving is a **side effect**
   (talking to an outside system), so it belongs in an effect, not in the reducer.
4. `<TasksContext value={...}>` — provides the value to all children.
5. `useTasks()` — a custom hook so components write `const { tasks, dispatch } = useTasks()`.
   It throws a clear error if you forget the provider (better than a confusing `null` error).
6. `try/catch` around `localStorage` — it can throw (private browsing, storage full, corrupted JSON).
   The app must still work.

---

## Step 5 — Wire it up in `src/main.tsx`

📄 **`src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.tsx'
import { TasksProvider } from './state/TasksContext.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TasksProvider>
        <App />
      </TasksProvider>
    </BrowserRouter>
  </StrictMode>,
)
```

Order matters, like nesting providers in Flutter:

- `BrowserRouter` — enables routing (`MaterialApp.router`).
- `TasksProvider` — provides tasks to every page.
- `App` — the routes.

---

## Step 6 — Global styles (`src/index.css`)

Replace `src/index.css` with the file below. Read the comments: `:root` variables are your
`ThemeData`, `@media (prefers-color-scheme: dark)` is `ThemeMode.system`, and `.row` / `.stack` are
`Row` / `Column`.

<details>
<summary>📄 Click to show <code>src/index.css</code></summary>

📄 **`src/index.css`**

```css
/* Global styles. Think of :root variables as your ThemeData. */
:root {
  --bg: #f8fafc;
  --surface: #ffffff;
  --text: #0f172a;
  --muted: #64748b;
  --border: #e2e8f0;
  --primary: #4f46e5;
  --primary-dark: #4338ca;
  --danger: #dc2626;
  --radius: 12px;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: var(--text);
  background: var(--bg);
  line-height: 1.5;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0b1120;
    --surface: #111827;
    --text: #e5e7eb;
    --muted: #94a3b8;
    --border: #1f2937;
    --primary: #818cf8;
    --primary-dark: #6366f1;
  }
}

*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; }
h1, h2, p { margin: 0; }
h1 { font-size: 1.75rem; }
h2 { font-size: 1.1rem; }
a { color: var(--primary); }
ul { margin: 0; padding-left: 20px; }
code { background: var(--border); padding: 1px 6px; border-radius: 6px; font-size: 0.9em; }

/* ---------- layout ---------- */
.appbar {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
  padding: 12px 24px; background: var(--surface); border-bottom: 1px solid var(--border);
}
.brand { font-weight: 700; font-size: 1.1rem; }
.nav { display: flex; gap: 4px; }
.nav-link {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 8px; color: var(--muted); text-decoration: none; font-weight: 500;
}
.nav-link:hover { background: var(--bg); color: var(--text); }
.nav-link.active { background: var(--primary); color: white; }
.pill {
  font-size: 0.7rem; background: var(--danger); color: white; border-radius: 999px; padding: 0 7px;
}
.page { max-width: 760px; margin: 0 auto; padding: 32px 20px 64px; }

/* ---------- helpers ---------- */
.stack { display: flex; flex-direction: column; gap: 16px; }
.row { display: flex; align-items: center; gap: 12px; }
.wrap { flex-wrap: wrap; }
.spacer { flex: 1; }
.muted { color: var(--muted); }
.error { color: var(--danger); font-size: 0.875rem; }
.card {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px;
}
.card.warning { border-color: #fca5a5; }
.empty { text-align: center; padding: 40px; color: var(--muted); border: 2px dashed var(--border); border-radius: var(--radius); }

/* ---------- form controls ---------- */
.btn {
  border: 1px solid var(--border); background: var(--surface); color: var(--text);
  padding: 8px 14px; border-radius: 8px; font: inherit; cursor: pointer; white-space: nowrap;
}
.btn:hover:not(:disabled) { border-color: var(--muted); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: var(--primary); border-color: var(--primary); color: white; }
.btn-primary:hover:not(:disabled) { background: var(--primary-dark); border-color: var(--primary-dark); }
.btn-danger { color: var(--danger); }

.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-weight: 600; font-size: 0.9rem; }
.input {
  border: 1px solid var(--border); background: var(--surface); color: var(--text);
  border-radius: 8px; padding: 9px 12px; font: inherit;
}
.input:focus { outline: 2px solid var(--primary); outline-offset: 1px; }
textarea.input { resize: vertical; }

/* ---------- tasks page ---------- */
.task-form { display: flex; gap: 8px; }
.task-form .input:first-child { flex: 1; }
.filter-bar { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.search { flex: 1; min-width: 180px; }
.segmented { display: flex; background: var(--border); padding: 3px; border-radius: 10px; }
.segmented button {
  border: 0; background: none; color: var(--text); padding: 6px 14px; border-radius: 8px; font: inherit; cursor: pointer;
}
.segmented button.active { background: var(--surface); font-weight: 600; box-shadow: 0 1px 3px rgb(0 0 0 / 15%); }
.task-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }

/* ---------- dashboard ---------- */
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.stat { display: flex; flex-direction: column; align-items: center; }
.stat-value { font-size: 2rem; font-weight: 700; }
.progress { height: 10px; background: var(--border); border-radius: 999px; overflow: hidden; }
.progress-bar { height: 100%; background: var(--primary); transition: width 300ms ease; }

/* ---------- small screens (MediaQuery) ---------- */
@media (max-width: 560px) {
  .task-form { flex-direction: column; }
  .appbar { gap: 8px; padding: 10px 16px; }
}
```

</details>

---

## Step 7 — Routes and the shared layout

### 7a. Create placeholder pages first

Create each file in `src/pages/` with a simple component, so the routes work right away.
For example `src/pages/DashboardPage.tsx`:

```tsx
export default function DashboardPage() {
  return <h1>Dashboard</h1>
}
```

Do the same for `TasksPage.tsx`, `TaskDetailPage.tsx`, `AboutPage.tsx` and `NotFoundPage.tsx`
(with different headings). We'll fill them in later.

### 7b. The routes (`src/App.tsx`)

📄 **`src/App.tsx`**

```tsx
// All routes in one place (like the routes list of go_router)
import { Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout.tsx'
import AboutPage from './pages/AboutPage.tsx'
import DashboardPage from './pages/DashboardPage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'
import TaskDetailPage from './pages/TaskDetailPage.tsx'
import TasksPage from './pages/TasksPage.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="tasks/:taskId" element={<TaskDetailPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
```

- The parent `<Route element={<AppLayout />}>` has **no path**: it's a *layout route*. Every child is shown
  inside it. Flutter go_router: `ShellRoute`.
- `index` = the default child for `/`.
- `tasks/:taskId` — `:taskId` is a URL parameter (`GoRoute(path: 'tasks/:taskId')`).
- `*` = anything else → 404. Because it's inside the layout, the 404 page still has the app bar.

### 7c. The layout (`src/components/AppLayout.tsx`)

📄 **`src/components/AppLayout.tsx`**

```tsx
// The shared "Scaffold": app bar + navigation + the current page in <Outlet />
import { NavLink, Outlet } from 'react-router'
import { useTasks } from '../state/TasksContext.tsx'

const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'nav-link active' : 'nav-link')

export default function AppLayout() {
  const { tasks } = useTasks()
  const activeCount = tasks.filter((t) => !t.done).length

  return (
    <div className="layout">
      <header className="appbar">
        <span className="brand">✅ Task Manager</span>
        <nav className="nav">
          <NavLink to="/" end className={navClass}>
            Dashboard
          </NavLink>
          <NavLink to="/tasks" className={navClass}>
            Tasks {activeCount > 0 && <span className="pill">{activeCount}</span>}
          </NavLink>
          <NavLink to="/about" className={navClass}>
            About
          </NavLink>
        </nav>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  )
}
```

- `<NavLink>` is a `<Link>` that knows if it's active. We pass a function to `className` to style the
  current tab.
- `end` on the `/` link: without it, `/` would be "active" on every page (every URL starts with `/`).
- `<Outlet />` is where the current page appears — like the `body:` of a `Scaffold` in a `ShellRoute`.
- The badge count comes from context: the layout re-renders when tasks change.

✅ Check: click the nav links. The URL changes, the page changes, **the browser does not reload**
(the Network tab shows no new document request). Try a wrong URL like `/xyz` → 404 page.

---

## Step 8 — Add tasks (`src/components/TaskForm.tsx`)

A **controlled form** (lesson 04): React state is the single source of truth for the inputs.

📄 **`src/components/TaskForm.tsx`**

```tsx
// Controlled form to add a task
import { useState, type FormEvent } from 'react'
import { createTask } from '../state/tasksReducer.ts'
import { useTasks } from '../state/TasksContext.tsx'
import type { Priority } from '../types.ts'

export default function TaskForm() {
  const { dispatch } = useTasks()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')

  const canSubmit = title.trim().length > 0

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit) return
    dispatch({ type: 'added', task: createTask(title, priority) })
    setTitle('')
    setPriority('medium')
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        className="input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What do you need to do?"
        aria-label="Task title"
        autoFocus
      />
      <select
        className="input"
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
        aria-label="Priority"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button className="btn btn-primary" disabled={!canSubmit}>
        Add task
      </button>
    </form>
  )
}
```

- `e.preventDefault()` — stops the browser's old-style form submit (page reload).
- `dispatch({ type: 'added', task: createTask(...) })` — send the "event". The form does **not** know
  how the list is stored. Like `context.read<TasksBloc>().add(TaskAdded(...))`.
- `e.target.value as Priority` — the `<select>` gives a `string`; we tell TypeScript it's one of our values.
- `canSubmit` is **derived** — no extra state.

---

## Step 9 — One task row with a CSS Module

### `src/components/TaskItem.module.css`

📄 **`src/components/TaskItem.module.css`**

```css
/* CSS Module: these class names are made unique by Vite, so `.item` here
   can never clash with an `.item` class anywhere else in the app. */

.item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: box-shadow 150ms;
}
.item:hover { box-shadow: 0 2px 8px rgb(0 0 0 / 8%); }

.checkbox { width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer; }

.title {
  flex: 1;                         /* Expanded */
  color: var(--text);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;         /* TextOverflow.ellipsis */
  white-space: nowrap;
}
.title:hover { color: var(--primary); }
.done { text-decoration: line-through; color: var(--muted); }

.priority {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
  text-transform: capitalize;
}
.low { background: #dcfce7; color: #166534; }
.medium { background: #fef9c3; color: #854d0e; }
.high { background: #fee2e2; color: #991b1b; }

.delete {
  border: 0;
  background: none;
  color: var(--muted);
  cursor: pointer;
  font-size: 1rem;
  padding: 4px 8px;
  border-radius: 6px;
}
.delete:hover { background: #fee2e2; color: var(--danger); }
```

### `src/components/TaskItem.tsx`

📄 **`src/components/TaskItem.tsx`**

```tsx
// One row in the list. Styled with a CSS Module (scoped class names).
import { Link } from 'react-router'
import { useTasks } from '../state/TasksContext.tsx'
import type { Task } from '../types.ts'
import styles from './TaskItem.module.css'

export default function TaskItem({ task }: { task: Task }) {
  const { dispatch } = useTasks()

  return (
    <li className={styles.item}>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={task.done}
        onChange={() => dispatch({ type: 'toggled', id: task.id })}
        aria-label={`Mark "${task.title}" as ${task.done ? 'not done' : 'done'}`}
      />
      <Link to={`/tasks/${task.id}`} className={task.done ? `${styles.title} ${styles.done}` : styles.title}>
        {task.title}
      </Link>
      <span className={`${styles.priority} ${styles[task.priority]}`}>{task.priority}</span>
      <button
        className={styles.delete}
        onClick={() => dispatch({ type: 'deleted', id: task.id })}
        aria-label={`Delete "${task.title}"`}
      >
        ✕
      </button>
    </li>
  )
}
```

- `import styles from './TaskItem.module.css'` — every class becomes a property: `styles.item`,
  `styles.title`. Vite makes the real class name unique (open DevTools → Elements to see something
  like `_item_1x2y3_1`).
- `styles[task.priority]` — picks `styles.low`, `styles.medium` or `styles.high` dynamically.
- The title is a `<Link>` to the detail page: `/tasks/<id>`.
- `aria-label` gives screen readers a meaningful name for icon-only buttons (like Flutter's `Semantics`/`tooltip`).

---

## Step 10 — The Tasks page with filters in the URL

### `src/components/FilterBar.tsx`

A "dumb" component: it gets values and callbacks as props, and doesn't know where they're stored.

📄 **`src/components/FilterBar.tsx`**

```tsx
// Status filter + search. The values live in the URL (?status=done&q=react),
// so refresh / back button / sharing the link keep the same filter.
import type { StatusFilter } from '../types.ts'

type FilterBarProps = {
  status: StatusFilter
  query: string
  onStatusChange: (status: StatusFilter) => void
  onQueryChange: (query: string) => void
}

const options: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Done' },
]

export default function FilterBar({ status, query, onStatusChange, onQueryChange }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="segmented" role="group" aria-label="Filter by status">
        {options.map((o) => (
          <button
            key={o.value}
            className={status === o.value ? 'active' : ''}
            aria-pressed={status === o.value}
            onClick={() => onStatusChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <input
        className="input search"
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search tasks…"
        aria-label="Search tasks"
      />
    </div>
  )
}
```

### `src/pages/TasksPage.tsx`

📄 **`src/pages/TasksPage.tsx`**

```tsx
import { useSearchParams } from 'react-router'
import FilterBar from '../components/FilterBar.tsx'
import ImportSampleTasks from '../components/ImportSampleTasks.tsx'
import TaskForm from '../components/TaskForm.tsx'
import TaskItem from '../components/TaskItem.tsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { useTasks } from '../state/TasksContext.tsx'
import type { StatusFilter } from '../types.ts'

function toStatus(value: string | null): StatusFilter {
  return value === 'active' || value === 'done' ? value : 'all'
}

export default function TasksPage() {
  useDocumentTitle('Tasks')
  const { tasks, dispatch } = useTasks()
  const [searchParams, setSearchParams] = useSearchParams()

  // Filter state lives in the URL: /tasks?status=active&q=react
  const status = toStatus(searchParams.get('status'))
  const query = searchParams.get('q') ?? ''

  function updateParam(key: string, value: string, defaultValue: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === defaultValue) next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: true }, // don't add a history entry for every keystroke
    )
  }

  // Derived list — calculated on every render
  const visible = tasks.filter((t) => {
    const matchesStatus = status === 'all' || (status === 'done' ? t.done : !t.done)
    const matchesQuery = t.title.toLowerCase().includes(query.trim().toLowerCase())
    return matchesStatus && matchesQuery
  })
  const doneCount = tasks.filter((t) => t.done).length

  return (
    <div className="stack">
      <h1>Tasks</h1>
      <TaskForm />
      <FilterBar
        status={status}
        query={query}
        onStatusChange={(s) => updateParam('status', s, 'all')}
        onQueryChange={(q) => updateParam('q', q, '')}
      />

      {visible.length === 0 ? (
        <p className="empty">{tasks.length === 0 ? 'No tasks yet — add one above 🎉' : 'No tasks match this filter.'}</p>
      ) : (
        <ul className="task-list">
          {visible.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}

      <footer className="row wrap">
        <span className="muted">
          Showing {visible.length} of {tasks.length}
        </span>
        <span className="spacer" />
        <ImportSampleTasks />
        {doneCount > 0 && (
          <button className="btn" onClick={() => dispatch({ type: 'clearedCompleted' })}>
            Clear {doneCount} completed
          </button>
        )}
      </footer>
    </div>
  )
}
```

The big idea: **the filter lives in the URL**, not in `useState`.

- `useSearchParams()` reads/writes the `?status=active&q=react` part of the URL.
- Refresh the page → the filter stays. Copy the URL to a friend → they see the same filter.
  Press the browser Back button → the previous filter comes back.
- `{ replace: true }` replaces the current history entry instead of adding one per keystroke.
- `toStatus()` protects us from bad URLs like `?status=banana`.
- `visible` is **derived** from `tasks` + the URL. No duplicated state.
- `key={task.id}` on each `TaskItem` — stable ids, never the index (lesson 05).
- `{doneCount > 0 && ...}` — a real boolean, avoiding the `0 &&` trap.

✅ Check: add tasks, tick them, filter, search, refresh the page — everything is still there
(thanks to `localStorage`). Open DevTools → **Application → Local Storage** to see the saved JSON.

---

## Step 11 — Edit one task (`src/pages/TaskDetailPage.tsx`)

📄 **`src/pages/TaskDetailPage.tsx`**

```tsx
// /tasks/:taskId — read the URL parameter, edit the task, delete it.
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { useTasks } from '../state/TasksContext.tsx'
import type { Priority, Task } from '../types.ts'

export default function TaskDetailPage() {
  const { taskId } = useParams()
  const { tasks } = useTasks()
  const task = tasks.find((t) => t.id === taskId)

  if (!task) {
    return (
      <div className="stack">
        <h1>Task not found</h1>
        <p className="muted">It may have been deleted.</p>
        <Link to="/tasks">← Back to tasks</Link>
      </div>
    )
  }

  // key={task.id}: if the URL changes to another task, React creates a fresh editor
  // (fresh form state) instead of keeping the old task's text.
  return <TaskEditor key={task.id} task={task} />
}

function TaskEditor({ task }: { task: Task }) {
  useDocumentTitle(task.title)
  const { dispatch } = useTasks()
  const navigate = useNavigate()

  // Local form state, starting from the task's current values
  const [title, setTitle] = useState(task.title)
  const [notes, setNotes] = useState(task.notes)
  const [priority, setPriority] = useState<Priority>(task.priority)

  const hasChanges = title !== task.title || notes !== task.notes || priority !== task.priority
  const isValid = title.trim().length > 0

  function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isValid) return
    dispatch({ type: 'updated', id: task.id, changes: { title: title.trim(), notes, priority } })
    navigate('/tasks') // Navigator.pop() would be navigate(-1)
  }

  function handleDelete() {
    if (!window.confirm(`Delete "${task.title}"?`)) return
    dispatch({ type: 'deleted', id: task.id })
    navigate('/tasks', { replace: true }) // replace: the deleted page is removed from history
  }

  return (
    <form className="stack" onSubmit={handleSave}>
      <Link to="/tasks">← Back to tasks</Link>
      <h1>Edit task</h1>

      <div className="field">
        <label htmlFor="title">Title</label>
        <input id="title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        {!isValid && <p className="error">Title cannot be empty</p>}
      </div>

      <div className="field">
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          className="input"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          className="input"
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add some details…"
        />
      </div>

      <label className="row">
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => dispatch({ type: 'toggled', id: task.id })}
        />
        Done
      </label>

      <p className="muted">Created {new Date(task.createdAt).toLocaleString()}</p>

      <div className="row">
        <button type="submit" className="btn btn-primary" disabled={!hasChanges || !isValid}>
          Save changes
        </button>
        <button type="button" className="btn" onClick={() => navigate(-1)}>
          Cancel
        </button>
        <span className="spacer" />
        <button type="button" className="btn btn-danger" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </form>
  )
}
```

- `useParams()` reads `:taskId` from the URL. It's a `string | undefined`.
- If the task doesn't exist (deleted, or wrong URL), we show a friendly message — **early return**.
- **Two components:** `TaskDetailPage` finds the task, `TaskEditor` edits it. Why split?
  The editor has **local form state** initialised from the task (`useState(task.title)`).
  `useState` only uses its initial value on the **first** render. With `key={task.id}`, React creates a
  **new** `TaskEditor` (fresh state) if the URL points to a different task. This `key` trick is the
  React way to "reset" a component — like giving a widget a new `Key` in Flutter.
- `navigate('/tasks')` after saving = `context.go('/tasks')`. `navigate(-1)` = `Navigator.pop()`.
- After deleting we use `{ replace: true }` so Back doesn't return to a page that no longer exists.
- `hasChanges` (derived) disables Save until something changed.

---

## Step 12 — The Dashboard: everything derived (`src/pages/DashboardPage.tsx`)

📄 **`src/pages/DashboardPage.tsx`**

```tsx
// Everything here is DERIVED from the task list — no extra state.
import { Link } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { useTasks } from '../state/TasksContext.tsx'
import type { Priority } from '../types.ts'

const priorities: Priority[] = ['high', 'medium', 'low']

export default function DashboardPage() {
  useDocumentTitle('Dashboard')
  const { tasks } = useTasks()

  const total = tasks.length
  const done = tasks.filter((t) => t.done).length
  const progress = total === 0 ? 0 : Math.round((done / total) * 100)
  const openHighPriority = tasks.filter((t) => !t.done && t.priority === 'high')
  const recent = tasks.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3)

  return (
    <div className="stack">
      <h1>Dashboard</h1>

      <section className="stats">
        <div className="card stat">
          <span className="stat-value">{total}</span>
          <span className="muted">Total</span>
        </div>
        <div className="card stat">
          <span className="stat-value">{total - done}</span>
          <span className="muted">Active</span>
        </div>
        <div className="card stat">
          <span className="stat-value">{done}</span>
          <span className="muted">Done</span>
        </div>
      </section>

      <section className="card stack">
        <div className="row">
          <h2>Progress</h2>
          <span className="spacer" />
          <strong>{progress}%</strong>
        </div>
        <div className="progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="row wrap">
          {priorities.map((p) => (
            <span key={p} className="muted">
              {p}: {tasks.filter((t) => t.priority === p && !t.done).length} open
            </span>
          ))}
        </div>
      </section>

      {openHighPriority.length > 0 && (
        <section className="card stack warning">
          <h2>🔥 High priority</h2>
          <ul>
            {openHighPriority.map((t) => (
              <li key={t.id}>
                <Link to={`/tasks/${t.id}`}>{t.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card stack">
        <h2>Recently added</h2>
        {recent.length === 0 ? (
          <p className="muted">
            No tasks yet. <Link to="/tasks">Add your first task →</Link>
          </p>
        ) : (
          <ul>
            {recent.map((t) => (
              <li key={t.id}>
                <Link to={`/tasks/${t.id}`}>{t.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
```

There is **no new state** on this page. Every number is calculated from `tasks` during render.
When a task changes anywhere, the dashboard is automatically correct.

- `tasks.toSorted(...)` returns a **new** sorted array (`.sort()` would mutate the state — a bug!).
- `` style={{ width: `${progress}%` }} `` — inline style for a value computed from data.
- `role="progressbar"` + `aria-*` attributes make the bar accessible.

---

## Step 13 — Fetch from a real API (`src/components/ImportSampleTasks.tsx`)

📄 **`src/components/ImportSampleTasks.tsx`**

```tsx
// Fetch data from a real API when the user clicks (an EVENT, so no useEffect needed).
import { useState } from 'react'
import { useTasks } from '../state/TasksContext.tsx'
import type { Task } from '../types.ts'

type ApiTodo = { userId: number; id: number; title: string; completed: boolean }

export default function ImportSampleTasks() {
  const { dispatch } = useTasks()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleImport() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5')
      if (!res.ok) throw new Error(`Server answered ${res.status}`)
      const todos: ApiTodo[] = await res.json()

      // Convert the API shape into OUR Task shape (like a fromJson mapper)
      const tasks: Task[] = todos.map((t) => ({
        id: crypto.randomUUID(),
        title: t.title,
        notes: `Imported from JSONPlaceholder (todo #${t.id})`,
        priority: 'low',
        done: t.completed,
        createdAt: new Date().toISOString(),
      }))
      dispatch({ type: 'imported', tasks })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not import tasks')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row">
      <button className="btn" onClick={handleImport} disabled={loading}>
        {loading ? 'Importing…' : '⬇ Import 5 sample tasks'}
      </button>
      {error && <span className="error">⚠️ {error}</span>}
    </div>
  )
}
```

- This fetch happens because the **user clicked**, so it lives in the **event handler**, not in `useEffect`.
  (Effects are for "because the component appeared / a value changed".)
- The classic trio of states: `loading`, `error`, and the data (here sent to the reducer).
- `todos.map(...)` converts the API's shape into our `Task` shape — like `Task.fromJson`.
- `finally` always runs, so `loading` is reset on success **and** on error.

✅ Check: Network tab → click Import → you see the request to `jsonplaceholder.typicode.com`.
Turn on "Offline" in the Network tab and click again → the error message appears.

---

## Step 14 — A custom hook, About and 404

### `src/hooks/useDocumentTitle.ts`

📄 **`src/hooks/useDocumentTitle.ts`**

```ts
import { useEffect } from 'react'

// A tiny custom hook: sets the browser tab title while the page is shown.
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} · Task Manager`
    return () => {
      document.title = previous
    }
  }, [title])
}
```

Each page calls `useDocumentTitle('Tasks')` and the browser tab title changes. The cleanup restores the
old title when the page is left. You already use it in the pages above.

### `src/pages/AboutPage.tsx`

📄 **`src/pages/AboutPage.tsx`**

```tsx
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'

export default function AboutPage() {
  useDocumentTitle('About')

  return (
    <div className="stack">
      <h1>About</h1>
      <p>
        A practice project for Flutter developers learning <strong>React + Vite</strong>.
      </p>
      <div className="card stack">
        <h2>What this app uses</h2>
        <ul>
          <li>
            <strong>React Router</strong> — layout route, nested routes, <code>:taskId</code> params, search params
          </li>
          <li>
            <strong>Context + useReducer</strong> — app-wide task state (like BlocProvider)
          </li>
          <li>
            <strong>useEffect</strong> — saving to <code>localStorage</code>, setting the tab title
          </li>
          <li>
            <strong>fetch</strong> — importing sample tasks from JSONPlaceholder
          </li>
          <li>
            <strong>CSS Modules</strong> — scoped styles for <code>TaskItem</code>
          </li>
        </ul>
      </div>
      <p className="muted">Your tasks are saved in this browser only (localStorage). There is no backend.</p>
    </div>
  )
}
```

### `src/pages/NotFoundPage.tsx`

📄 **`src/pages/NotFoundPage.tsx`**

```tsx
import { Link, useLocation } from 'react-router'

export default function NotFoundPage() {
  const location = useLocation()

  return (
    <div className="stack">
      <h1>404 — Page not found</h1>
      <p className="muted">
        There is no page at <code>{location.pathname}</code>.
      </p>
      <Link to="/">← Go to the dashboard</Link>
    </div>
  )
}
```

`useLocation()` gives the current URL — handy for showing which path was not found.

---

## Step 15 — Build, check and deploy

```bash
npm run lint       # oxlint — like flutter analyze
npm run build      # type-check + production bundle in dist/
npm run preview    # test the production build locally
```

### The SPA routing problem when deploying

Open `http://localhost:4173/tasks` directly in `npm run preview` — it works, because Vite's preview
server knows about SPAs. But many static hosts would return **404** for `/tasks`, because there is no
file called `tasks` — only `index.html`. Fix for **Netlify**: create `public/_redirects` with:

```
/*    /index.html   200
```

(It's already in the finished project.) Vercel/Firebase have a similar "rewrite all to index.html"
setting. Then drag the `dist/` folder onto https://app.netlify.com/drop, or connect your GitHub repo.

---

## Step 16 — Challenges (do at least 3)

1. **Due dates** — add `dueDate?: string` to `Task`, an `<input type="date">` in the editor, and show
   overdue tasks in red on the dashboard.
2. **Sort** — add `?sort=newest|oldest|priority` to the URL and sort the visible list (use `toSorted`!).
3. **Undo delete** — after deleting, show a "Task deleted · Undo" bar for 5 seconds (like a Flutter
   `SnackBar` with an action). Hint: keep the last deleted task in state + `setTimeout` in an effect with cleanup.
4. **Edit inline** — double-click a title in the list to rename it without opening the detail page.
5. **Tests** — install Vitest (`npm i -D vitest`) and write tests for `tasksReducer` (it's a pure function,
   so it's easy — like testing a Bloc).
6. **Tailwind** — restyle the whole app with Tailwind (see lesson 02-react-core/09).
7. **Backend** — replace `localStorage` with Firebase Firestore or Supabase (you know Firebase from Flutter!).

When you're done, continue with **Next.js**: [04-nextjs/01-why-nextjs-and-rendering.md](../../04-nextjs/01-why-nextjs-and-rendering.md)
