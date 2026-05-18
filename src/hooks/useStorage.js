import { useLocalStorage } from './useLocalStorage'
import { initialBrands, initialFlavors } from '../data/initialFlavors'

/** @param {import('../data/types').FlavorItem[]} flavors */
function calcRecipeMeta(flavors) {
  const totalGrams = flavors.reduce((sum, f) => sum + (f.grams || 0), 0)
  const ratios = flavors.map((f) =>
    totalGrams > 0 ? `${Math.round((f.grams / totalGrams) * 100)}%` : '0%'
  )
  return { totalGrams, ratios }
}

// ---------------------------------------------------------------------------
// Recipes
// ---------------------------------------------------------------------------

/** @returns レシピのCRUD操作 */
export function useRecipes() {
  const [recipes, setRecipes] = useLocalStorage('shisha_recipes', [])

  /** @param {Omit<import('../data/types').Recipe, 'id'|'totalGrams'|'ratios'|'createdAt'|'updatedAt'>} data */
  const addRecipe = (data) => {
    const { totalGrams, ratios } = calcRecipeMeta(data.flavors ?? [])
    const newRecipe = {
      tastingNote: '',
      tags: [],
      settingId: null,
      rating: 0,
      ...data,
      totalGrams,
      ratios,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setRecipes((prev) => [newRecipe, ...prev])
    return newRecipe
  }

  const updateRecipe = (id, updates) => {
    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const merged = { ...r, ...updates }
        if (updates.flavors) {
          const { totalGrams, ratios } = calcRecipeMeta(updates.flavors)
          merged.totalGrams = totalGrams
          merged.ratios = ratios
        }
        merged.updatedAt = new Date().toISOString()
        return merged
      })
    )
  }

  const deleteRecipe = (id) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id))
  }

  const getRecipe = (id) => recipes.find((r) => r.id === id) ?? null

  return { recipes, addRecipe, updateRecipe, deleteRecipe, getRecipe }
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

/** @returns セッティングのCRUD操作 */
export function useSettings() {
  const [settings, setSettings] = useLocalStorage('shisha_settings', [])

  /** @param {Omit<import('../data/types').Setting, 'id'|'createdAt'|'updatedAt'>} data */
  const addSetting = (data) => {
    const newSetting = {
      bowlType: '',
      stemType: '',
      charcoalType: '',
      charcoalCount: 0,
      note: '',
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSettings((prev) => [newSetting, ...prev])
    return newSetting
  }

  const updateSetting = (id, updates) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      )
    )
  }

  const deleteSetting = (id) => {
    setSettings((prev) => prev.filter((s) => s.id !== id))
  }

  const getSetting = (id) => settings.find((s) => s.id === id) ?? null

  return { settings, addSetting, updateSetting, deleteSetting, getSetting }
}

// ---------------------------------------------------------------------------
// Flavors & Brands
// ---------------------------------------------------------------------------

/** @returns フレーバー・ブランドのCRUD操作 */
export function useFlavors() {
  const [brands, setBrands] = useLocalStorage('shisha_brands', initialBrands)
  const [customFlavors, setCustomFlavors] = useLocalStorage('shisha_custom_flavors', [])

  // 組み込みフレーバーとカスタムフレーバーをマージ
  const flavors = [...initialFlavors, ...customFlavors]

  /** @param {Omit<import('../data/types').Flavor, 'id'|'isCustom'>} data */
  const addFlavor = (data) => {
    const newFlavor = {
      ...data,
      id: crypto.randomUUID(),
      isCustom: true,
    }
    setCustomFlavors((prev) => [...prev, newFlavor])
    return newFlavor
  }

  const updateFlavor = (id, updates) => {
    // 組み込みフレーバーは編集不可
    setCustomFlavors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates, isCustom: true } : f))
    )
  }

  const deleteFlavor = (id) => {
    // isCustom: true のみ削除可
    setCustomFlavors((prev) => prev.filter((f) => f.id !== id))
  }

  const getFlavor = (id) => flavors.find((f) => f.id === id) ?? null

  /** @param {Omit<import('../data/types').Brand, 'id'|'isCustom'>} data */
  const addBrand = (data) => {
    const newBrand = { ...data, id: crypto.randomUUID(), isCustom: true }
    setBrands((prev) => [...prev, newBrand])
    return newBrand
  }

  const updateBrand = (id, updates) => {
    setBrands((prev) =>
      prev.map((b) => (b.id === id && b.isCustom ? { ...b, ...updates } : b))
    )
  }

  const deleteBrand = (id) => {
    setBrands((prev) => prev.filter((b) => !(b.id === id && b.isCustom)))
  }

  return {
    flavors,
    brands,
    getFlavor,
    addFlavor,
    updateFlavor,
    deleteFlavor,
    addBrand,
    updateBrand,
    deleteBrand,
  }
}
