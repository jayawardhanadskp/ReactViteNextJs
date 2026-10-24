// This is a SERVER component (the default in Next.js). It runs on the server / at build time.
// Its code is NOT sent to the browser — only the HTML it produces.
import { Suspense } from 'react'
import { connection } from 'next/server'
import quotes from '@/data/quotes.json' // read directly — no fetch, no useEffect, no loading state
import { LikeButton } from './like-button'

export default function Page() {
  // 👀 This log appears in the TERMINAL (server), not in the browser console.
  console.log('Rendering the quote list on the server')

  return (
    <main className="board">
      <h1>
        Quote Board <span className="tag">3 · Next.js (server rendered)</span>
      </h1>

      {quotes.map((q) => (
        <article key={q.id} className="quote">
          <p>“{q.text}”</p>
          <div className="row">
            <span>— {q.author}</span>
            <LikeButton />
          </div>
        </article>
      ))}

      {/* A dynamic part: rendered on EVERY request and streamed in (Partial Prerendering). */}
      <Suspense fallback={<p className="note">Asking the server for the time…</p>}>
        <ServerTime />
      </Suspense>
    </main>
  )
}

async function ServerTime() {
  await connection() // "this needs a real request" → not prerendered at build time
  return <p className="note">This line was rendered on the server at {new Date().toLocaleTimeString()}</p>
}
