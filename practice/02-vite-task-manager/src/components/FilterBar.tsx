// Status filter + search. The values live in the URL (?status=done&q=react),
// so refresh / back button / sharing the link keep the same filter.
import type { StatusFilter } from '../types.ts'

type FilterBarProps = {
  status: StatusFilter
  query: string
  onStatusChange: (status: StatusFilter) => void
  onQueryChange: (query: string) => void
}

const options: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Done' },
]

export default function FilterBar({ status, query, onStatusChange, onQueryChange }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="segmented" role="group" aria-label="Filter by status">
        {options.map((o) => (
          <button
            key={o.value}
            className={status === o.value ? 'active' : ''}
            aria-pressed={status === o.value}
            onClick={() => onStatusChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <input
        className="input search"
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search tasks…"
        aria-label="Search tasks"
      />
    </div>
  )
}
