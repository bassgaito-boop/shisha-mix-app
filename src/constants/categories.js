export const CATEGORIES = [
  'フルーツ', 'ミント', 'お菓子・スイーツ',
  'フローラル', 'ドリンク', 'ナッツ', 'スパイス', '変わり種',
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
