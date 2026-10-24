import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'

export default function AboutPage() {
  useDocumentTitle('About')

  return (
    <div className="stack">
      <h1>About</h1>
      <p>
        A practice project for Flutter developers learning <strong>React + Vite</strong>.
      </p>
      <div className="card stack">
        <h2>What this app uses</h2>
        <ul>
          <li>
            <strong>React Router</strong> — layout route, nested routes, <code>:taskId</code> params, search params
          </li>
          <li>
            <strong>Context + useReducer</strong> — app-wide task state (like BlocProvider)
          </li>
          <li>
            <strong>useEffect</strong> — saving to <code>localStorage</code>, setting the tab title
          </li>
          <li>
            <strong>fetch</strong> — importing sample tasks from JSONPlaceholder
          </li>
          <li>
            <strong>CSS Modules</strong> — scoped styles for <code>TaskItem</code>
          </li>
        </ul>
      </div>
      <p className="muted">Your tasks are saved in this browser only (localStorage). There is no backend.</p>
    </div>
  )
}
