# Next.js 05 — Server Actions (mutations) and Route Handlers (APIs)

> Reading data = Server Components (lesson 04). **Changing** data = **Server Actions**.
> Exposing a REST API for other clients (like your Flutter app) = **Route Handlers**.

## 1. What is a Server Action?

A function marked with `'use server'` that **runs on the server**, but you can **call it from the browser**
— from a `<form>`, a button, or any event handler. Next.js creates the HTTP endpoint and the `fetch`
call for you.

Flutter comparison: imagine calling a Firebase Cloud Function, but you just `import` it and call it like a
normal Dart function — no URL, no JSON encoding, no HTTP client.

```ts
// lib/actions.ts
'use server'                 // ← every exported function in this file is a Server Action

import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createNote(formData: FormData) {
  const text = String(formData.get('text') ?? '').trim()
  if (!text) return
  await db.note.create({ data: { text } })   // runs on the server: DB access is fine
  updateTag('notes')                          // expire cached reads tagged 'notes'
  redirect('/notes')                          // go to the list page
}
```

## 2. Calling it from a form (works even without JavaScript!)

```tsx
// app/notes/new/page.tsx  — a SERVER component
import { createNote } from '@/lib/actions'

export default function NewNotePage() {
  return (
    <form action={createNote}>              {/* not onSubmit — `action` takes the Server Action */}
      <input name="text" required />         {/* the `name` becomes the FormData key */}
      <button>Save</button>
    </form>
  )
}
```

What happens on submit:

```
Browser                                         Server
  │  POST /notes/new  (FormData: text=...)        │
  │ ────────────────────────────────────────────▶ │  createNote(formData) runs
  │                                               │  → saves to DB
  │                                               │  → updateTag('notes')
  │ ◀──────────────────────────────────────────── │  → redirect('/notes'): sends the new page's UI
  │  shows /notes with the new note — in ONE round trip
```

No `fetch`, no `useState` for every input, no `e.preventDefault()`, no API route.
Because it's a real HTML form, it **works before JavaScript loads** (progressive enhancement).

## 3. Passing extra arguments: `.bind`

```tsx
// lib/actions.ts
export async function deleteRecipeAction(id: string) {
  await deleteRecipe(id)
  updateTag('recipes')
  redirect('/recipes')
}

// page.tsx
<form action={deleteRecipeAction.bind(null, recipe.id)}>
  <button>Delete</button>
</form>
```

`.bind(null, recipe.id)` creates a new function with the first argument already filled in.

## 4. Validation errors and pending state: `useActionState`

To show errors and a "Saving…" state, the form must be a **Client Component** using `useActionState`.
The Server Action then gets the **previous state** as its first argument and **returns** the new state.

```ts
// lib/actions.ts
'use server'

export type FormState = { errors?: { title?: string }; values?: { title: string } }

export async function createRecipeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const title = String(formData.get('title') ?? '').trim()

  if (title.length < 3) {
    // EXPECTED errors are RETURNED, not thrown
    return { errors: { title: 'Title must be at least 3 characters.' }, values: { title } }
  }

  const recipe = await addRecipe({ title /* ... */ })
  updateTag('recipes')
  redirect(`/recipes/${recipe.id}`)
}
```

```tsx
// components/RecipeForm.tsx
'use client'
import { useActionState } from 'react'
import { createRecipeAction, type FormState } from '@/lib/actions'

const initialState: FormState = {}

export function RecipeForm() {
  const [state, formAction, pending] = useActionState(createRecipeAction, initialState)

  return (
    <form action={formAction}>
      <input name="title" defaultValue={state.values?.title} />
      {state.errors?.title && <p className="error">{state.errors.title}</p>}
      <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
    </form>
  )
}
```

- `state` — what the action returned last time (errors, values, messages)
- `formAction` — pass this to `<form action>`
- `pending` — `true` while the action runs (like `isLoading` in a Bloc state)

> 💡 After a form action finishes, **React resets uncontrolled form fields** to their `defaultValue`.
> That's why the action returns `values` and the inputs use `defaultValue={state.values?.title}` —
> so the user's text isn't lost when there's an error.

### `useFormStatus` — pending state inside a child button

```tsx
'use client'
import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()     // reads the status of the PARENT <form>
  return <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
}
```

### Real-world validation: Zod

