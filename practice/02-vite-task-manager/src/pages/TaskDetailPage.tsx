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
