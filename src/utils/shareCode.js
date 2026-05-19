const PREFIX = 'SHI-'

export function encodeRecipe(recipe, getFlavor, brands) {
  const data = {
    v: 1,
    n: recipe.name,
    f: (recipe.flavors ?? []).map((item) => {
      const fl = getFlavor(item.flavorId)
      const br = brands.find((b) => b.id === item.brandId)
      return { b: br?.name ?? '', fl: fl?.name ?? '', g: item.grams }
    }),
    t: '',
  }
  const json = JSON.stringify(data)
  const b64 = btoa(
    encodeURIComponent(json).replace(/%([0-9A-F]{2})/gi, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  )
  return PREFIX + b64
}

export function decodeRecipe(code) {
  const trimmed = code.trim()
  if (!trimmed.startsWith(PREFIX)) throw new Error('無効なコードです（SHI- で始まる必要があります）')
  const b64 = trimmed.slice(PREFIX.length)
  try {
    const json = decodeURIComponent(
      Array.from(atob(b64))
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    const data = JSON.parse(json)
    if (data.v !== 1) throw new Error('非対応のコードバージョンです')
    return data
  } catch (e) {
    if (e.message.includes('バージョン') || e.message.includes('無効')) throw e
    throw new Error('コードの解析に失敗しました。正しいコードか確認してください')
  }
}
