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
