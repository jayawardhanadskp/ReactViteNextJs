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
