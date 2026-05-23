import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, X, ChevronRight, ChevronLeft, ChevronDown, Search } from 'lucide-react'
import { useRecipes, useFlavors } from '../hooks/useStorage'
import { SLICE_COLORS } from '../constants/colors'
import { CATEGORIES, getTags } from '../constants/categories'
import { useLang } from '../contexts/LangContext'

export default function RecipeCreate() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { recipes, addRecipe, updateRecipe } = useRecipes()
  const { t } = useLang()
  const rc = t.recipeCreate
  const { brands, flavors: allFlavors, getFlavor, addBrand, addFlavor } = useFlavors()

  const isEdit = !!id
  const existing = isEdit ? (recipes.find((r) => r.id === id) ?? null) : null

  const [name, setName] = useState(existing?.name ?? '')
  const [flavorItems, setFlavorItems] = useState(
    existing?.flavors?.length ? existing.flavors : [{ brandId: '', flavorId: '', grams: 5 }]
  )
  const [tastingNote, setTastingNote] = useState(existing?.tastingNote ?? existing?.memo ?? '')

  const [pickerIndex, setPickerIndex] = useState(null)

  const openPicker = (index) => setPickerIndex(index)
  const closePicker = () => setPickerIndex(null)

  const handleSelectFlavor = (flavorId, brandId) => {
    const isDuplicate = flavorItems.some(
      (f, i) => i !== pickerIndex && f.flavorId === flavorId
    )
    if (isDuplicate) {
      alert(rc.alertDuplicate)
      return
    }
    setFlavorItems((prev) =>
      prev.map((f, i) =>
        i === pickerIndex ? { ...f, brandId, flavorId } : f
      )
    )
    closePicker()
  }

  const usedFlavorIds = new Set(
    flavorItems
      .filter((_, i) => i !== pickerIndex)
      .map((f) => f.flavorId)
      .filter(Boolean)
  )

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
    if (!name.trim()) return alert(rc.alertName)
    if (flavorItems.some((f) => !f.flavorId)) return alert(rc.alertFlavors)
    if (isEdit) {
      updateRecipe(id, {
        name: name.trim(),
        flavors: flavorItems,
        tastingNote: tastingNote.trim(),
      })
    } else {
      addRecipe({
        name: name.trim(),
        flavors: flavorItems,
        tastingNote: tastingNote.trim(),
        tags: [],
        rating: 0,
        settingId: null,
      })
    }
    navigate('/recipes')
  }

  const getLabel = (item) => {
    if (!item.flavorId) return null
    const flavor = getFlavor(item.flavorId)
    const brand = brands.find((b) => b.id === item.brandId)
    return flavor ? { name: flavor.name, brandName: brand?.name ?? '' } : null
  }

  const chartSlices = useMemo(() =>
    flavorItems
      .filter((item) => item.flavorId && item.grams > 0)
      .map((item, i) => ({
        grams: item.grams,
        label: getFlavor(item.flavorId)?.name ?? '',
        color: SLICE_COLORS[i % SLICE_COLORS.length],
      })),
    [flavorItems, allFlavors]
  )

  return (
    <div className="px-5 pt-14 pb-8">

      {/* ヘッダー */}
      <div className="mb-8">
        <p className="tracking-[0.3em] text-[10px] uppercase mb-1" style={{ color: 'var(--c-accent)' }}>
          {isEdit ? rc.editLabel : rc.newLabel}
        </p>
        <h2
          className="text-2xl"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}
        >
          {isEdit ? rc.editTitle : rc.createTitle}
        </h2>
      </div>

      {/* レシピ名 */}
      <div className="mb-6">
        <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--c-muted)' }}>
          {rc.recipeName}
        </label>
        <input
          type="text"
          placeholder={rc.recipeNamePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 text-sm outline-none transition-colors"
          style={{
            background: 'var(--c-surf)',
            border: '1px solid var(--ca-15)',
            color: 'var(--c-text)',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--ca-40)' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--ca-15)' }}
        />
      </div>

      {/* フレーバーセクション */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs tracking-widest uppercase" style={{ color: 'var(--c-muted)' }}>{rc.flavors}</label>
          {totalGrams > 0 && (
            <span className="text-xs font-mono" style={{ color: 'var(--c-accent)' }}>{rc.total} {totalGrams}g</span>
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
                  className="flex-1 flex items-center gap-3 px-3 py-2.5 text-left transition-colors min-w-0"
                  style={{
                    background: 'var(--c-surf)',
                    border: '1px solid var(--ca-15)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--ca-40)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--ca-15)' }}
                >
                  {label ? (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: 'var(--c-text)' }}>{label.name}</p>
                      <p className="text-[10px]" style={{ color: 'var(--c-muted)' }}>{label.brandName}</p>
                    </div>
                  ) : (
                    <span className="text-sm flex-1" style={{ color: 'var(--c-dim)' }}>{rc.selectFlavor}</span>
                  )}
                  <ChevronRight size={13} className="shrink-0" style={{ color: 'var(--c-muted)' }} />
                </button>

                {/* グラム数入力 */}
                <div className="flex items-center gap-1 shrink-0">
                  <GramsInput
                    value={item.grams}
                    onChange={(val) => updateGrams(i, val)}
                  />
                  <span className="text-xs" style={{ color: 'var(--c-muted)' }}>g</span>
                </div>

                {/* 削除 */}
                {flavorItems.length > 1 && (
                  <button onClick={() => removeFlavorItem(i)} className="p-1 shrink-0" style={{ color: 'var(--c-dim)' }}>
                    <X size={16} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={addFlavorItem}
          className="mt-3 w-full py-3 border-dashed border text-xs tracking-widest uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          style={{
            borderColor: 'var(--ca-20)',
            color: 'var(--c-muted)',
          }}
        >
          <Plus size={14} />
          {rc.addFlavor}
        </button>
      </div>

      {/* テイスティングノート */}
      <div className="mb-6">
        <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--c-muted)' }}>
          {rc.tastingNote}
        </label>
        <textarea
          rows={3}
          placeholder={rc.tastingNotePlaceholder}
          value={tastingNote}
          onChange={(e) => setTastingNote(e.target.value)}
          className="w-full px-4 py-3 text-sm outline-none transition-colors resize-none"
          style={{
            background: 'var(--c-surf)',
            border: '1px solid var(--ca-15)',
            color: 'var(--c-text)',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--ca-40)' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--ca-15)' }}
        />
      </div>

      {/* 円グラフ */}
      {chartSlices.length > 0 && (
        <div className="mb-8">
          <DonutChart slices={chartSlices} total={totalGrams} />
        </div>
      )}

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        className="w-full py-4 font-semibold text-sm tracking-widest uppercase active:scale-[0.98] transition-all duration-200"
        style={{
          background: 'var(--ca-grad)',
          color: 'var(--c-btn-fg)',
          boxShadow: '0 0 24px var(--ca-25)',
        }}
      >
        {isEdit ? rc.update : rc.save}
      </button>

      {/* フレーバーピッカー */}
      {pickerIndex !== null && (
        <FlavorPicker
          brands={brands}
          allFlavors={allFlavors}
          usedFlavorIds={usedFlavorIds}
          onSelect={handleSelectFlavor}
          onClose={closePicker}
          addBrand={addBrand}
          addFlavor={addFlavor}
          rc={rc}
          fm={t.flavorManage}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// GramsInput
// ---------------------------------------------------------------------------

function GramsInput({ value, onChange }) {
  const [display, setDisplay] = useState(String(value))

  const handleChange = (e) => {
    setDisplay(e.target.value)
    const n = parseFloat(e.target.value)
    if (!isNaN(n) && n >= 0.1) onChange(n)
  }

  const handleBlur = () => {
    const n = parseFloat(display)
    const valid = !isNaN(n) && n >= 0.1 ? n : 0.1
    setDisplay(String(valid))
    onChange(valid)
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={(e) => { e.target.select(); e.target.style.borderColor = 'var(--ca-40)' }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--ca-15)' }}
      className="w-12 px-1 py-2.5 text-sm text-center outline-none transition-colors"
      style={{
        background: 'var(--c-surf)',
        border: '1px solid var(--ca-15)',
        color: 'var(--c-text)',
      }}
    />
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

  let innerPaths = null
  if (slices.length === 1) {
    innerPaths = <circle cx={cx} cy={cy} r={R} fill={slices[0].color} />
  } else {
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
    innerPaths = paths.map((p, i) => <path key={i} d={p.d} fill={p.color} />)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={SIZE} height={SIZE}>
        {innerPaths}
        <circle cx={cx} cy={cy} r={slices.length === 1 ? r : r - 1} style={{ fill: 'var(--c-surf)' }} />
        <text x={cx} y={cy - 6} textAnchor="middle" style={{ fill: 'var(--c-accent)' }} fontSize="15" fontWeight="bold">
          {total}g
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" style={{ fill: 'var(--c-muted)' }} fontSize="9">
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
          <span className="text-xs" style={{ color: 'var(--c-sub)' }}>{s.label}</span>
          <span className="text-xs" style={{ color: 'var(--c-muted)' }}>
            {total > 0 ? Math.round((s.grams / total) * 100) : 0}%
          </span>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FlavorPicker — 検索・カテゴリフィルター・新規登録一体型
// ---------------------------------------------------------------------------

function FlavorPicker({ brands, allFlavors, usedFlavorIds, onSelect, onClose, addBrand, addFlavor, rc, fm }) {
  const [mode, setMode] = useState('search')
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [newFlavorName, setNewFlavorName] = useState('')
  const [newBrandMode, setNewBrandMode] = useState('select')
  const [newBrandId, setNewBrandId] = useState(brands[0]?.id ?? '')
  const [newBrandNameVal, setNewBrandNameVal] = useState('')
  const [newBrandOrigin, setNewBrandOrigin] = useState('')
  const [newCategories, setNewCategories] = useState([])

  const availableCategories = useMemo(() =>
    CATEGORIES.filter((c) => allFlavors.some((f) => getTags(f).includes(c))),
    [allFlavors]
  )

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return allFlavors
      .filter((f) => {
        const brand = brands.find((b) => b.id === f.brandId)
        const matchQ = !q ||
          f.name.toLowerCase().includes(q) ||
          brand?.name.toLowerCase().includes(q)
        const matchCat = !activeCategory || getTags(f).includes(activeCategory)
        return matchQ && matchCat
      })
      .slice(0, 60)
  }, [allFlavors, brands, query, activeCategory])

  const openRegister = () => {
    setNewFlavorName(query)
    setNewBrandMode('select')
    setNewBrandId(brands[0]?.id ?? '')
    setNewBrandNameVal('')
    setNewBrandOrigin('')
    setNewCategories([])
    setMode('register')
  }

  const toggleNewCategory = (cat) =>
    setNewCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )

  const handleRegister = () => {
    if (!newFlavorName.trim()) return alert(rc.pickerAlertFlavorName)
    let brandId = ''
    if (newBrandMode === 'select') {
      brandId = newBrandId
    } else if (newBrandMode === 'new') {
      if (!newBrandNameVal.trim()) return alert(rc.pickerAlertBrand)
      const nb = addBrand({
        name: newBrandNameVal.trim(),
        nameJa: newBrandNameVal.trim(),
        origin: newBrandOrigin.trim(),
      })
      brandId = nb.id
    }
    const flavor = addFlavor({
      brandId,
      name: newFlavorName.trim(),
      nameJa: newFlavorName.trim(),
      categories: newCategories,
    })
    onSelect(flavor.id, brandId)
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center px-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm flex flex-col z-50"
        style={{
          background: 'var(--c-surf-2)',
          border: '1px solid var(--ca-20)',
          borderRadius: 16,
          maxHeight: '80vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div
          className="flex items-center justify-between px-5 py-3.5 shrink-0"
          style={{ borderBottom: '1px solid var(--ca-10)' }}
        >
          {mode === 'register' ? (
            <button
              onClick={() => setMode('search')}
              className="flex items-center gap-1 text-sm active:opacity-70 transition-opacity"
              style={{ color: 'var(--c-accent)' }}
            >
              <ChevronLeft size={16} />
              {rc.pickerBack}
            </button>
          ) : (
            <h3 className="text-sm font-medium tracking-wide" style={{ color: 'var(--c-text)' }}>{rc.pickerTitle}</h3>
          )}
          <button onClick={onClose} className="p-1 active:opacity-70" style={{ color: 'var(--c-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {mode === 'search' ? (
          <>
            {/* 検索欄 */}
            <div className="px-4 pt-3.5 pb-2 shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--c-muted)' }} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={rc.pickerSearchPlaceholder}
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 text-sm outline-none transition-colors"
                  style={{
                    background: 'var(--c-surf-3)',
                    border: '1px solid var(--ca-15)',
                    color: 'var(--c-text)',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--ca-40)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--ca-15)' }}
                />
              </div>
            </div>

            {/* カテゴリフィルター（横スクロール） */}
            <div className="px-4 pb-2.5 shrink-0 overflow-x-auto scrollbar-none">
              <div className="flex gap-1.5 w-max">
                <button
                  onClick={() => setActiveCategory('')}
                  className="px-2.5 py-1 text-[10px] tracking-wide border transition-colors shrink-0"
                  style={{
                    background: !activeCategory ? 'var(--ca-15)' : 'transparent',
                    borderColor: !activeCategory ? 'var(--c-accent)' : 'var(--ca-20)',
                    color: !activeCategory ? 'var(--c-accent)' : 'var(--c-muted)',
                  }}
                >
                  {rc.pickerAllCategories}
                </button>
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
                    className="px-2.5 py-1 text-[10px] tracking-wide border transition-colors shrink-0"
                    style={{
                      background: activeCategory === cat ? 'var(--ca-15)' : 'transparent',
                      borderColor: activeCategory === cat ? 'var(--c-accent)' : 'var(--ca-20)',
                      color: activeCategory === cat ? 'var(--c-accent)' : 'var(--c-muted)',
                    }}
                  >
                    {fm.categories[cat] ?? cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 候補リスト */}
            <div className="overflow-y-auto flex-1 px-4 pb-4">
              {filtered.length > 0 ? (
                <div className="space-y-1">
                  {filtered.map((flavor) => {
                    const brand = brands.find((b) => b.id === flavor.brandId)
                    const used = usedFlavorIds.has(flavor.id)
                    return (
                      <button
                        key={flavor.id}
                        onClick={() => !used && onSelect(flavor.id, flavor.brandId)}
                        disabled={used}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                        style={{
                          background: 'var(--c-surf-3)',
                          border: `1px solid ${used ? 'var(--ca-05)' : 'var(--ca-10)'}`,
                          opacity: used ? 0.35 : 1,
                          cursor: used ? 'not-allowed' : 'pointer',
                        }}
                        onMouseEnter={(e) => { if (!used) e.currentTarget.style.borderColor = 'var(--ca-45)' }}
                        onMouseLeave={(e) => { if (!used) e.currentTarget.style.borderColor = 'var(--ca-10)' }}
                        onTouchStart={(e) => { if (!used) e.currentTarget.style.borderColor = 'var(--ca-45)' }}
                        onTouchEnd={(e) => { if (!used) e.currentTarget.style.borderColor = 'var(--ca-10)' }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate" style={{ color: 'var(--c-text)' }}>{flavor.name}</p>
                          <p className="text-[10px]" style={{ color: 'var(--c-muted)' }}>{brand?.name ?? ''}</p>
                        </div>
                        {used && (
                          <span className="text-[10px] shrink-0" style={{ color: 'var(--c-dim)' }}>追加済み</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className="text-center text-xs py-6" style={{ color: 'var(--c-dim)' }}>{rc.pickerNoResults}</p>
              )}

              {/* 新規登録ボタン */}
              <button
                onClick={openRegister}
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 border-dashed border text-xs tracking-wide active:opacity-60 transition-opacity"
                style={{
                  borderColor: 'var(--ca-25)',
                  color: 'var(--c-accent)',
                }}
              >
                <Plus size={12} strokeWidth={2.5} />
                {query.trim() ? rc.pickerRegisterNew(query.trim()) : rc.pickerRegisterNewSimple}
              </button>
            </div>
          </>
        ) : (
          /* 新規登録フォーム */
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

            {/* フレーバー名 */}
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: 'var(--c-muted)' }}>
                {rc.pickerFlavorName}
              </p>
              <input
                type="text"
                value={newFlavorName}
                onChange={(e) => setNewFlavorName(e.target.value)}
                placeholder="e.g. Blueberry"
                autoFocus
                className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                style={{
                  background: 'var(--c-surf-3)',
                  border: '1px solid var(--ca-15)',
                  color: 'var(--c-text)',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--ca-40)' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--ca-15)' }}
              />
            </div>

            {/* ブランド（任意） */}
            <div>
              <div className="flex items-baseline gap-2 mb-1.5">
                <p className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--c-muted)' }}>{rc.pickerBrand}</p>
                <p className="text-[9px]" style={{ color: 'var(--c-dim)' }}>{rc.pickerBrandHint}</p>
              </div>
              <div className="flex gap-1.5 mb-2">
                {[
                  { v: 'select', label: rc.pickerBrandSelect },
                  { v: 'new', label: rc.pickerBrandNew },
                  { v: 'none', label: rc.pickerBrandOptional },
                ].map(({ v, label }) => (
                  <button
                    key={v}
                    onClick={() => setNewBrandMode(v)}
                    className="flex-1 py-1.5 text-[10px] border transition-colors"
                    style={
                      newBrandMode === v
                        ? { borderColor: 'var(--c-accent)', color: 'var(--c-accent)', background: 'var(--ca-08)' }
                        : { borderColor: 'var(--ca-15)', color: 'var(--c-muted)', background: 'transparent' }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
              {newBrandMode === 'select' && (
                <div className="relative">
                  <select
                    value={newBrandId}
                    onChange={(e) => setNewBrandId(e.target.value)}
                    className="w-full appearance-none px-3 pr-8 py-2.5 text-sm outline-none transition-colors"
                    style={{
                      background: 'var(--c-surf-3)',
                      border: '1px solid var(--ca-15)',
                      color: 'var(--c-text)',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--ca-40)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--ca-15)' }}
                  >
                    {[...brands].sort((a, b) => a.name.localeCompare(b.name, 'en')).map((b) => (
                      <option key={b.id} value={b.id} style={{ background: 'var(--c-surf)', color: 'var(--c-text)' }}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--c-muted)' }} />
                </div>
              )}
              {newBrandMode === 'new' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newBrandNameVal}
                    onChange={(e) => setNewBrandNameVal(e.target.value)}
                    placeholder={rc.pickerBrandNamePlaceholder}
                    className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{
                      background: 'var(--c-surf-3)',
                      border: '1px solid var(--ca-15)',
                      color: 'var(--c-text)',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--ca-40)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--ca-15)' }}
                  />
                  <input
                    type="text"
                    value={newBrandOrigin}
                    onChange={(e) => setNewBrandOrigin(e.target.value)}
                    placeholder={rc.pickerOriginPlaceholder}
                    className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{
                      background: 'var(--c-surf-3)',
                      border: '1px solid var(--ca-15)',
                      color: 'var(--c-text)',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--ca-40)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--ca-15)' }}
                  />
                </div>
              )}
            </div>

            {/* カテゴリ（複数選択タグ・任意） */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--c-muted)' }}>{rc.pickerCategory}</p>
                <p className="text-[9px]" style={{ color: 'var(--c-dim)' }}>{rc.pickerCategoryHint}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => {
                  const active = newCategories.includes(cat)
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleNewCategory(cat)}
                      className="px-2.5 py-1 text-[10px] tracking-wide border transition-colors"
                      style={{
                        background: active ? 'var(--ca-15)' : 'transparent',
                        borderColor: active ? 'var(--c-accent)' : 'var(--ca-20)',
                        color: active ? 'var(--c-accent)' : 'var(--c-muted)',
                      }}
                    >
                      {fm.categories[cat] ?? cat}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setMode('search')}
                className="flex-1 py-2.5 text-sm active:opacity-70 transition-opacity"
                style={{
                  border: '1px solid var(--ca-20)',
                  color: 'var(--c-muted)',
                }}
              >
                {rc.pickerCancel}
              </button>
              <button
                onClick={handleRegister}
                className="flex-1 py-2.5 text-sm font-semibold active:opacity-80 transition-opacity"
                style={{ background: 'var(--ca-grad)', color: 'var(--c-btn-fg)' }}
              >
                {rc.pickerAddAndSelect}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
