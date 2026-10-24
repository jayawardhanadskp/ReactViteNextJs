import { Link, useLocation } from 'react-router'

export default function NotFoundPage() {
  const location = useLocation()

  return (
    <div className="stack">
      <h1>404 — Page not found</h1>
      <p className="muted">
        There is no page at <code>{location.pathname}</code>.
      </p>
      <Link to="/">← Go to the dashboard</Link>
    </div>
  )
}
