# React 05 — Lists and Conditional UI

> Flutter: `ListView.builder`, `if (x) Widget()` inside children, `x ? A() : B()`.
> React: `array.map()`, `&&`, ternary `? :`.

## 1. Conditional rendering

JSX cannot contain `if` statements, but it can contain **expressions**. Four patterns:

### a) Ternary — "this OR that"

```tsx
<p>{isLoggedIn ? `Welcome back, ${name}` : 'Please log in'}</p>

{isLoading ? <Spinner /> : <ProductList products={products} />}
```

Flutter: `isLoading ? CircularProgressIndicator() : ProductList()` — identical!

### b) `&&` — "this OR nothing"

```tsx
{hasError && <p className="error">Something went wrong</p>}
{cart.length > 0 && <CartBadge count={cart.length} />}
```

Flutter: `if (hasError) Text('Something went wrong')` inside a `children` list.

> ⚠️ **The `0` trap:** `{count && <Badge />}` — if `count` is `0`, React renders **"0"** on screen,
> because `0 && x` evaluates to `0`, and numbers are rendered.
> Always use a real boolean: `{count > 0 && <Badge />}`.

### c) Early return — whole component changes

```tsx
function UserProfile({ user }: { user: User | null }) {
  if (!user) {
    return <p>No user selected</p>
  }
  return <h2>{user.name}</h2>     // TypeScript knows user is not null here
}
```

### d) Variable before the return — for complex logic

```tsx
function StatusBadge({ status }: { status: 'idle' | 'loading' | 'success' | 'error' }) {
  let content
  switch (status) {
    case 'loading': content = <Spinner />; break
    case 'success': content = <span>✅ Saved</span>; break
    case 'error':   content = <span>❌ Failed</span>; break
    default:        content = null
  }
  return <div className="status">{content}</div>
}
```

Or a lookup object:

```tsx
const icons = { idle: '⏸', loading: '⏳', success: '✅', error: '❌' } as const
return <span>{icons[status]}</span>
```

### Returning `null` = render nothing

```tsx
function Banner({ show }: { show: boolean }) {
  if (!show) return null       // Flutter: SizedBox.shrink()
  return <div className="banner">Sale!</div>
}
```

### Showing/hiding vs. removing

`{show && <Panel />}` **removes** the component (its state is destroyed).
To just hide it (keep state), use CSS: `<Panel hidden={!show} />` or `style={{ display: show ? 'block' : 'none' }}`.
(Flutter: removing a widget vs. `Visibility(maintainState: true)` / `Offstage`.)

## 2. Rendering lists with `map`

```dart
// Flutter
ListView(children: fruits.map((f) => ListTile(title: Text(f))).toList())
```

```tsx
// React
const fruits = ['Mango', 'Banana', 'Papaya']

<ul>
  {fruits.map((fruit) => (
    <li key={fruit}>{fruit}</li>
  ))}
</ul>
```

`map` returns an array of JSX elements, and React renders arrays. No `.toList()` needed.

With objects:

```tsx
type Product = { id: number; name: string; price: number }

function ProductList({ products }: { products: Product[] }) {
  return (
    <ul className="product-list">
      {products.map((p) => (
        <ProductCard key={p.id} name={p.name} price={p.price} />
      ))}
    </ul>
  )
}
```

Filter and sort **before** mapping (it's just JS):

```tsx
const visible = products
  .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
  .toSorted((a, b) => a.price - b.price)

return <ul>{visible.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
```

## 3. Keys — why every list item needs one

React shows a warning if you forget: *"Each child in a list should have a unique 'key' prop."*

The `key` tells React **which item is which** between renders. It is the same as Flutter's
`Key` / `ValueKey` in lists. Without good keys, when you delete or reorder items, React may keep
the wrong state attached to the wrong item (e.g. a typed input or a checkbox "jumps" to another row).

Rules:
1. Keys must be **unique among siblings**.
2. Keys must be **stable** — the same item always gets the same key.
3. Use an **id from your data** (`item.id`). For new items create one with `crypto.randomUUID()`.
4. ❌ Avoid the array index (`key={index}`) when items can be added, removed or reordered.
   Index is only OK for static lists that never change.
5. ❌ Never `key={Math.random()}` — a new key every render = React destroys and recreates every item.

The `key` goes on the **outermost** element returned by `map`, and the child component does **not**
receive it as a prop.

Fragments with keys (when you need two elements per item):

```tsx
import { Fragment } from 'react'

{terms.map((t) => (
  <Fragment key={t.id}>
    <dt>{t.word}</dt>
    <dd>{t.meaning}</dd>
  </Fragment>
))}
```

## 4. Empty states

```tsx
{todos.length === 0 ? (
  <p className="empty">Nothing to do 🎉</p>
) : (
  <ul>{todos.map((t) => <TodoItem key={t.id} todo={t} />)}</ul>
)}
```

## 5. Full example — a filterable list

```tsx
import { useState } from 'react'

type Contact = { id: number; name: string; favorite: boolean }

const initialContacts: Contact[] = [
  { id: 1, name: 'Amara', favorite: true },
  { id: 2, name: 'Bhanuka', favorite: false },
  { id: 3, name: 'Chamari', favorite: true },
]

export default function Contacts() {
  const [contacts, setContacts] = useState(initialContacts)
  const [query, setQuery] = useState('')
  const [onlyFavorites, setOnlyFavorites] = useState(false)

  // derived data
  const visible = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) &&
      (!onlyFavorites || c.favorite),
  )

  const toggleFavorite = (id: number) =>
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c)))

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
      <label>
        <input type="checkbox" checked={onlyFavorites} onChange={(e) => setOnlyFavorites(e.target.checked)} />
        Only favorites
      </label>

      {visible.length === 0 && <p>No contacts found.</p>}

      <ul>
        {visible.map((c) => (
          <li key={c.id}>
            {c.name}
            <button onClick={() => toggleFavorite(c.id)}>{c.favorite ? '★' : '☆'}</button>
          </li>
        ))}
      </ul>
      <p>{visible.length} of {contacts.length} shown</p>
    </div>
  )
}
```

## 6. Long lists

`ListView.builder` only builds visible items. A normal React `map` renders **all** items. That is
fine for hundreds of items. For thousands, use a "virtualized list" library like
**TanStack Virtual**, or paginate.

## 7. Practice

👉 Do **Exercise 4 — Shopping list** in `practice/01-react-playground`.

## Check yourself

1. What does `{0 && <Badge />}` render?
2. Why is `key={index}` dangerous for a todo list where you can delete items?
3. How do you render nothing from a component?

<details><summary>Answers</summary>

1. The text `0`. Use `{count > 0 && <Badge />}`.
2. After deleting, items shift positions and get different keys, so React may attach the wrong state to the wrong row.
3. `return null`.

</details>
