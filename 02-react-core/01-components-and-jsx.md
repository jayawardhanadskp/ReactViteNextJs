# React 01 — Components and JSX

> Flutter: "Everything is a widget." React: "Everything is a component."

To follow along, create a test app (or use the playground in `practice/01-react-playground`):

```bash
npm create vite@latest react-lessons -- --template react-ts
cd react-lessons && npm install && npm run dev
```

Then write the examples in `src/App.tsx`.

---

## 1. A component is a function that returns UI

```tsx
// Flutter:
// class Greeting extends StatelessWidget {
//   @override
//   Widget build(BuildContext context) => Text('Hello, Flutter dev!');
// }

function Greeting() {
  return <h1>Hello, Flutter dev!</h1>
}
```

That is all. No class, no `build` method, no `BuildContext`. **The function body IS the build method.**
React calls this function every time it needs the UI (first render and every re-render).

Use it like an HTML tag:

```tsx
export default function App() {
  return (
    <div>
      <Greeting />
      <Greeting />
    </div>
  )
}
```

### Rules

1. **Name starts with a capital letter.** `<Greeting />` is your component. `<greeting />` would be
   treated as an HTML tag.
2. Return **one** root element (see Fragments below).
3. A component must be **pure**: same input (props/state) → same UI. Do not change outside variables
   or call APIs directly in the body (we will use `useEffect` or event handlers for that).

---

## 2. JSX: HTML-like syntax inside TypeScript

`<h1>Hello</h1>` inside a `.tsx` file is **JSX**. It is not a string and not real HTML.
The build tool (Vite) turns it into normal function calls:

```tsx
<h1 className="title">Hello</h1>
// becomes ↓ (roughly)
jsx('h1', { className: 'title', children: 'Hello' })
```

So JSX is just a nicer way to create a tree of objects — like writing `Text('Hello')` in Dart.
You will see this with your own eyes in `practice/00-same-app-three-ways/1-plain-react`, where we
use React **without** JSX.

### JSX rules (different from HTML)

```tsx
function Rules() {
  const name = 'Kasun'
  const isAdmin = true
  return (
    // ① Wrap multi-line JSX in ( )
    // ② One root element. Use a Fragment <>...</> if you don't want an extra <div>
    <>
      {/* ③ Comments look like this inside JSX */}

      {/* ④ Use { } to put ANY JS expression inside JSX (Dart: '$name' / '${...}') */}
      <h1>Hello {name.toUpperCase()}</h1>
      <p>2 + 2 = {2 + 2}</p>

      {/* ⑤ `class` is a JS keyword, so use className */}
      <p className="subtitle">Subtitle</p>

      {/* ⑥ Every tag must be closed. <img> → <img />, <br> → <br />, <input /> */}
      <img src="/vite.svg" alt="logo" />

      {/* ⑦ Attributes are camelCase: onclick → onClick, tabindex → tabIndex, for → htmlFor */}
      <label htmlFor="email">Email</label>
      <input id="email" tabIndex={0} />

      {/* ⑧ Strings in quotes, everything else in { } */}
      <input type="number" maxLength={3} disabled={!isAdmin} />

      {/* ⑨ style takes an OBJECT with camelCase keys — note the double {{ }} */}
      <p style={{ color: 'tomato', fontSize: 20, marginTop: '1rem' }}>Styled</p>
    </>
  )
}
```

`{{ }}` is not special syntax: the outer `{ }` means "JS expression", the inner `{ }` is an object.

### What can go inside `{ }`?

Expressions (things that produce a value): variables, math, function calls, ternaries `a ? b : c`,
`array.map(...)`. **Not** statements: no `if`, `for`, `const x = ...` inside JSX.
(Lesson 05 shows how to do conditions and loops.)

Values that render **nothing**: `null`, `undefined`, `false`, `true`. Numbers and strings render as text.

---

## 3. Composition: build big UIs from small components

Flutter: you build a screen by nesting widgets. React: you nest components.

```tsx
function AppBar() {
  return (
    <header className="appbar">
      <h1>My App</h1>
    </header>
  )
}

function ProductCard() {
  return (
    <div className="card">
      <h2>Coffee</h2>
      <p>Rs. 850</p>
    </div>
  )
}

function HomeScreen() {
  return (
    <>
      <AppBar />
      <main>
        <ProductCard />
        <ProductCard />
      </main>
    </>
  )
}
```

The tree React keeps:

```
HomeScreen
├── AppBar
│   └── header > h1
└── main
    ├── ProductCard → div > h2, p
    └── ProductCard → div > h2, p
```

Open the **React DevTools → Components** tab in the browser to see this tree live, like
the Flutter Widget Inspector.

---

## 4. One component per file, export/import

Usually each component lives in its own file in `src/components/`:

```tsx
// src/components/ProductCard.tsx
export default function ProductCard() {
  return <div className="card">...</div>
}
```

```tsx
// src/App.tsx
import ProductCard from './components/ProductCard'

export default function App() {
  return <ProductCard />
}
```

You can also use **named** exports: `export function ProductCard()` → `import { ProductCard } from ...`.
Many teams prefer named exports because the name is always the same everywhere.

---

## 5. How the app starts (Vite): `main.tsx` = `main.dart`

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(   // runApp(...)
  <StrictMode>
    <App />
  </StrictMode>,
)
```

| Flutter                         | React (Vite)                                                    |
| ------------------------------- | --------------------------------------------------------------- |
| `void main() => runApp(MyApp())`| `createRoot(document.getElementById('root')!).render(<App />)`  |
| The Flutter view                | `<div id="root"></div>` inside `index.html`                     |

`StrictMode` is a development helper. In development it **renders components twice** and runs effects
twice on purpose, to help you find bugs (impure components, missing cleanups). It does nothing in
production. So if you see a `console.log` printed twice in development — that is why. It is normal.

---

## 6. Common mistakes

| Mistake                                      | Fix                                                |
| -------------------------------------------- | -------------------------------------------------- |
| `function card()` then `<card />`            | Capital letter: `Card` / `<Card />`                |
| Returning two siblings: `return <h1/><p/>`   | Wrap: `return <><h1/><p/></>`                      |
| `class="x"`                                  | `className="x"`                                    |
| `<img src="a.png">` (not closed)             | `<img src="a.png" />`                              |
| `style="color: red"`                         | `style={{ color: 'red' }}`                         |
| `if (x) { ... }` inside JSX                  | Use a ternary or `&&` (lesson 05)                  |
| Defining a component INSIDE another component | Define it at the top level of the file (otherwise it is re-created on every render and loses state) |

---

## 7. Practice

In your test app, build this "profile screen" from 3 components: `Avatar`, `UserInfo`,
`ProfileScreen`. Hardcode the data for now (next lesson adds props).

```
┌────────────────────────────┐
│  (K)   Kasun Perera         │   ← Avatar + UserInfo in a row
│        Flutter → React dev  │
├────────────────────────────┤
│  Followers 120 · Posts 42  │
└────────────────────────────┘
```

Then open React DevTools and find your components in the tree.

## Check yourself

1. What does JSX turn into?
2. Why `className` and not `class`?
3. Why do you see `console.log` twice in development?
4. What is `<>...</>`?

<details><summary>Answers</summary>

1. Normal JavaScript function calls that create objects describing the UI.
2. `class` is a reserved word in JavaScript.
3. `StrictMode` renders twice in development to detect bugs. Not in production.
4. A Fragment — groups children without adding an extra element to the DOM.

</details>
