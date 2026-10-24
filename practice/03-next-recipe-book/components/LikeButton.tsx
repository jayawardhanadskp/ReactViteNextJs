'use client'
// A CLIENT component: it needs onClick and state, so its JS is sent to the browser.
// It calls a SERVER action (likeRecipeAction) — the browser sends a POST request for you.
import { useOptimistic, useTransition } from 'react'
import { likeRecipeAction } from '@/lib/actions'

export function LikeButton({ recipeId, likes }: { recipeId: string; likes: number }) {
  // useOptimistic: show +1 immediately, before the server answers (optimistic UI).
  // When the server re-renders the page with the real `likes`, this value follows it.
  const [optimisticLikes, addOptimisticLike] = useOptimistic(likes, (current, added: number) => current + added)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      addOptimisticLike(1)
      await likeRecipeAction(recipeId)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 font-semibold text-rose-700 transition hover:bg-rose-100 active:scale-95 disabled:opacity-70 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
    >
      ❤️ {optimisticLikes} {optimisticLikes === 1 ? 'like' : 'likes'}
    </button>
  )
}
