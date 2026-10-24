// The playground shell: a menu of exercises + a switch between "My code" and "Solution".
// You don't need to edit this file. Your work happens in src/exercises/.
import { useState, type ComponentType } from 'react'

import Ex1Mine from './exercises/Ex1ProfileCard'
import Ex2Mine from './exercises/Ex2Counter'
import Ex3Mine from './exercises/Ex3LoginForm'
import Ex4Mine from './exercises/Ex4ShoppingList'
import Ex5Mine from './exercises/Ex5UserFetcher'
import Ex6Mine from './exercises/Ex6ThemeSwitcher'
import Ex7Mine from './exercises/Ex7Stopwatch'

import Ex1Solution from './solutions/Ex1ProfileCard'
import Ex2Solution from './solutions/Ex2Counter'
import Ex3Solution from './solutions/Ex3LoginForm'
import Ex4Solution from './solutions/Ex4ShoppingList'
import Ex5Solution from './solutions/Ex5UserFetcher'
import Ex6Solution from './solutions/Ex6ThemeSwitcher'
import Ex7Solution from './solutions/Ex7Stopwatch'

type Exercise = {
  title: string
  lesson: string
  file: string
  Mine: ComponentType
  Solution: ComponentType
}

const exercises: Exercise[] = [
  { title: 'Profile card', lesson: '02 Props & children', file: 'Ex1ProfileCard.tsx', Mine: Ex1Mine, Solution: Ex1Solution },
  { title: 'Counter', lesson: '03 useState', file: 'Ex2Counter.tsx', Mine: Ex2Mine, Solution: Ex2Solution },
  { title: 'Login form', lesson: '04 Events & forms', file: 'Ex3LoginForm.tsx', Mine: Ex3Mine, Solution: Ex3Solution },
  { title: 'Shopping list', lesson: '05 Lists & conditions', file: 'Ex4ShoppingList.tsx', Mine: Ex4Mine, Solution: Ex4Solution },
  { title: 'User fetcher', lesson: '06 useEffect & fetch', file: 'Ex5UserFetcher.tsx', Mine: Ex5Mine, Solution: Ex5Solution },
  { title: 'Theme switcher', lesson: '07 Context', file: 'Ex6ThemeSwitcher.tsx', Mine: Ex6Mine, Solution: Ex6Solution },
  { title: 'Stopwatch', lesson: '08 useRef & custom hooks', file: 'Ex7Stopwatch.tsx', Mine: Ex7Mine, Solution: Ex7Solution },
]

function readSavedIndex(): number {
  try {
    const saved = Number(localStorage.getItem('playground:index'))
    return saved >= 0 && saved < exercises.length ? saved : 0
  } catch {
    return 0
  }
}

export default function App() {
  const [index, setIndex] = useState(readSavedIndex)
  const [showSolution, setShowSolution] = useState(false)

  const current = exercises[index]
  const Shown = showSolution ? current.Solution : current.Mine

  function select(i: number) {
    setIndex(i)
    setShowSolution(false)
    try {
      localStorage.setItem('playground:index', String(i))
    } catch {
      // storage can be blocked — the playground still works
    }
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <h1 className="logo">⚛️ React Playground</h1>
        <nav>
          {exercises.map((ex, i) => (
            <button
              key={ex.file}
              className={i === index ? 'nav-item active' : 'nav-item'}
              onClick={() => select(i)}
            >
              <span className="nav-number">{i + 1}</span>
              <span>
                {ex.title}
                <small>{ex.lesson}</small>
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        <header className="content-header">
          <div>
            <h2>
              Exercise {index + 1} — {current.title}
            </h2>
            <p className="muted">
              Edit <code>src/exercises/{current.file}</code> · instructions are at the top of the file
            </p>
          </div>
          <div className="segmented">
            <button className={!showSolution ? 'active' : ''} onClick={() => setShowSolution(false)}>
              My code
            </button>
            <button className={showSolution ? 'active' : ''} onClick={() => setShowSolution(true)}>
              Solution
            </button>
          </div>
        </header>

        {/* key forces a fresh component (fresh state) when you switch exercise or mode */}
        <section className="stage" key={`${index}-${showSolution}`}>
          <Shown />
        </section>
      </main>
    </div>
  )
}
