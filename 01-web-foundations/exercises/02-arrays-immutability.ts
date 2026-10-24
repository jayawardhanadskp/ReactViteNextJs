// Exercise 02 — Arrays and immutability (THE most important skill for React state)
// Run:  node 02-arrays-immutability.ts
//
// Rule: NEVER change (mutate) the input array or its objects.
//       Always RETURN A NEW array / object. React only re-renders when it gets a new reference.
// Allowed tools: [...arr, x], .map(), .filter(), .find(), .reduce(), { ...obj, key: value }
// Forbidden:     .push(), .splice(), .sort() on the original, arr[i] = x, obj.key = x
import { check, summary } from './check.ts'

export type Todo = { id: number; title: string; done: boolean }

// 1. Return a new array with a new todo at the END.
//    id = (biggest existing id) + 1, or 1 if the list is empty. done = false.
export function addTodo(todos: Todo[], title: string): Todo[] {
  return todos // TODO
}

// 2. Return a new array where the todo with this id has `done` flipped (true ↔ false).
//    Hint: todos.map(t => t.id === id ? { ...t, done: !t.done } : t)
export function toggleTodo(todos: Todo[], id: number): Todo[] {
  return todos // TODO
}

// 3. Return a new array without the todo with this id.
export function removeTodo(todos: Todo[], id: number): Todo[] {
  return todos // TODO
}

// 4. Return a new array where the todo with this id has the new title.
export function renameTodo(todos: Todo[], id: number, title: string): Todo[] {
  return todos // TODO
}

// 5. Return only the titles: ['Learn JS', ...]
export function titles(todos: Todo[]): string[] {
  return [] // TODO
}

// 6. Return { done: number, left: number }
export function stats(todos: Todo[]): { done: number; left: number } {
  return { done: -1, left: -1 } // TODO
}

// 7. Return a NEW array sorted by title A→Z. The original order must stay the same.
//    Hint: [...todos].sort((a, b) => a.title.localeCompare(b.title))
export function sortedByTitle(todos: Todo[]): Todo[] {
  return todos // TODO
}

// ---------- checks (don't edit below) ----------
console.log('Exercise 02 — arrays & immutability')
const start: Todo[] = [
  { id: 1, title: 'Learn JS', done: true },
  { id: 2, title: 'Learn React', done: false },
  { id: 3, title: 'Build app', done: false },
]
const snapshot = JSON.stringify(start)

const added = addTodo(start, 'Learn Next.js')
check('addTodo adds at end', added[3], { id: 4, title: 'Learn Next.js', done: false })
check('addTodo on empty list gives id 1', addTodo([], 'First')[0]?.id, 1)
check('addTodo returns a new array', added !== start, true)

const toggled = toggleTodo(start, 2)
check('toggleTodo flips done', toggled[1].done, true)
check('toggleTodo keeps others', toggled[0].done, true)
check('toggleTodo creates new object for changed item', toggled[1] !== start[1], true)

check('removeTodo', removeTodo(start, 1).map((t) => t.id), [2, 3])
check('renameTodo', renameTodo(start, 3, 'Ship app')[2].title, 'Ship app')
check('titles', titles(start), ['Learn JS', 'Learn React', 'Build app'])
check('stats', stats(start), { done: 1, left: 2 })
check('sortedByTitle', sortedByTitle(start).map((t) => t.id), [3, 1, 2])

check('ORIGINAL ARRAY WAS NOT MUTATED', JSON.stringify(start), snapshot)
summary()
