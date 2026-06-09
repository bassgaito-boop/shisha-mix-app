import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { initialBrands, initialFlavors } from '../data/initialFlavors'
import { initialRecipes } from '../data/initialRecipes'
import { INITIAL_TAGS } from '../constants/categories'

// 初回またはレシピが空のユーザーにサンプルレシピを投入
;(() => {
  if (typeof window === 'undefined') return
  if (!window.localStorage.getItem('shisha_seeded')) {
    window.localStorage.setItem('shisha_seeded', '1')
    const stored = window.localStorage.getItem('shisha_recipes')
    if (!stored || stored === '[]') {
      window.localStorage.setItem('shisha_recipes', JSON.stringify(initialRecipes))
    }
  }
})()

// 既存ユーザーのタグ・フレーバーカテゴリを日本語→英語へ移行
;(() => {
  if (typeof window === 'undefined') return
  if (window.localStorage.getItem('shisha_tags_en_migrated')) return
  window.localStorage.setItem('shisha_tags_en_migrated', '1')
  const tagMap = {
    'フルーツ': 'Fruits', 'ミント': 'Mint', 'お菓子・スイーツ': 'Candy & Sweets',
    'フローラル': 'Floral', 'ドリンク': 'Drinks', 'ナッツ': 'Nuts',
    'スパイス': 'Spices', '変わり種': 'Exotic',
  }
  const tagsRaw = window.localStorage.getItem('shisha_tags')
  if (tagsRaw) {
    try {
      const tags = JSON.parse(tagsRaw)
      const migrated = tags.map((t) => tagMap[t] ?? t)
      window.localStorage.setItem('shisha_tags', JSON.stringify(migrated))
    } catch {}
  }
  const flavorsRaw = window.localStorage.getItem('shisha_flavors')
  if (flavorsRaw) {
    try {
      const flavors = JSON.parse(flavorsRaw)
      const migrated = flavors.map((f) => ({
        ...f,
        category: f.category ? (tagMap[f.category] ?? f.category) : f.category,
        categories: f.categories ? f.categories.map((c) => tagMap[c] ?? c) : f.categories,
        tags: f.tags ? f.tags.map((t) => tagMap[t] ?? t) : f.tags,
      }))
      window.localStorage.setItem('shisha_flavors', JSON.stringify(migrated))
    } catch {}
  }
})()

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
  const [recipes, setRecipes] = useLocalStorage('shisha_recipes', initialRecipes)

  const addRecipe = useCallback((data) => {
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
  }, [setRecipes])

  const updateRecipe = useCallback((id, updates) => {
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
  }, [setRecipes])

  const deleteRecipe = useCallback((id) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id))
  }, [setRecipes])

  const getRecipe = useCallback((id) => {
    // NOTE: This is called at mount time in RecipeCreate, not in a hot render path
    return recipes.find((r) => r.id === id) ?? null
  }, [recipes])

  const bulkAddRecipes = useCallback((incoming) => {
    setRecipes((prev) => {
      const existingIds = new Set(prev.map((r) => r.id))
      const toAdd = incoming.filter((r) =>
        r.id &&
        typeof r.id === 'string' &&
        r.name &&
        typeof r.name === 'string' &&
        Array.isArray(r.flavors) &&
        !existingIds.has(r.id)
      )
      return [...toAdd, ...prev]
    })
  }, [setRecipes])

  const toggleFavorite = useCallback((id) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    )
  }, [setRecipes])

  const duplicateRecipe = useCallback((id) => {
    setRecipes((prev) => {
      const original = prev.find((r) => r.id === id)
      if (!original) return prev
      const { totalGrams, ratios } = calcRecipeMeta(original.flavors ?? [])
      const copy = {
        ...original,
        id: crypto.randomUUID(),
        name: original.name + ' (コピー)',
        totalGrams,
        ratios,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return [copy, ...prev]
    })
  }, [setRecipes])

  return { recipes, addRecipe, updateRecipe, deleteRecipe, getRecipe, bulkAddRecipes, duplicateRecipe, toggleFavorite }
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

/** @returns セッティングのCRUD操作 */
export function useSettings() {
  const [settings, setSettings] = useLocalStorage('shisha_settings', [])

  const addSetting = useCallback((data) => {
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
  }, [setSettings])

  const updateSetting = useCallback((id, updates) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      )
    )
  }, [setSettings])

  const deleteSetting = useCallback((id) => {
    setSettings((prev) => prev.filter((s) => s.id !== id))
  }, [setSettings])

  const getSetting = useCallback((id) => settings.find((s) => s.id === id) ?? null, [settings])

  return { settings, addSetting, updateSetting, deleteSetting, getSetting }
}

