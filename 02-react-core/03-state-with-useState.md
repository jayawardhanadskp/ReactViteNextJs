# React 03 — State with `useState`

> Flutter: `StatefulWidget` + `setState`. React: `useState`.

## 1. The Flutter counter app, in React

```dart
class Counter extends StatefulWidget {
  const Counter({super.key});
  @override
  State<Counter> createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Text('You pressed $_count times'),
      ElevatedButton(onPressed: () => setState(() => _count++), child: const Text('+')),
    ]);
  }
}
```

```tsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)    // state variable + setter, starting at 0

  return (
    <div>
      <p>You pressed {count} times</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}
```

`useState(0)` returns an array with two things, which we destructure:
- `count` — the current value
- `setCount` — a function to change it **and** tell React to re-render

No class, no separate `State` object. Functions that start with `use` are called **hooks**.
Hooks "hook into" React features (state, lifecycle, context) from a function component.

## 2. What actually happens when you click? (the mental model)

1. You click → `setCount(1)` is called.
2. React stores `1` as the new value **for this component** and schedules a re-render.
3. React **calls your `Counter` function again**. This time `useState(0)` returns `[1, setCount]`
   (the `0` is only used the very first time).
4. Your function returns new JSX: `<p>You pressed 1 times</p>`.
5. React compares it with the old JSX and updates only the text in the real DOM.

Same as Flutter: `setState` → `build()` runs again → framework updates what changed.

### Why not a normal variable?

```tsx
function BrokenCounter() {
  let count = 0                       // ❌ local variable
  return <button onClick={() => { count++; console.log(count) }}>{count}</button>
}
```

The log shows 1, 2, 3... but the screen always shows `0`, because:
1. Changing a local variable does **not** tell React to re-render.
2. Even if it re-rendered, the function runs again and `let count = 0` resets it.

State is memory that **survives between renders** and **triggers a re-render** when changed.

## 3. State is a snapshot (a common surprise)

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  function handleClick() {
    setCount(count + 1)
    console.log(count)        // prints 0, not 1!
  }
  // ...
}
```

`setCount` does not change the `count` variable immediately. It asks React for a **new render**.
In the current render, `count` is a constant (`const`!) with value `0`.

Another surprise:

```tsx
function handleClick() {
  setCount(count + 1)   // setCount(0 + 1)
  setCount(count + 1)   // setCount(0 + 1)
  setCount(count + 1)   // setCount(0 + 1)   → result is 1, not 3
}
```

### The fix: the updater function

When the new state **depends on the old state**, pass a function:

```tsx
function handleClick() {
  setCount((c) => c + 1)   // 0 → 1
  setCount((c) => c + 1)   // 1 → 2
  setCount((c) => c + 1)   // 2 → 3 ✅
}
```

React runs them in order, giving each the latest value. **Good habit: use `c => c + 1` whenever you
calculate from the previous value.**

## 4. Multiple state variables

```tsx
function SignupForm() {
  const [name, setName] = useState('')
  const [age, setAge] = useState(18)
  const [agreed, setAgreed] = useState(false)
  // ...
}
```

TypeScript infers the type from the initial value. When it can't (e.g. starts as `null`), give it:

```tsx
type User = { id: number; name: string }
const [user, setUser] = useState<User | null>(null)
const [tags, setTags] = useState<string[]>([])
```

## 5. Objects and arrays in state — always make a NEW one

Remember exercise 02 from the foundations? This is where it matters. React compares old and new
state with `===`. If you mutate and pass the **same** object, React sees "no change" and does
**nothing**.

### Objects

```tsx
const [form, setForm] = useState({ name: '', email: '' })

// ❌ Wrong: mutating
form.name = 'Kasun'
setForm(form)                   // same reference → React ignores it

// ✅ Right: new object with spread (Dart: copyWith)
setForm({ ...form, name: 'Kasun' })
// or with the updater
setForm((prev) => ({ ...prev, name: 'Kasun' }))
```

Nested objects — copy every level you change:

```tsx
setUser((prev) => ({ ...prev, address: { ...prev.address, city: 'Kandy' } }))
```

### Arrays — cheat sheet

| Action          | ❌ Mutating (don't)      | ✅ New array (do)                                    |
| --------------- | ----------------------- | --------------------------------------------------- |
| add to end      | `arr.push(x)`           | `[...arr, x]`                                       |
| add to start    | `arr.unshift(x)`        | `[x, ...arr]`                                       |
| remove          | `arr.splice(i, 1)`      | `arr.filter(item => item.id !== id)`                |
| update one item | `arr[i].done = true`    | `arr.map(item => item.id === id ? { ...item, done: true } : item)` |
| sort            | `arr.sort()`            | `[...arr].sort()` or `arr.toSorted()`               |
| reverse         | `arr.reverse()`         | `arr.toReversed()`                                  |

```tsx
const [todos, setTodos] = useState<Todo[]>([])

const addTodo = (title: string) =>
  setTodos((prev) => [...prev, { id: crypto.randomUUID(), title, done: false }])

const toggle = (id: string) =>
  setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))

const remove = (id: string) =>
  setTodos((prev) => prev.filter((t) => t.id !== id))
```

## 6. Don't store what you can calculate (derived state)

```tsx
// ❌ Extra state that can go out of sync
const [todos, setTodos] = useState<Todo[]>([])
const [doneCount, setDoneCount] = useState(0)    // must remember to update this every time!

// ✅ Just calculate it during render
const [todos, setTodos] = useState<Todo[]>([])
const doneCount = todos.filter((t) => t.done).length
```

Every render recalculates it, so it is always correct. Same for `fullName = first + ' ' + last`,
`filteredList = list.filter(...)`, `total = cart.reduce(...)`.

Flutter comparison: computing a value in `build()` instead of storing it in a field.

## 7. Each component instance has its own state

```tsx
<Counter />   {/* has its own count */}
<Counter />   {/* has a different count */}
```

State belongs to **a position in the tree**. If a component is removed from the tree (e.g. by a
condition), its state is destroyed. When it comes back, it starts fresh. (Same as Flutter `State`
being disposed.)

## 8. The rules of hooks

1. Only call hooks **at the top level** of a component. **Never inside `if`, loops, or nested functions.**
2. Only call hooks from **React components** or **custom hooks** (functions named `useSomething`).

```tsx
function Bad({ show }: { show: boolean }) {
  if (show) {
    const [x, setX] = useState(0)   // ❌ hook inside a condition
  }
}
```

Why? React identifies each `useState` by **call order** (1st call, 2nd call...). If the order changes
between renders, React mixes up the state. The ESLint plugin `react-hooks` warns you about this.

## 9. Lifting state up (preview)

If **two** components need the same state, move the state to their **closest common parent** and
pass it down as props + a callback. This is the same as Flutter "lifting state up" before you
reach for Provider. Lesson 07 covers this fully.

## 10. Practice

👉 Do **Exercise 2 — Counter** in `practice/01-react-playground`.

## Check yourself

1. You call `setCount(count + 1)` and immediately `console.log(count)`. What prints?
2. When should you use `setX(prev => ...)`?
3. Why doesn't `todos.push(t); setTodos(todos)` update the screen?
4. You have `items` in state. Should `itemCount` also be state?

<details><summary>Answers</summary>

1. The old value. State updates take effect on the next render.
2. When the new value depends on the previous value.
3. `todos` is the same array reference, so React thinks nothing changed. Use `setTodos([...todos, t])`.
4. No. Calculate it during render: `const itemCount = items.length`.

</details>
