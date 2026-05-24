import { useLocalStorage } from './useLocalStorage'
import { initialRecipes } from '../data/initialRecipes'

export function useRecipes() {
  const [recipes, setRecipes] = useLocalStorage('shisha_recipes', initialRecipes)

  const addRecipe = (recipe) => {
    const newRecipe = {
      ...recipe,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setRecipes((prev) => [newRecipe, ...prev])
    return newRecipe
  }

  const deleteRecipe = (id) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id))
  }

  const updateRecipe = (id, updates) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r))
    )
  }

  return { recipes, addRecipe, deleteRecipe, updateRecipe }
}
