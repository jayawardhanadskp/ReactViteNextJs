// SOLUTION — Exercise 4: Shopping list (lists, keys, conditional UI, immutable updates)
import { useState, type FormEvent } from 'react'

type Item = { id: string; name: string; qty: number; bought: boolean }
type Filter = 'all' | 'toBuy' | 'bought'

const starterItems: Item[] = [
  { id: '1', name: 'Rice', qty: 2, bought: false },
  { id: '2', name: 'Coconut', qty: 3, bought: true },
  { id: '3', name: 'Tea', qty: 1, bought: false },
]

export default function Ex4ShoppingList() {
  const [items, setItems] = useState<Item[]>(starterItems)
  const [name, setName] = useState('')
  const [qty, setQty] = useState(1)
  const [filter, setFilter] = useState<Filter>('all')

  const visibleItems = items.filter((item) =>
    filter === 'all' ? true : filter === 'bought' ? item.bought : !item.bought,
  )
  const boughtCount = items.filter((i) => i.bought).length

  function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed === '') return
    setItems((prev) => [...prev, { id: crypto.randomUUID(), name: trimmed, qty, bought: false }])
    setName('')
    setQty(1)
  }

  const toggleBought = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, bought: !i.bought } : i)))

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))

  const clearBought = () => setItems((prev) => prev.filter((i) => !i.bought))

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'toBuy', label: 'To buy' },
    { value: 'bought', label: 'Bought' },
  ]

  return (
    <div className="stack" style={{ maxWidth: 480 }}>
      <form onSubmit={handleAdd} className="row">
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          aria-label="Item name"
        />
        <input
          className="input"
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          style={{ width: 80 }}
          aria-label="Quantity"
        />
        <button className="btn btn-primary" disabled={name.trim() === ''}>
          Add
        </button>
      </form>

      <div className="row">
        {filters.map((f) => (
          <button
            key={f.value}
            className={filter === f.value ? 'btn btn-primary' : 'btn'}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visibleItems.length === 0 ? (
        <p className="muted">Nothing here 🎉</p>
      ) : (
        <ul className="stack" style={{ listStyle: 'none', padding: 0, margin: 0, gap: 8 }}>
          {visibleItems.map((item) => (
            <li key={item.id} className="card row" style={{ padding: 10 }}>
              <input type="checkbox" checked={item.bought} onChange={() => toggleBought(item.id)} />
              <span style={{ textDecoration: item.bought ? 'line-through' : 'none' }}>{item.name}</span>
              <span className="badge">× {item.qty}</span>
              <span className="spacer" />
              <button className="btn btn-ghost btn-danger" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="row">
        <p className="muted">
          {boughtCount} of {items.length} bought
        </p>
        <span className="spacer" />
        {boughtCount > 0 && (
          <button className="btn" onClick={clearBought}>
            Clear bought
          </button>
        )}
      </div>
    </div>
  )
}
