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
