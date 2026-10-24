/*
 * EXERCISE 6 — Theme switcher (Context)                    Lesson: 02-react-core/07
 * ---------------------------------------------------------------------------------
 * Flutter version: ChangeNotifierProvider<ThemeModel> at the top, context.watch<ThemeModel>() below.
 *
 * Right now every component uses the constant `theme = 'light'` and the toggle button does nothing.
 * Make the theme shared through Context — WITHOUT passing it as props through Page → Panel → Toolbar.
 *
 * TODO 1. Create the context:  const ThemeContext = createContext<ThemeContextValue | null>(null)
 * TODO 2. Write ThemeProvider: it owns `theme` state ('light' | 'dark') and a toggleTheme function,
 *         and renders <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>
 * TODO 3. Write the custom hook useTheme(): calls useContext(ThemeContext), throws an Error
 *         if it is null ("useTheme must be used inside <ThemeProvider>"), returns the value.
 * TODO 4. Replace every `const theme = 'light'` below with `const { theme } = useTheme()`.
 *         In ToggleButton also take toggleTheme and call it on click.
 * TODO 5. Wrap <Page /> with <ThemeProvider> in Ex6ThemeSwitcher.
 *
 * Bonus: what error do you get if you forget TODO 5? (That's why the hook throws.)
 */
import type { ReactNode } from 'react'

type Theme = 'light' | 'dark'
type ThemeContextValue = { theme: Theme; toggleTheme: () => void }

// TODO 1

// TODO 2: function ThemeProvider({ children }: { children: ReactNode }) { ... }

// TODO 3: function useTheme() { ... }

const colors = {
  light: { background: '#ffffff', text: '#0f172a', border: '#e2e8f0', accent: '#6366f1' },
  dark: { background: '#0f172a', text: '#e2e8f0', border: '#334155', accent: '#a5b4fc' },
}

function ToggleButton() {
  const theme: Theme = 'light' // TODO 4
  return <button className="btn">{theme === 'light' ? '🌙 Dark mode' : '☀️ Light mode'}</button>
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
  const theme: Theme = 'light' // TODO 4
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
  const theme: Theme = 'light' // TODO 4
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
  // TODO 5
  return <Page />
}
