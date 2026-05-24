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

  const bulkAddRecipes = (incoming) => {
    setRecipes((prev) => {
      const existingIds = new Set(prev.map((r) => r.id))
      const toAdd = incoming.filter((r) => r.id && r.name && !existingIds.has(r.id))
      return [...toAdd, ...prev]
    })
  }

  const duplicateRecipe = (id) => {
    const original = recipes.find((r) => r.id === id)
    if (!original) return
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
    setRecipes((prev) => [copy, ...prev])
  }

  return { recipes, addRecipe, updateRecipe, deleteRecipe, getRecipe, bulkAddRecipes, duplicateRecipe }
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
  // 全ブランド・全フレーバーをlocalStorageで一元管理（初回は初期データで初期化）
  const [brands, setBrands] = useLocalStorage('shisha_brands', initialBrands)
  const [flavors, setFlavors] = useLocalStorage('shisha_flavors', initialFlavors)

  const getFlavor = (id) => flavors.find((f) => f.id === id) ?? null

  const toggleStock = (id) => {
    setFlavors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, inStock: f.inStock === false } : f))
    )
  }

  /** @param {Omit<import('../data/types').Flavor, 'id'|'isCustom'>} data */
  const addFlavor = (data) => {
    const newFlavor = { ...data, id: crypto.randomUUID(), isCustom: true }
    setFlavors((prev) => [...prev, newFlavor])
    return newFlavor
  }

  const updateFlavor = (id, updates) => {
    setFlavors((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  const deleteFlavor = (id) => {
    setFlavors((prev) => prev.filter((f) => f.id !== id))
  }

  /** @param {Omit<import('../data/types').Brand, 'id'|'isCustom'>} data */
  const addBrand = (data) => {
    const newBrand = { ...data, id: crypto.randomUUID(), isCustom: true }
    setBrands((prev) => [...prev, newBrand])
    return newBrand
  }

  const updateBrand = (id, updates) => {
    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)))
  }

  const deleteBrand = (id) => {
    setBrands((prev) => prev.filter((b) => b.id !== id))
    setFlavors((prev) => prev.filter((f) => f.brandId !== id))
  }

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

  const addTag = (name) => {
    const t = name.trim()
    if (!t || tags.includes(t)) return t
    setTags([...tags, t])
    return t
  }

  const deleteTag = (name) => {
    setTags(tags.filter((t) => t !== name))
  }

  return { tags, addTag, deleteTag }
}
