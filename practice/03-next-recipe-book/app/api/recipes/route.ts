// ROUTE HANDLER  →  GET /api/recipes
// A normal JSON REST endpoint. Other apps can use it — for example YOUR FLUTTER APP:
//   final res = await http.get(Uri.parse('http://localhost:3000/api/recipes'));
import { getRecipes } from '@/lib/recipes'

export async function GET() {
  const recipes = await getRecipes()
  return Response.json(recipes)
}
