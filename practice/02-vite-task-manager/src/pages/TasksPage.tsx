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