For bigger forms, validate with a schema library (like Dart's `json_serializable` + validators):

```ts
import { z } from 'zod'
const schema = z.object({ title: z.string().min(3), minutes: z.coerce.number().int().positive() })
const result = schema.safeParse(Object.fromEntries(formData))
if (!result.success) return { errors: result.error.flatten().fieldErrors }
```

## 5. Calling a Server Action from a button (not a form)

```tsx
'use client'
import { useOptimistic, useTransition } from 'react'
import { likeRecipeAction } from '@/lib/actions'

export function LikeButton({ recipeId, likes }: { recipeId: string; likes: number }) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(likes, (current, added: number) => current + added)
  const [isPending, startTransition] = useTransition()

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          addOptimisticLike(1)                 // show +1 immediately
          await likeRecipeAction(recipeId)     // POST to the server
        })
      }
    >
      ❤️ {optimisticLikes}
    </button>
  )
}
```

- `startTransition` — runs the action as a "transition" and gives you `isPending`.
- `useOptimistic` — **optimistic UI**: show the expected result immediately; when the server re-renders
  the page with the real `likes` value, the optimistic value is replaced. If the action fails, it rolls back.

## 6. After a mutation: refresh the data

| Function                      | What it does                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `updateTag('recipes')`        | Expire cached data with that tag **immediately** (the user sees their change). Server Actions only. |
| `revalidateTag('recipes', 'max')` | Mark as stale; serve old data while refreshing in the background. Also in Route Handlers / webhooks. |
| `revalidatePath('/recipes')`  | Expire everything for one path                                                    |
| `refresh()`                   | Re-render the current page for the client (doesn't touch tagged caches)          |
| `redirect('/somewhere')`      | Navigate after the action (call it last — it throws internally)                  |

## 7. ⚠️ Security: Server Actions are public endpoints

Anyone can send a POST request to a Server Action — not only your form. So **inside every action**:

1. **Validate** all input (never trust `formData`).
2. **Check authentication and authorization** ("is the user logged in? may they delete *this* recipe?").

```ts
export async function deletePost(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  const post = await db.post.findUnique({ where: { id } })
  if (post?.authorId !== session.user.id) throw new Error('Forbidden')
  // ...
}
```

(Our recipe practice app has no login, so it only validates input.)

## 8. Route Handlers — a REST API in the same project

A `route.ts` file creates an API endpoint. Export functions named after HTTP methods.

```ts
// app/api/recipes/route.ts   →  GET /api/recipes
import { getRecipes } from '@/lib/recipes'

export async function GET() {
  const recipes = await getRecipes()
  return Response.json(recipes)
}

export async function POST(request: Request) {
  const body = await request.json()
  // validate + save ...
  return Response.json({ ok: true }, { status: 201 })
}
```

```ts
// app/api/recipes/[id]/route.ts   →  GET /api/recipes/pol-roti
import type { NextRequest } from 'next/server'

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/recipes/[id]'>) {
  const { id } = await ctx.params
  const recipe = await getRecipe(id)
  if (!recipe) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(recipe)
}
```

### 🎯 Your Flutter app can use it!

```dart
final res = await http.get(Uri.parse('http://localhost:3000/api/recipes'));
final recipes = (jsonDecode(res.body) as List).map((e) => Recipe.fromJson(e)).toList();
```

(On the Android emulator, `localhost` of your computer is `10.0.2.2`.)

So one Next.js project can be **your website AND the backend for your Flutter app**.

## 9. Server Action or Route Handler?

| Use a **Server Action** when…                         | Use a **Route Handler** when…                               |
| ----------------------------------------------------- | ----------------------------------------------------------- |
| your own Next.js UI changes data (forms, buttons)     | another client calls you (Flutter app, mobile, partners)    |
| you want progressive enhancement and one round trip   | you need a public REST/JSON API with fixed URLs             |
|                                                       | webhooks (Stripe, GitHub) call your server                  |
|                                                       | you return non-HTML (files, RSS, images)                    |

## 10. Proxy (formerly Middleware) — good to know

A `proxy.ts` file at the project root runs **before** a request reaches a page — for redirects,
rewrites, or quick checks (e.g. "no session cookie → redirect to /login"). In Next.js 16 it was renamed
from `middleware.ts` to `proxy.ts`. Don't use it for heavy work or as your only security check.

## Check yourself

1. What directive makes a function a Server Action?
2. Your action validates input and finds an error. Throw or return?
3. Why must you check permissions inside every Server Action?
4. Your Flutter app needs the recipe list. Server Action or Route Handler?

<details><summary>Answers</summary>

1. `'use server'` (at the top of the file or the top of the function).
2. Return it (e.g. `{ errors }`) and show it with `useActionState`. Throw only for unexpected errors.
3. They're public HTTP endpoints — anyone can call them, not only your UI.
4. Route Handler (`app/api/recipes/route.ts`).

</details>
