'use client'
// A client component because it uses useActionState (to show errors and the pending state).
// The form still posts to a SERVER action — the validation and saving happen on the server.
import { useActionState } from 'react'
import { createRecipeAction, type RecipeFormState } from '@/lib/actions'
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/types'

const initialState: RecipeFormState = {}

const inputClass =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-900'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-red-600">{message}</p>
}

export function RecipeForm() {
  const [state, formAction, pending] = useActionState(createRecipeAction, initialState)
  const v = state.values ?? {}

  return (
    // After an action, React resets the form fields to their defaultValue.
    // So we use the values returned by the server as defaultValue → the user's input is kept on errors.
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="font-semibold">Title</label>
        <input id="title" name="title" defaultValue={v.title} className={inputClass} placeholder="e.g. Coconut Sambol" />
        <FieldError message={state.errors?.title} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="font-semibold">Short description</label>
        <textarea id="description" name="description" rows={2} defaultValue={v.description} className={inputClass} />
        <FieldError message={state.errors?.description} />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="font-semibold">Category</label>
          <select id="category" name="category" defaultValue={v.category ?? ''} className={inputClass}>
            <option value="" disabled>Choose…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
          <FieldError message={state.errors?.category} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="minutes" className="font-semibold">Minutes</label>
          <input id="minutes" name="minutes" type="number" min={1} defaultValue={v.minutes} className={inputClass} />
          <FieldError message={state.errors?.minutes} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="servings" className="font-semibold">Servings</label>
          <input id="servings" name="servings" type="number" min={1} defaultValue={v.servings ?? '2'} className={inputClass} />
          <FieldError message={state.errors?.servings} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="ingredients" className="font-semibold">Ingredients <span className="font-normal text-stone-500">(one per line)</span></label>
        <textarea id="ingredients" name="ingredients" rows={5} defaultValue={v.ingredients} className={inputClass} />
        <FieldError message={state.errors?.ingredients} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="steps" className="font-semibold">Steps <span className="font-normal text-stone-500">(one per line)</span></label>
        <textarea id="steps" name="steps" rows={5} defaultValue={v.steps} className={inputClass} />
        <FieldError message={state.errors?.steps} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-orange-600 px-6 py-2.5 font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save recipe'}
      </button>
    </form>
  )
}
