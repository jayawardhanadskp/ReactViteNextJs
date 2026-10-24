# React 04 — Events and Forms

> Flutter: `onPressed`, `TextField` + `TextEditingController`, `Form` + validators.
> React: `onClick`, **controlled inputs**, `<form onSubmit>`.

## 1. Handling events

```tsx
function Buttons() {
  function handleClick() {
    console.log('clicked')
  }

  return (
    <>
      {/* ✅ pass the function */}
      <button onClick={handleClick}>Click</button>

      {/* ✅ inline arrow function — needed when you pass arguments */}
      <button onClick={() => console.log('inline')}>Inline</button>
      <button onClick={() => deleteItem(42)}>Delete 42</button>

      {/* ❌ this CALLS the function during render, every render! */}
      {/* <button onClick={handleClick()}>Wrong</button> */}
    </>
  )
}
```

Flutter has the same trap: `onPressed: doSomething` ✅ vs `onPressed: doSomething()` ❌.

### The event object

Every handler receives an event object `e`:

```tsx
import type { MouseEvent } from 'react'

function handleClick(e: MouseEvent<HTMLButtonElement>) {
  console.log(e.currentTarget)   // the button element
}
```

Common events: `onClick`, `onChange`, `onSubmit`, `onKeyDown`, `onFocus`, `onBlur`,
`onMouseEnter`, `onMouseLeave`, `onScroll`.

```tsx
<input onKeyDown={(e) => { if (e.key === 'Enter') save() }} />
```

### Stopping default browser behaviour

Some elements have built-in behaviour: a `<form>` reloads the page on submit, an `<a>` navigates.
`e.preventDefault()` stops that. `e.stopPropagation()` stops the event from reaching parent elements.

## 2. Controlled inputs — the React version of TextEditingController

In Flutter, `TextEditingController` holds the text. In React, **state** holds the text and the
input displays it. This is called a **controlled input**:

```tsx
function NameInput() {
  const [name, setName] = useState('')

  return (
    <>
      <input
        value={name}                                   // ① input shows the state
        onChange={(e) => setName(e.target.value)}      // ② every keystroke updates the state
        placeholder="Your name"
      />
      <p>Hello, {name || 'stranger'}!</p>            {/* ③ UI updates live */}
    </>
  )
}
```

The loop: user types → `onChange` → `setName` → re-render → input shows new `value`.
**State is the single source of truth.** Because you own the value, you can transform it:

```tsx
onChange={(e) => setName(e.target.value.toUpperCase())}   // force uppercase
onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}  // digits only
```

> ⚠️ If you set `value` but forget `onChange`, the input becomes read-only (React warns you).

### All input types

```tsx
// Text, email, password, number, date...
<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

// Number: e.target.value is ALWAYS a string → convert
<input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} />

// Textarea (Flutter: TextField(maxLines: 5))
<textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} />

// Checkbox → use `checked`, not value (Flutter: Checkbox(value:, onChanged:))
<input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />

// Select (Flutter: DropdownButton)
<select value={country} onChange={(e) => setCountry(e.target.value)}>
  <option value="lk">Sri Lanka</option>
  <option value="in">India</option>
</select>

// Radio buttons
{(['small', 'medium', 'large'] as const).map((s) => (
  <label key={s}>
    <input type="radio" name="size" value={s} checked={size === s} onChange={() => setSize(s)} />
    {s}
  </label>
))}
```

Always connect a `<label>` to an input (`htmlFor` + `id`, or wrap the input in the label).
Clicking the label then focuses the input, and screen readers can read it.

## 3. Forms and submit

```tsx
import { useState, type FormEvent } from 'react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()           // ⚠️ stop the browser from reloading the page!
    console.log({ email, password })
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <label htmlFor="password">Password</label>
      <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <button type="submit">Log in</button>   {/* Enter key also submits */}
    </form>
  )
}
```

Use `onSubmit` on the `<form>` instead of `onClick` on the button: you get Enter-key support and
accessibility for free.

### One state object for many fields

```tsx
const [form, setForm] = useState({ name: '', email: '', city: '' })

function handleChange(e: ChangeEvent<HTMLInputElement>) {
  const { name, value } = e.target                  // `name` attribute of the input
  setForm((prev) => ({ ...prev, [name]: value }))   // [name] = computed key
}

<input name="name"  value={form.name}  onChange={handleChange} />
<input name="email" value={form.email} onChange={handleChange} />
<input name="city"  value={form.city}  onChange={handleChange} />
```

## 4. Validation (Flutter `validator:`)

```tsx
function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Derived values — computed every render, no extra state needed
  const errors = {
    email: !email.includes('@') ? 'Enter a valid email' : null,
    password: password.length < 8 ? 'At least 8 characters' : null,
  }
  const isValid = !errors.email && !errors.password

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
    if (!isValid) return
    alert('Account created!')
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      {submitted && errors.email && <p className="error">{errors.email}</p>}

      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {submitted && errors.password && <p className="error">{errors.password}</p>}

      <button type="submit">Sign up</button>
    </form>
  )
}
```

HTML also has built-in validation: `required`, `minLength={8}`, `type="email"`, `pattern="..."`.
The browser shows its own messages. `noValidate` on the form turns them off so you can show yours.

For big forms, teams use the library **React Hook Form** + **Zod** (see `05-whats-next.md`).

## 5. Uncontrolled inputs and `FormData` (good to know)

You don't **have** to put every input in state. You can read values at submit time:

```tsx
function QuickForm() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const title = data.get('title') as string
    console.log(title)
    e.currentTarget.reset()
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" defaultValue="" />   {/* defaultValue, not value */}
      <button>Add</button>
    </form>
  )
}
```

Use **controlled** when the UI must react while typing (live validation, search-as-you-type,
character counter). Use **FormData** for simple "fill and submit" forms. Next.js Server Actions
(lesson 04-nextjs/05) use the `FormData` style.

## 6. Practice

👉 Do **Exercise 3 — Login form** in `practice/01-react-playground`.

## Check yourself

1. What is the difference between `onClick={save}` and `onClick={save()}`?
2. Why call `e.preventDefault()` in `onSubmit`?
3. What does a checkbox use instead of `value`?
4. `<input type="number">` — what type is `e.target.value`?

<details><summary>Answers</summary>

1. The first passes the function (called on click). The second calls it immediately during every render.
2. Without it, the browser submits the form the old way and reloads the page.
3. `checked` and `e.target.checked`.
4. Always a `string`. Convert with `Number(...)`.

</details>
