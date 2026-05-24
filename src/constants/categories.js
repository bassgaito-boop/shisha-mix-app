export const CATEGORIES = [
  'Fruits', 'Mint', 'Candy & Sweets',
  'Floral', 'Drinks', 'Nuts', 'Spices', 'Exotic',
]

export const INITIAL_TAGS = [...CATEGORIES]

export function getCategories(flavor) {
  return flavor.categories ?? (flavor.category ? [flavor.category] : [])
}

// tags / categories / category のいずれかからタグ配列を返す
export function getTags(flavor) {
  if (flavor.tags !== undefined) return flavor.tags
  if (flavor.categories !== undefined) return flavor.categories
  if (flavor.category) return [flavor.category]
  return []
}
