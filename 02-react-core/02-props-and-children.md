# React 02 — Props and children

> Flutter: constructor parameters (`final String title`). React: **props**.

## 1. Passing data into a component

```dart
// Flutter
class ProductCard extends StatelessWidget {
  final String name;
  final double price;
  final bool onSale;
  const ProductCard({super.key, required this.name, required this.price, this.onSale = false});

  @override
  Widget build(BuildContext context) => Column(children: [
    Text(name),
    Text('Rs. $price'),
    if (onSale) Text('SALE!'),
  ]);
}

ProductCard(name: 'Coffee', price: 850, onSale: true)
```

```tsx
// React
type ProductCardProps = {
  name: string
  price: number
  onSale?: boolean          // optional (like a Dart parameter with a default)
}

function ProductCard({ name, price, onSale = false }: ProductCardProps) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>Rs. {price}</p>
      {onSale && <span className="badge">SALE!</span>}
    </div>
  )
}

// Usage — props look like HTML attributes
<ProductCard name="Coffee" price={850} onSale />
<ProductCard name="Tea" price={400} />
```

How it works: React collects all attributes into **one object** `{ name: 'Coffee', price: 850, onSale: true }`
and passes it as the first argument. We **destructure** it in the parameter list.

Notes:
- `onSale` with no value means `onSale={true}`.
- Strings can use quotes `name="Coffee"`. Everything else uses braces: `price={850}`, `items={[1, 2]}`,
  `user={{ name: 'K' }}`, `onClick={handleClick}`.

## 2. Props are read-only

Like Flutter's `final` fields: **a component must never change its own props.**

```tsx
function Bad({ price }: { price: number }) {
  price = price * 2       // ❌ never do this
  return <p>{price}</p>
}
```

If something needs to change over time, that is **state** (next lesson). Props flow **down** from
parent to child — one direction only. This is the same as Flutter.

## 3. Passing functions as props (callbacks)

Flutter: `onPressed: () => ...`, `ValueChanged<T> onChanged`. React: exactly the same idea.

```tsx
type LikeButtonProps = {
  liked: boolean
  onToggle: () => void              // VoidCallback
}

function LikeButton({ liked, onToggle }: LikeButtonProps) {
  return <button onClick={onToggle}>{liked ? '❤️ Liked' : '🤍 Like'}</button>
}

// Parent decides what happens:
<LikeButton liked={false} onToggle={() => console.log('toggled!')} />
```

A callback with a value (Flutter `ValueChanged<int>`):

```tsx
type RatingProps = { value: number; onChange: (newValue: number) => void }

function Rating({ value, onChange }: RatingProps) {
  return (
    <div>
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} onClick={() => onChange(star)}>
          {star <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}
```

Naming convention: props that are callbacks start with **`on`** (`onClick`, `onSave`, `onDelete`).
Functions **inside** a component that handle them start with **`handle`** (`handleSave`).

## 4. `children` — Flutter's `child`

Anything you put **between** the opening and closing tags arrives as the `children` prop:

```tsx
import type { ReactNode } from 'react'

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
    </section>
  )
}

// Usage
<Card title="Profile">
  <p>Name: Kasun</p>
  <button>Edit</button>
</Card>
```

`ReactNode` = "anything React can render" (elements, strings, numbers, arrays, null). Like `Widget?`.

This is how you build **layout components** (`Card`, `Modal`, `Layout`, `Section`), exactly like a
Flutter widget that takes a `child`.

### "Slots" — more than one child

Flutter `Scaffold` has `appBar`, `body`, `floatingActionButton`. In React you just pass elements
as normal props:

```tsx
type PageProps = { header: ReactNode; sidebar?: ReactNode; children: ReactNode }

function Page({ header, sidebar, children }: PageProps) {
  return (
    <div className="page">
      <header>{header}</header>
      <div className="page-content">
        {sidebar && <aside>{sidebar}</aside>}
        <main>{children}</main>
      </div>
    </div>
  )
}

<Page header={<h1>Dashboard</h1>} sidebar={<nav>Menu</nav>}>
  <p>Main content</p>
</Page>
```

## 5. Passing objects and spreading props

```tsx
type User = { id: number; name: string; avatarUrl: string }

function UserRow({ user }: { user: User }) {
  return (
    <div className="row">
      <img src={user.avatarUrl} alt="" width={32} height={32} />
      <span>{user.name}</span>
    </div>
  )
}
```

Spreading — pass all fields of an object as separate props:

```tsx
const props = { name: 'Coffee', price: 850 }
<ProductCard {...props} />      // same as <ProductCard name="Coffee" price={850} />
```

Forwarding HTML attributes — a custom `Button` that accepts everything a normal `<button>` accepts:

```tsx
import type { ComponentProps } from 'react'

type ButtonProps = ComponentProps<'button'> & { variant?: 'primary' | 'ghost' }

function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  return <button className={`btn btn-${variant} ${className}`} {...rest} />
}

<Button variant="ghost" onClick={() => alert('hi')} disabled>Cancel</Button>
```

## 6. Props vs State — the key difference

|                   | Props                              | State                                   |
| ----------------- | ---------------------------------- | --------------------------------------- |
| Comes from        | the **parent**                     | the component **itself**                |
| Can it change?    | not by the child (read-only)       | yes, with the setter function           |
| Flutter           | widget constructor fields          | fields inside `State<T>` + `setState`   |
| When it changes   | parent re-renders child with new props | component re-renders                 |

## 7. Practice

👉 Do **Exercise 1 — Profile card** in `practice/01-react-playground`.

## Check yourself

1. How do you make a prop optional with a default value?
2. A child needs to tell its parent "the user clicked delete". How?
3. What is the type of `children`?

<details><summary>Answers</summary>

1. `prop?: type` in the type, and a default in destructuring: `{ size = 'md' }`.
2. The parent passes a callback prop like `onDelete`, and the child calls it: `onClick={() => onDelete(id)}`.
3. `ReactNode`.

</details>
