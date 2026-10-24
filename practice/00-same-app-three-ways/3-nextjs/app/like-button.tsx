'use client'
// ↑ This is a CLIENT component: its JavaScript is sent to the browser, so it can use
//   useState and onClick. Only this small button is interactive — the rest of the page is not.
import { useState } from 'react'

export function LikeButton() {
  const [likes, setLikes] = useState(0)
  return <button onClick={() => setLikes((n) => n + 1)}>❤️ {likes}</button>
}
