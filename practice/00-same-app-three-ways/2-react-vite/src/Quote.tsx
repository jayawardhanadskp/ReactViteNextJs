import { useState } from 'react'

export type QuoteData = { id: number; text: string; author: string }

export function Quote({ text, author }: Omit<QuoteData, 'id'>) {
  const [likes, setLikes] = useState(0)
  return (
    <article className="quote">
      <p>“{text}”</p>
      <div className="row">
        <span>— {author}</span>
        <button onClick={() => setLikes((n) => n + 1)}>❤️ {likes}</button>
      </div>
    </article>
  )
}
