// ROUTE HANDLER  →  GET /api/recipes/pol-roti
import type { NextRequest } from 'next/server'
import { getRecipe } from '@/lib/recipes'

export async function GET(_request: NextRequest, ctx: RouteContext<'/api/recipes/[id]'>) {
  const { id } = await ctx.params
  const recipe = await getRecipe(id)

  if (!recipe) {
    return Response.json({ error: 'Recipe not found' }, { status: 404 })
  }
  return Response.json(recipe)
}
