# React 10 — Routing with React Router (for Vite apps)

> Flutter: `Navigator`, named routes, **go_router**. React + Vite: **React Router**.
> (Next.js has routing built in — you'll learn it in the Next.js section.)

React itself has no routing. In a Vite app you add the **React Router** library.
If you know **go_router**, you'll feel at home: routes are URL paths, there are nested routes with a
shared shell, and path parameters like `/tasks/:id`.

## 1. How routing works in a SPA

On a normal website, clicking a link asks the server for a new HTML page. In a SPA:

1. The URL changes in the address bar (using the browser History API).
2. **No page reload.** React Router reads the URL and renders the matching component.
3. Back/forward buttons work, and you can bookmark/share URLs.

So "screens" in Flutter = "routes" (URL paths) on the web. **The URL is your navigation state.**

## 2. Install and set up

```bash
npm install react-router
```

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>        {/* like MaterialApp.router — enables routing for everything inside */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

## 3. Define routes

```tsx
// src/App.tsx
import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import About from './pages/About'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />     {/* anything else → 404 */}
    </Routes>
  )
}
```

Flutter (go_router):

```dart
GoRouter(routes: [
  GoRoute(path: '/', builder: (_, __) => const Home()),
  GoRoute(path: '/about', builder: (_, __) => const About()),
], errorBuilder: (_, __) => const NotFound());
```

## 4. Navigate with `<Link>` (not `<a>`)

```tsx
import { Link, NavLink } from 'react-router'

<Link to="/about">About</Link>

// NavLink knows if it is the current page → style the active tab
<NavLink to="/tasks" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
  Tasks
</NavLink>
```

> ⚠️ Using `<a href="/about">` makes the browser **reload the whole app** (state is lost).
> `<Link>` changes the URL without reloading. Use `<a>` only for **external** websites.

## 5. Navigate from code — `useNavigate` (Navigator.push)

```tsx
import { useNavigate } from 'react-router'

function LoginForm() {
  const navigate = useNavigate()

  async function handleSubmit() {
    await login()
    navigate('/dashboard')                    // Navigator.pushNamed / context.go
    // navigate('/dashboard', { replace: true }) → pushReplacement (can't go "back" to login)
    // navigate(-1)                            → Navigator.pop
  }
}
```

## 6. URL parameters — `/tasks/:id` (route arguments)

```tsx
<Route path="/tasks/:taskId" element={<TaskDetail />} />
```

```tsx
import { useParams } from 'react-router'

function TaskDetail() {
  const { taskId } = useParams()             // always a string (or undefined)
  const task = tasks.find((t) => t.id === taskId)
  if (!task) return <p>Task not found</p>
  return <h1>{task.title}</h1>
}

// Link to it
<Link to={`/tasks/${task.id}`}>{task.title}</Link>
```

Flutter go_router: `GoRoute(path: '/tasks/:taskId', builder: (c, s) => TaskDetail(id: s.pathParameters['taskId']!))`.

## 7. Query string — `/tasks?filter=done`

For filters, search, sort, page number. Keeping them in the URL means refresh and share keep the filter.

```tsx
import { useSearchParams } from 'react-router'

function TaskList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = searchParams.get('filter') ?? 'all'       // 'all' | 'active' | 'done'

  return (
    <>
      <button onClick={() => setSearchParams({ filter: 'done' })}>Done</button>
      {/* ... */}
    </>
  )
}
```

## 8. Nested routes and layouts — the shared `Scaffold` (go_router `ShellRoute`)

Most apps have a shared frame: app bar, navigation, footer. Only the middle changes.

```tsx
<Routes>
  <Route element={<AppLayout />}>                    {/* layout route: no path */}
    <Route index element={<Home />} />               {/* "/"       (index = default child) */}
    <Route path="tasks" element={<TaskList />} />    {/* "/tasks"  */}
    <Route path="tasks/:taskId" element={<TaskDetail />} />
    <Route path="about" element={<About />} />
  </Route>
  <Route path="login" element={<Login />} />         {/* no layout */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

```tsx
import { NavLink, Outlet } from 'react-router'

function AppLayout() {
  return (
    <div className="app">
      <header className="appbar">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/tasks">Tasks</NavLink>
        <NavLink to="/about">About</NavLink>
      </header>
      <main>
        <Outlet />          {/* ← the matching child route renders HERE (Scaffold body) */}
      </main>
    </div>
  )
}
```

`<Outlet />` = the slot where the child screen appears. The layout stays mounted while you move between
children, so its state is kept.

## 9. Protected routes (auth guard — go_router `redirect`)

```tsx
import { Navigate, Outlet } from 'react-router'

function RequireAuth() {
  const { user } = useAuth()                       // from your AuthContext
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

<Route element={<RequireAuth />}>
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="settings" element={<Settings />} />
</Route>
```

## 10. Hosting a SPA with routes (important!)

If a user opens `https://myapp.com/tasks/5` directly, the static host looks for a file `tasks/5` and
returns 404. You must configure the host to **always return `index.html`** (React Router then reads
the URL). On Netlify: a `public/_redirects` file with `/*  /index.html  200`. Vercel and Firebase
Hosting have a "rewrites" setting for SPAs. (Next.js doesn't have this problem.)

## 11. Other modes (good to know)

React Router has three ways to use it:
- **Declarative mode** (what we used: `<BrowserRouter>` + `<Routes>`) — simplest.
- **Data mode** (`createBrowserRouter` + `RouterProvider`) — adds `loader` functions that load data
  before a page renders, and `action`s for forms.
- **Framework mode** — React Router as a full framework (like Next.js) with server rendering.

Start with declarative. You'll use it in the Task Manager project.

## Check yourself

1. Why use `<Link>` instead of `<a>` for internal pages?
2. How do you read `:taskId` from the URL?
3. What does `<Outlet />` do?
4. Why should filter values often live in the URL instead of `useState`?

<details><summary>Answers</summary>

1. `<a>` reloads the whole page and loses all state. `<Link>` changes the URL without reloading.
2. `const { taskId } = useParams()`.
3. It renders the matching child route inside a layout route.
4. Refresh, back button and sharing the link keep the same filter.

</details>
