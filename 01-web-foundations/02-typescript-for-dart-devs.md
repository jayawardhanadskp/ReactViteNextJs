# 02 — TypeScript for Dart Developers

**TypeScript (TS)** = JavaScript + types. You write `.ts` / `.tsx` files, and the types are
checked by your editor and by the `tsc` compiler. When the code runs, the types are **removed**
and it becomes plain JS.

As a Dart developer you will **love** TypeScript: it gives you autocomplete and errors before
running, like Dart. All projects in this course use TypeScript.

> `.ts` = TypeScript file. `.tsx` = TypeScript file that contains JSX (React UI).

---

## 1. Basic types

```ts
let name: string = 'Kasun'
let age: number = 25            // no int/double — just number
let active: boolean = true
let tags: string[] = ['a', 'b'] // Dart: List<String>
let ids: Array<number> = [1, 2] // same thing, other syntax

// Type inference — just like Dart, you usually don't write the type
const city = 'Colombo'          // TS knows it is a string
```

## 2. Nullable types

Dart: `String? nickname`. TypeScript uses a **union** with `null` or `undefined`:

```ts
let nickname: string | null = null
let middleName: string | undefined     // "may be missing"
// Inside object types and parameters you can write `middleName?: string` (shown below)

function len(s: string | null): number {
  return s?.length ?? 0          // same ?. and ?? as Dart
}

// Non-null assertion (Dart: value!)
const root = document.getElementById('root')!
```

## 3. Object types: `type` and `interface` (Dart: data classes)

Dart:

```dart
class User {
  final int id;
  final String name;
  final String? email;
  User({required this.id, required this.name, this.email});
}
```

TypeScript — you describe the **shape** of an object. No constructor, no `fromJson` needed:

```ts
type User = {
  id: number
  name: string
  email?: string        // optional (may be missing)
  readonly createdAt: string   // like final
}

const u: User = { id: 1, name: 'Kasun', createdAt: '2026-01-01' }

// interface — almost the same thing. Either is fine. This course uses `type`.
interface Product {
  id: number
  title: string
}
```

**TypeScript checks shapes, not class names.** Any object with the right fields is a `User`.
This is called **structural typing** (Dart uses nominal typing).

JSON from an API is just an object, so you "cast" it to a type:

```ts
const res = await fetch('/api/users/1')
const user = (await res.json()) as User     // trust me, it's a User
```

(Note: `as` does not check at runtime. Libraries like **Zod** validate real data — see 05-whats-next.)

## 4. Union types and literal types (better than enums)

```ts
type Status = 'idle' | 'loading' | 'success' | 'error'   // only these 4 strings allowed

let s: Status = 'loading'   // ✅
s = 'done'                  // ❌ error: Type '"done"' is not assignable to type 'Status'

type Id = number | string
```

This is how we usually model enums in TS. Dart: `enum Status { idle, loading, success, error }`.

### Discriminated unions (like Dart sealed classes)

```ts
type Result =
  | { status: 'loading' }
  | { status: 'success'; data: string[] }
  | { status: 'error'; message: string }

function render(r: Result) {
  switch (r.status) {
    case 'loading': return 'Loading...'
    case 'success': return r.data.join(', ')   // TS knows `data` exists here
    case 'error':   return r.message           // TS knows `message` exists here
  }
}
```

Dart 3 equivalent: `sealed class Result` + `switch` with pattern matching.

## 5. Functions

```ts
function add(a: number, b: number): number {
  return a + b
}

const greet = (name: string, greeting = 'Hello'): string => `${greeting} ${name}`

// Optional parameter
function log(msg: string, level?: 'info' | 'warn') {}

// A function TYPE (Dart: void Function(String))
type OnSelect = (id: number) => void

// Named params via an object (this is how React props are typed!)
function createUser({ name, age = 18 }: { name: string; age?: number }) {}
```

## 6. Generics (same as Dart)

```ts
function first<T>(items: T[]): T | undefined {
  return items[0]
}
first<number>([1, 2])   // number | undefined
first(['a'])            // T inferred as string

type ApiResponse<T> = { data: T; error: string | null }
const r: ApiResponse<User[]> = { data: [], error: null }
```

## 7. Useful utility types

```ts
type User = { id: number; name: string; email: string }

type UserPreview = Pick<User, 'id' | 'name'>       // { id; name }
type NewUser     = Omit<User, 'id'>                // { name; email }
type UserUpdate  = Partial<User>                   // every field optional
type ReadOnlyUser = Readonly<User>
type Scores      = Record<string, number>          // Dart: Map<String, int>
```

## 8. Types you will see in React code

```tsx
import type { ReactNode, ChangeEvent, FormEvent } from 'react'

// Props of a component
type ButtonProps = {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  children?: ReactNode            // anything React can render (Dart: Widget? child)
}

// Events
function onChange(e: ChangeEvent<HTMLInputElement>) { e.target.value }
function onSubmit(e: FormEvent<HTMLFormElement>) { e.preventDefault() }

// State with a type
const [user, setUser] = useState<User | null>(null)
```

`import type { ... }` imports only types (they are removed at build time).

## 9. `any` and `unknown`

- `any` — turns off type checking (Dart `dynamic`). **Avoid it.**
- `unknown` — "I don't know the type yet, you must check before using". Safer.

```ts
function handle(err: unknown) {
  if (err instanceof Error) console.log(err.message)
}
```

## 10. Things that do NOT exist / are different

| Dart                      | TypeScript                                                  |
| ------------------------- | ----------------------------------------------------------- |
| Runtime types (`is User`) | Types disappear at runtime. Check fields instead: `'name' in obj` |
| `enum`                    | Use union of strings: `type Color = 'red' \| 'blue'`        |
| `fromJson` / `toJson`     | Not needed — objects are already JSON-like                  |
| `late`                    | Not needed                                                  |
| Method overloading        | Not really — use unions or optional params                  |

Now do exercise **03** in [exercises/README.md](exercises/README.md).
