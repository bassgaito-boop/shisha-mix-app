import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, ChevronRight, ChevronLeft } from 'lucide-react'
import { useRecipes, useFlavors } from '../hooks/useStorage'

const SLICE_COLORS = [
  '#c9a84c', '#e87d5a', '#7ec8a0', '#7ab8e8',
  '#c87eb8', '#e8a84c', '#e87878', '#5ac8b0',
]

export default function RecipeCreate() {
  const navigate = useNavigate()
  const { addRecipe } = useRecipes()
  const { brands, flavors: allFlavors, getFlavor } = useFlavors()

  const [name, setName] = useState('')
  const [flavorItems, setFlavorItems] = useState([{ brandId: '', flavorId: '', grams: 5 }])
  const [tastingNote, setTastingNote] = useState('')

  // ピッカー制御
  const [pickerIndex, setPickerIndex] = useState(null)
  const [pickerStep, setPickerStep] = useState('brand') // 'brand' | 'flavor'
  const [pickerBrandId, setPickerBrandId] = useState(null)

  const openPicker = (index) => {
    setPickerIndex(index)
    setPickerStep('brand')
    setPickerBrandId(null)
  }

  const closePicker = () => {
    setPickerIndex(null)
    setPickerBrandId(null)
  }

  const handleSelectBrand = (brandId) => {
    setPickerBrandId(brandId)
    setPickerStep('flavor')
  }

  const handleSelectFlavor = (flavorId) => {
    setFlavorItems((prev) =>
      prev.map((f, i) =>
        i === pickerIndex ? { ...f, brandId: pickerBrandId, flavorId } : f
      )
    )
    closePicker()
  }

  const addFlavorItem = () =>
    setFlavorItems((prev) => [...prev, { brandId: '', flavorId: '', grams: 5 }])

  const removeFlavorItem = (index) =>
    setFlavorItems((prev) => prev.filter((_, i) => i !== index))

  const updateGrams = (index, val) =>
    setFlavorItems((prev) =>
      prev.map((f, i) => (i === index ? { ...f, grams: Math.max(0.1, Number(val) || 0.1) } : f))
    )

  const totalGrams = flavorItems.reduce((s, f) => s + (f.grams || 0), 0)

  const handleSave = () => {
    if (!name.trim()) return alert('レシピ名を入力してください')
    if (flavorItems.some((f) => !f.flavorId)) return alert('すべてのフレーバーを選択してください')
    addRecipe({
      name: name.trim(),
      flavors: flavorItems,
      tastingNote: tastingNote.trim(),
      tags: [],
      rating: 0,
      settingId: null,
    })
    navigate('/recipes')
  }

  // 選択済みフレーバーの表示ラベルを返す
  const getLabel = (item) => {
    if (!item.flavorId) return null
    const flavor = getFlavor(item.flavorId)
    const brand = brands.find((b) => b.id === item.brandId)
    return flavor ? { nameJa: flavor.nameJa, name: flavor.name, brandJa: brand?.nameJa ?? brand?.name } : null
  }

  // ピッカー用: 選択ブランドのフレーバーをカテゴリ別に整理
  const flavorsByCategory = allFlavors
    .filter((f) => f.brandId === pickerBrandId)
    .reduce((acc, f) => {
      ;(acc[f.category] ??= []).push(f)
      return acc
    }, {})

  const selectedBrand = brands.find((b) => b.id === pickerBrandId)

  // チャート用スライス
  const chartSlices = flavorItems
    .filter((item) => item.flavorId && item.grams > 0)
    .map((item, i) => ({
      grams: item.grams,
      label: getFlavor(item.flavorId)?.nameJa ?? '',
      color: SLICE_COLORS[i % SLICE_COLORS.length],
    }))

  return (
    <div className="px-5 pt-14 pb-8">

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[#c9a84c] tracking-[0.3em] text-[10px] uppercase mb-1">New</p>
          <h2
            className="text-2xl text-[#f0ede8]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Create Recipe
          </h2>
        </div>
        <button onClick={() => navigate(-1)} className="text-[#5a5555] p-2">
          <X size={20} />
        </button>
      </div>

      {/* レシピ名 */}
      <div className="mb-6">
        <label className="block text-[#5a5555] text-xs tracking-widest uppercase mb-2">
          Recipe Name
        </label>
        <input
          type="text"
          placeholder="例: Summer Breeze"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-[#111] border border-[rgba(201,168,76,0.15)] text-[#f0ede8] placeholder-[#3a3535] text-sm outline-none focus:border-[rgba(201,168,76,0.4)] transition-colors"
        />
      </div>

      {/* フレーバーセクション */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[#5a5555] text-xs tracking-widest uppercase">Flavors</label>
          {totalGrams > 0 && (
            <span className="text-[#c9a84c] text-xs font-mono">合計 {totalGrams}g</span>
          )}
        </div>

        <div className="space-y-2">
          {flavorItems.map((item, i) => {
            const label = getLabel(item)
            return (
              <div key={i} className="flex items-center gap-2">

                {/* フレーバー選択ボタン */}
                <button
                  onClick={() => openPicker(i)}
                  className="flex-1 flex items-center gap-3 px-3 py-2.5 bg-[#111] border border-[rgba(201,168,76,0.15)] text-left active:border-[rgba(201,168,76,0.4)] transition-colors min-w-0"
                >
                  {label ? (
                    <div className="flex-1 min-w-0">
                      <p className="text-[#f0ede8] text-sm truncate">{label.nameJa}</p>
                      <p className="text-[#5a5555] text-[10px]">{label.brandJa} · {label.name}</p>
                    </div>
                  ) : (
                    <span className="text-[#3a3535] text-sm flex-1">フレーバーを選択...</span>
                  )}
                  <ChevronRight size={13} className="text-[#5a5555] shrink-0" />
                </button>

                {/* グラム数入力 */}
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={item.grams}
                    min={0.1}
                    step={0.1}
                    onChange={(e) => updateGrams(i, e.target.value)}
                    className="w-12 px-1 py-2.5 bg-[#111] border border-[rgba(201,168,76,0.15)] text-[#f0ede8] text-sm text-center outline-none focus:border-[rgba(201,168,76,0.4)] transition-colors"
                  />
                  <span className="text-[#5a5555] text-xs">g</span>
                </div>

                {/* 削除 */}
                {flavorItems.length > 1 && (
                  <button onClick={() => removeFlavorItem(i)} className="text-[#3a3535] p-1 shrink-0">
                    <X size={16} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={addFlavorItem}
          className="mt-3 w-full py-3 border border-dashed border-[rgba(201,168,76,0.2)] text-[#5a5555] text-xs tracking-widest uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <Plus size={14} />
          Add Flavor
        </button>
      </div>

      {/* 円グラフ */}
      {chartSlices.length > 0 && (
        <div className="mb-6">
          <DonutChart slices={chartSlices} total={totalGrams} />
        </div>
      )}

      {/* テイスティングノート */}
      <div className="mb-8">
        <label className="block text-[#5a5555] text-xs tracking-widest uppercase mb-2">
          Tasting Note
        </label>
        <textarea
          rows={3}
          placeholder="感想、温度設定、コツなど..."
          value={tastingNote}
          onChange={(e) => setTastingNote(e.target.value)}
          className="w-full px-4 py-3 bg-[#111] border border-[rgba(201,168,76,0.15)] text-[#f0ede8] placeholder-[#3a3535] text-sm outline-none focus:border-[rgba(201,168,76,0.4)] transition-colors resize-none"
        />
      </div>

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        className="w-full py-4 text-[#0a0a0a] font-semibold text-sm tracking-widest uppercase active:scale-[0.98] transition-all duration-200"
        style={{
          background: 'linear-gradient(135deg, #c9a84c, #e8c97a)',
          boxShadow: '0 0 24px rgba(201,168,76,0.25)',
        }}
      >
        Save Recipe
      </button>

      {/* フレーバーピッカー（中央モーダル） */}
      {pickerIndex !== null && (
        <FlavorPicker
          step={pickerStep}
          brands={brands}
          flavorsByCategory={flavorsByCategory}
          selectedBrand={selectedBrand}
          onSelectBrand={handleSelectBrand}
          onSelectFlavor={handleSelectFlavor}
          onBack={() => setPickerStep('brand')}
          onClose={closePicker}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DonutChart
// ---------------------------------------------------------------------------

function DonutChart({ slices, total }) {
  const SIZE = 180
  const R = 72
  const r = 42
  const cx = SIZE / 2
  const cy = SIZE / 2

  if (slices.length === 1) {
    return (
      <div className="flex flex-col items-center gap-4">
        <svg width={SIZE} height={SIZE}>
          <circle cx={cx} cy={cy} r={R} fill={slices[0].color} />
          <circle cx={cx} cy={cy} r={r} fill="#111" />
          <text x={cx} y={cy - 6} textAnchor="middle" fill="#c9a84c" fontSize="15" fontWeight="bold">
            {total}g
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#5a5555" fontSize="9">
            TOTAL
          </text>
        </svg>
        <Legend slices={slices} total={total} />
      </div>
    )
  }

  let angle = -Math.PI / 2
  const paths = slices.map((slice) => {
    const sweep = (slice.grams / total) * 2 * Math.PI
    const end = angle + sweep
    const large = sweep > Math.PI ? 1 : 0
    const ox1 = cx + R * Math.cos(angle), oy1 = cy + R * Math.sin(angle)
    const ox2 = cx + R * Math.cos(end),   oy2 = cy + R * Math.sin(end)
    const ix1 = cx + r * Math.cos(end),   iy1 = cy + r * Math.sin(end)
    const ix2 = cx + r * Math.cos(angle), iy2 = cy + r * Math.sin(angle)
    const d = `M ${ox1} ${oy1} A ${R} ${R} 0 ${large} 1 ${ox2} ${oy2} L ${ix1} ${iy1} A ${r} ${r} 0 ${large} 0 ${ix2} ${iy2} Z`
    angle = end
    return { d, color: slice.color }
  })

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={SIZE} height={SIZE}>
        {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} />)}
        <circle cx={cx} cy={cy} r={r - 1} fill="#111" />
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#c9a84c" fontSize="15" fontWeight="bold">
          {total}g
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#5a5555" fontSize="9">
          TOTAL
        </text>
      </svg>
      <Legend slices={slices} total={total} />
    </div>
  )
}

function Legend({ slices, total }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 px-2">
      {slices.map((s, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
          <span className="text-[#9a9090] text-xs">{s.label}</span>
          <span className="text-[#5a5555] text-xs">
            {total > 0 ? Math.round((s.grams / total) * 100) : 0}%
          </span>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FlavorPicker（中央モーダル）
// ---------------------------------------------------------------------------

function FlavorPicker({ step, brands, flavorsByCategory, selectedBrand, onSelectBrand, onSelectFlavor, onBack, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center px-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm flex flex-col z-50"
        style={{
          background: '#161616',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: '16px',
          maxHeight: '75vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(201,168,76,0.1)]">
          {step === 'flavor' ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-[#c9a84c] text-sm active:opacity-70 transition-opacity"
            >
              <ChevronLeft size={16} />
              {selectedBrand?.nameJa ?? selectedBrand?.name}
            </button>
          ) : (
            <h3 className="text-[#f0ede8] text-sm font-medium tracking-wide">ブランドを選択</h3>
          )}
          <button onClick={onClose} className="text-[#5a5555] p-1">
            <X size={18} />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="overflow-y-auto flex-1 pb-4">
          {step === 'brand' ? (
            <div className="p-4 space-y-2">
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => onSelectBrand(brand.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 bg-[#0a0a0a] border border-[rgba(201,168,76,0.12)] active:border-[rgba(201,168,76,0.45)] transition-colors text-left"
                >
                  <div>
                    <p className="text-[#f0ede8] text-sm font-medium">{brand.name}</p>
                    <p className="text-[#5a5555] text-xs mt-0.5">{brand.nameJa} · {brand.origin}</p>
                  </div>
                  <ChevronRight size={15} className="text-[#5a5555]" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4">
              {Object.entries(flavorsByCategory).map(([category, flavors]) => (
                <div key={category} className="mb-5">
                  <p className="text-[#c9a84c] text-[10px] tracking-widest uppercase mb-2 px-1">
                    {category}
                  </p>
                  <div className="space-y-1">
                    {flavors.map((flavor) => (
                      <button
                        key={flavor.id}
                        onClick={() => onSelectFlavor(flavor.id)}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-[#0a0a0a] border border-[rgba(201,168,76,0.1)] active:border-[rgba(201,168,76,0.45)] transition-colors text-left"
                      >
                        <div>
                          <p className="text-[#f0ede8] text-sm">{flavor.nameJa}</p>
                          <p className="text-[#5a5555] text-[10px] mt-0.5">{flavor.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
