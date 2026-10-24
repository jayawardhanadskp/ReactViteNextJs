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
