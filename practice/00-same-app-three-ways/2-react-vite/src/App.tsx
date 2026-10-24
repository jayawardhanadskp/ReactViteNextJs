import { useEffect, useState } from 'react'
import { Quote, type QuoteData } from './Quote.tsx'

export default function App() {
  const [quotes, setQuotes] = useState<QuoteData[] | null>(null)

  // The data is fetched BY THE BROWSER, after the page has loaded and React has started.
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      await new Promise((r) => setTimeout(r, 800)) // fake slow network so you can SEE the loading state
      const res = await fetch('/quotes.json', { signal: controller.signal })
      setQuotes(await res.json())
    }
    load().catch(() => {})
    return () => controller.abort()
  }, [])

  return (
    <main className="board">
      <h1>
        Quote Board <span className="tag">2 · React + Vite (CSR)</span>
      </h1>
      {quotes === null ? (
        <p>Loading quotes in the browser…</p>
      ) : (
        quotes.map((q) => <Quote key={q.id} text={q.text} author={q.author} />)
      )}
      <p className="note">Rendered in your browser at {new Date().toLocaleTimeString()}</p>
    </main>
  )
}
