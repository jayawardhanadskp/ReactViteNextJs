'use client'
// A tiny client component: only the confirm() dialog needs the browser.
// The <form> that contains it (in the server page) calls the server action.
import { useFormStatus } from 'react-dom'

export function DeleteRecipeButton({ title }: { title: string }) {
  const { pending } = useFormStatus() // true while the parent form's action is running

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) e.preventDefault()
      }}
      className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-red-950"
    >
      {pending ? 'Deleting…' : '🗑 Delete'}
    </button>
  )
}