// ---------------------------------------------------------------------------
// Flavors & Brands
// ---------------------------------------------------------------------------

/** @returns フレーバー・ブランドのCRUD操作 */
export function useFlavors() {
  const [brands, setBrands] = useLocalStorage('shisha_brands', initialBrands)
  const [flavors, setFlavors] = useLocalStorage('shisha_flavors', initialFlavors)

  const getFlavor = useCallback((id) => flavors.find((f) => f.id === id) ?? null, [flavors])

  const toggleStock = useCallback((id) => {
    setFlavors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, inStock: f.inStock === false } : f))
    )
  }, [setFlavors])

  const addFlavor = useCallback((data) => {
    const newFlavor = { ...data, id: crypto.randomUUID(), isCustom: true }
    setFlavors((prev) => [...prev, newFlavor])
    return newFlavor
  }, [setFlavors])

  const updateFlavor = useCallback((id, updates) => {
    setFlavors((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }, [setFlavors])

  const deleteFlavor = useCallback((id) => {
    setFlavors((prev) => prev.filter((f) => f.id !== id))
  }, [setFlavors])

  const addBrand = useCallback((data) => {
    const newBrand = { ...data, id: crypto.randomUUID(), isCustom: true }
    setBrands((prev) => [...prev, newBrand])
    return newBrand
  }, [setBrands])

  const updateBrand = useCallback((id, updates) => {
    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)))
  }, [setBrands])

  const deleteBrand = useCallback((id) => {
    setBrands((prev) => prev.filter((b) => b.id !== id))
    setFlavors((prev) => prev.filter((f) => f.brandId !== id))
  }, [setBrands, setFlavors])

  return {
    flavors,
    brands,
    getFlavor,
    toggleStock,
    addFlavor,
    updateFlavor,
    deleteFlavor,
    addBrand,
    updateBrand,
    deleteBrand,
  }
}

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export function useTags() {
  const [tags, setTags] = useLocalStorage('shisha_tags', INITIAL_TAGS)

  const addTag = useCallback((name) => {
    const t = name.trim()
    if (!t || tags.includes(t)) return t
    setTags((prev) => [...prev, t])
    return t
  }, [tags, setTags])

  const deleteTag = useCallback((name) => {
    setTags((prev) => prev.filter((t) => t !== name))
  }, [setTags])

  return { tags, addTag, deleteTag }
}

// ---------------------------------------------------------------------------
// Recipe Tags (フレーバーカテゴリとは別管理)
// ---------------------------------------------------------------------------

export function useRecipeTags() {
  const [recipeTags, setRecipeTags] = useLocalStorage('shisha_recipe_tags', [])

  const addRecipeTag = useCallback((name) => {
    const t = name.trim()
    if (!t || recipeTags.includes(t)) return t
    setRecipeTags((prev) => [...prev, t])
    return t
  }, [recipeTags, setRecipeTags])

  const deleteRecipeTag = useCallback((name) => {
    setRecipeTags((prev) => prev.filter((t) => t !== name))
  }, [setRecipeTags])

  return { recipeTags, addRecipeTag, deleteRecipeTag }
}
