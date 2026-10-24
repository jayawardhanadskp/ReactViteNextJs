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
