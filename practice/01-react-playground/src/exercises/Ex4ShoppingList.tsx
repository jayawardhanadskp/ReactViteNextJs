/*
 * EXERCISE 4 — Shopping list (lists, keys, conditional UI, immutable updates)
 *                                                          Lesson: 02-react-core/05
 * ---------------------------------------------------------------------------------
 * The list is already in state and rendered without features. Add them one by one.
 * Remember exercise 02 from web foundations: NEVER mutate. Always create new arrays/objects.
 *
 * TODO 1. Render the items with .map(). Each <li> needs a `key` (use item.id).
 *         Show: a checkbox (checked = item.bought), the name, a badge "× qty", and a ✕ button.
 *         Bought items have their name crossed out (style textDecoration: 'line-through').
 * TODO 2. Checkbox toggles `bought` for that item.     Hint: items.map(...)
 * TODO 3. ✕ button removes that item.                  Hint: items.filter(...)
 * TODO 4. The form adds a new item (name + qty) with id: crypto.randomUUID(), bought: false.
 *         Ignore empty names. After adding, clear the inputs. Disable "Add" when name is empty.
 * TODO 5. Filter buttons: All / To buy / Bought. Store the filter in state, and compute
 *         `visibleItems` from items + filter (derived — not another state!).
 *         The active filter button has the class 'btn btn-primary'.
 * TODO 6. If visibleItems is empty, show "Nothing here 🎉" instead of the list.
 * TODO 7. Footer: "<bought> of <total> bought", and a "Clear bought" button that is shown
 *         ONLY when at least one item is bought (careful with the `0 &&` trap!).
 */
import { useState, type FormEvent } from 'react'

type Item = { id: string; name: string; qty: number; bought: boolean }

const starterItems: Item[] = [
  { id: '1', name: 'Rice', qty: 2, bought: false },
  { id: '2', name: 'Coconut', qty: 3, bought: true },
  { id: '3', name: 'Tea', qty: 1, bought: false },
]

export default function Ex4ShoppingList() {
  const [items, setItems] = useState<Item[]>(starterItems)

  function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // TODO 4
  }

  return (
    <div className="stack" style={{ maxWidth: 480 }}>
      <form onSubmit={handleAdd} className="row">
        <input className="input" placeholder="Item name" aria-label="Item name" />
        <input className="input" type="number" min={1} defaultValue={1} style={{ width: 80 }} aria-label="Quantity" />
        <button className="btn btn-primary">Add</button>
      </form>

      <div className="row">
        <button className="btn btn-primary">All</button>
        <button className="btn">To buy</button>
        <button className="btn">Bought</button>
      </div>

      <ul className="stack" style={{ listStyle: 'none', padding: 0, margin: 0, gap: 8 }}>
        {/* TODO 1: replace this with items.map(...) */}
        <li className="card row" style={{ padding: 10 }}>
          {items[0]?.name}
        </li>
      </ul>

      {/* TODO 7 */}
    </div>
  )
}
