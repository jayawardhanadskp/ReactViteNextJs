// SOLUTION — Exercise 6: Theme switcher (Context: create → provide → consume)
import { createContext, useContext, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'
type ThemeContextValue = { theme: Theme; toggleTheme: () => void }

const ThemeContext = createContext<ThemeContextValue | null>(null)

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>
}

function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}

const colors = {
  light: { background: '#ffffff', text: '#0f172a', border: '#e2e8f0', accent: '#6366f1' },
  dark: { background: '#0f172a', text: '#e2e8f0', border: '#334155', accent: '#a5b4fc' },
}

// ---- Deep component tree: none of these pass `theme` as a prop ----

function ToggleButton() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button className="btn" onClick={toggleTheme}>
      {theme === 'light' ? '🌙 Dark mode' : '☀️ Light mode'}
    </button>
  )
}

function Toolbar() {
  return (
    <div className="row">
      <strong>My App</strong>
      <span className="spacer" />
      <ToggleButton />
    </div>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  const { theme } = useTheme()
  const c = colors[theme]
  return (
    <div
      style={{
        background: c.background,
        color: c.text,
        border: `1px solid ${c.border}`,
        borderRadius: 12,
        padding: 16,
        transition: 'background 200ms, color 200ms',
      }}
    >
      <h3 style={{ color: c.accent, marginBottom: 8 }}>{title}</h3>
      {children}
    </div>
  )
}

function Page() {
  const { theme } = useTheme()
  return (
    <div
      className="stack"
      style={{ background: theme === 'light' ? '#f8fafc' : '#020617', padding: 16, borderRadius: 16 }}
    >
      <Panel title="Toolbar">
        <Toolbar />
      </Panel>
      <Panel title="Content">
        <p>The current theme is "{theme}". Every panel reads it from context.</p>
      </Panel>
    </div>
  )
}

export default function Ex6ThemeSwitcher() {
  return (
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  )
}
