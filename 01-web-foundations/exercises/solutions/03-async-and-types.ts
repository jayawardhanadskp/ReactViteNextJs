// Exercise 03 — async/await, Promise.all, try/catch and TypeScript union types
// Run:  node 03-async-and-types.ts
// (Uses a fake API with setTimeout, so it works without internet.)
import { check, summary } from '../check.ts'

// ---------- fake API (don't edit) ----------
type User = { id: number; name: string }
type Post = { id: number; userId: number; title: string }

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function apiGetUser(id: number): Promise<User> {
  await wait(100)
  if (id <= 0) throw new Error('User not found')
  return { id, name: `User ${id}` }
}

async function apiGetPosts(userId: number): Promise<Post[]> {
  await wait(100)
  return [
    { id: 1, userId, title: 'Hello' },
    { id: 2, userId, title: 'World' },
  ]
}
// -------------------------------------------

// 1. Return the user's name in UPPERCASE.  Hint: const user = await apiGetUser(id)
export async function loadUserName(id: number): Promise<string> {
  const user = await apiGetUser(id)
  return user.name.toUpperCase()
}

// 2. Load the user AND their posts IN PARALLEL with Promise.all (Dart: Future.wait).
//    Return { name, postCount }.
export async function loadProfile(id: number): Promise<{ name: string; postCount: number }> {
  // Both requests start at the same time. Awaiting them one by one would take twice as long.
  const [user, posts] = await Promise.all([apiGetUser(id), apiGetPosts(id)])
  return { name: user.name, postCount: posts.length }
}

// 3. A discriminated union — like a Dart sealed class.
export type LoadResult =
  | { status: 'success'; user: User }
  | { status: 'error'; message: string }

//    Call apiGetUser. If it works → { status: 'success', user }.
//    If it throws → { status: 'error', message: <the error's message> }.
//    Hint: try { ... } catch (err) { ... }  and  err instanceof Error ? err.message : 'Unknown'
export async function safeLoadUser(id: number): Promise<LoadResult> {
  try {
    const user = await apiGetUser(id)
    return { status: 'success', user }
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : 'Unknown' }
  }
}

// 4. Turn a LoadResult into text using a switch on `status`:
//    success → "Loaded <name>",  error → "Error: <message>"
export function describe(result: LoadResult): string {
  switch (result.status) {
    case 'success':
      return `Loaded ${result.user.name}` // TS knows `user` exists here
    case 'error':
      return `Error: ${result.message}` // TS knows `message` exists here
  }
}

// ---------- checks (don't edit below) ----------
console.log('Exercise 03 — async & types')
check('loadUserName', await loadUserName(7), 'USER 7')

const t0 = Date.now()
const profile = await loadProfile(3)
const ms = Date.now() - t0
check('loadProfile result', profile, { name: 'User 3', postCount: 2 })
check(`loadProfile ran in parallel (took ${ms}ms, should be < 180ms)`, ms < 180, true)

const ok = await safeLoadUser(1)
const bad = await safeLoadUser(0)
check('safeLoadUser success', ok, { status: 'success', user: { id: 1, name: 'User 1' } })
check('safeLoadUser error', bad, { status: 'error', message: 'User not found' })
check('describe success', describe(ok), 'Loaded User 1')
check('describe error', describe(bad), 'Error: User not found')
summary()
