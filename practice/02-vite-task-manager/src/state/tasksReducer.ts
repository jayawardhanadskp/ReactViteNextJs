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
