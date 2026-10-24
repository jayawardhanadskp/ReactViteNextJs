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
