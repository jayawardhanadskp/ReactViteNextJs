# 05 — What's Next: the React Ecosystem and Your Next Steps

You finished the core path. This page is your map of the ecosystem — what people use in real jobs —
with the Flutter equivalent for each, and project ideas to keep practising.

## 1. Libraries you'll meet in real projects

| Need                       | Popular choice                            | Flutter equivalent                    |
| -------------------------- | ----------------------------------------- | ------------------------------------- |
| Server data in the browser | **TanStack Query** (`useQuery`, `useMutation`) | `FutureProvider`, repository + cache |
| Global client state        | **Zustand** (simple), Redux Toolkit (big teams), Jotai | Riverpod, Bloc, Provider |
| Forms                      | **React Hook Form**                       | `flutter_form_builder`                |
| Validation / parsing       | **Zod**, Valibot                          | `json_serializable` + validators, `freezed` |
| UI components              | **shadcn/ui** (Tailwind), MUI, Mantine    | Material / Cupertino widgets          |
| Icons                      | **lucide-react**                          | `Icons.*`                             |
| Animation                  | **Motion** (`motion/react`)               | `AnimatedContainer`, `flutter_animate`|
| Dates                      | `date-fns`, `Intl.DateTimeFormat`         | `intl`                                |
| Auth (Next.js)             | Auth.js, Clerk, Better Auth, Supabase Auth | Firebase Auth                        |
| Database access            | Prisma, Drizzle ORM                       | `drift`, Firestore SDK                |
| Backend-as-a-service       | Supabase, Firebase (web SDK), Convex      | Firebase                              |
| Testing (unit)             | **Vitest** + **React Testing Library**    | `flutter_test`, `bloc_test`           |
| Testing (end-to-end)       | **Playwright**                            | `integration_test`, Patrol            |
| i18n                       | next-intl, react-i18next                  | `flutter_localizations` + ARB          |
| Charts                     | Recharts, Chart.js, ECharts               | `fl_chart`                            |
| Mobile with React          | **React Native + Expo**                   | Flutter itself 🙂                      |

### TanStack Query in 20 lines (the most useful one for Vite apps)

```bash
npm install @tanstack/react-query
```

```tsx
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const queryClient = new QueryClient()

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

```tsx
import { useQuery } from '@tanstack/react-query'

function Users() {
  const { data, isPending, error } = useQuery({
    queryKey: ['users'],                                   // cache key
    queryFn: () => fetch('/api/users').then((r) => r.json()),
  })
  if (isPending) return <p>Loading…</p>
  if (error) return <p>Error: {error.message}</p>
  return <ul>{data.map((u: User) => <li key={u.id}>{u.name}</li>)}</ul>
}
```

Caching, refetch on focus, retries, deduplication, pagination — all built in. It replaces most
`useEffect` + `fetch` code (and the `useFetch` hook you wrote).

### Zustand in 10 lines (simple global state)

```tsx
import { create } from 'zustand'

type CartStore = { items: string[]; add: (item: string) => void }

export const useCart = create<CartStore>((set) => ({
  items: [],
  add: (item) => set((state) => ({ items: [...state.items, item] })),
}))

// any component — no Provider needed
const items = useCart((s) => s.items)
const add = useCart((s) => s.add)
```

## 2. Testing your React code

```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

Test a pure function (e.g. the task manager reducer) — just like testing a Bloc:

```ts
import { describe, expect, it } from 'vitest'
import { tasksReducer, createTask } from './tasksReducer'

describe('tasksReducer', () => {
  it('toggles a task', () => {
    const task = createTask('Learn Vitest')
    const state = tasksReducer([task], { type: 'toggled', id: task.id })
    expect(state[0].done).toBe(true)
  })
})
```

Test a component like a user would (Flutter: `testWidgets` + `tester.tap`):

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('increments', async () => {
  render(<Counter />)
  await userEvent.click(screen.getByRole('button', { name: '+' }))
  expect(screen.getByText('1')).toBeDefined()
})
```

## 3. Keep learning — a suggested order

1. **Finish all challenges** in both guided projects.
2. **TanStack Query** — refactor the task manager's import button (or a new app) to use it.
3. **shadcn/ui** — restyle the recipe book with its components.
4. **Auth** — add login to the recipe book (only the author can delete their recipe).
5. **A real database** — Supabase or Postgres + Drizzle/Prisma in the recipe book.
6. **Testing** — Vitest for reducers and actions, Playwright for one end-to-end flow.
7. **React Native + Expo** — build one small mobile app with React and compare it with Flutter.

## 4. Final challenge: rebuild one of your Flutter apps for the web

Pick a Flutter app you already built. Plan it on paper first:

| Question                                         | Answer for your app |
| ------------------------------------------------ | ------------------- |
| Is it public (SEO matters) or behind a login?    |                     |
| → React + Vite or Next.js?                       |                     |
| Screens → routes (URLs)                          |                     |
| Widgets → components (which are reusable?)       |                     |
| State: what is local, what is global, what is server data? |           |
| Backend: existing API / Firebase / Next.js Server Actions? |           |
| Styling: Tailwind, CSS Modules, or a component library?    |           |

Project ideas if you want something new:

- **Expense tracker** (Vite): categories, monthly charts (Recharts), localStorage → Supabase later
- **Personal blog** (Next.js): Markdown posts, `generateStaticParams`, metadata, RSS route handler
- **Weather dashboard** (Vite + TanStack Query): search city, debounce, cache, error states
- **Mini e-commerce** (Next.js): product pages (static), cart (client state), checkout Server Action
- **Full-stack + mobile**: Next.js API + admin website, and your **Flutter app** as the mobile client 🚀

## 5. Habits that make you a strong React developer

- Think **UI = f(state)**. If something is wrong on screen, find which state is wrong.
- **Derive** values instead of storing duplicates. Keep state minimal.
- Update state **immutably**.
- Use `useEffect` only to sync with outside systems.
- Keep components **small**; extract logic into custom hooks.
- In Next.js: **server by default**, `'use client'` only at the interactive leaves.
- Read the **console** and the **Next.js error overlay** — they usually tell you exactly what to fix.
- Run `npm run build` before you push.

Good luck — you already know how to think in widgets, and now you know how to think in components. 💙⚛️
