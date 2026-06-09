import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, ChevronDown, ChevronRight, Search } from 'lucide-react'
import { useFlavors, useTags } from '../hooks/useStorage'
import { getTags } from '../constants/categories'
import { useLang } from '../contexts/LangContext'
import { useToast, Toast } from '../components/common/Toast'

export default function FlavorManage() {
  const navigate = useNavigate()
  const { brands, flavors, addBrand, addFlavor, deleteBrand, deleteFlavor, toggleStock } = useFlavors()
  const { tags: globalTags } = useTags()
  const { t } = useLang()
  const fm = t.flavorManage

  const { message: toastMsg, showToast } = useToast()

  const [activeBrandId, setActiveBrandId] = useState(brands[0]?.id ?? '')
  const [showModal, setShowModal] = useState(false)
  const [flavorSearch, setFlavorSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const sortedBrands = [...brands].sort((a, b) => a.name.localeCompare(b.name, 'en'))
  const activeBrand  = brands.find((b) => b.id === activeBrandId)

  const activeFlavors = flavors
    .filter((f) => {
      if (f.brandId !== activeBrandId) return false
      if (flavorSearch.trim()) return f.name.toLowerCase().includes(flavorSearch.toLowerCase())
      return true
    })
    .sort((a, b) => {
      const aStock = a.inStock !== false ? 0 : 1
      const bStock = b.inStock !== false ? 0 : 1
      if (aStock !== bStock) return aStock - bStock
      return a.name.localeCompare(b.name, 'en')
    })

  const inStockFlavors = activeFlavors.filter((f) => f.inStock !== false)
  const outOfStockFlavors = activeFlavors.filter((f) => f.inStock === false)

  const totalFlavorsForBrand = flavors.filter((f) => f.brandId === activeBrandId).length

  const handleDeleteFlavor = (e, flavor) => {
    e.stopPropagation()
    setDeleteTarget({ id: flavor.id, name: flavor.name, brandId: flavor.brandId })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteFlavor(deleteTarget.id)
    const remaining = flavors.filter((f) => f.brandId === deleteTarget.brandId && f.id !== deleteTarget.id)
    if (remaining.length === 0) {
      const nextBrand = brands.find((b) => b.id !== deleteTarget.brandId)
      deleteBrand(deleteTarget.brandId)
      setActiveBrandId(nextBrand?.id ?? '')
    }
    setDeleteTarget(null)
  }

  return (
    <div className="px-5 pt-14 pb-10">

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="tracking-[0.3em] text-[10px] uppercase mb-1" style={{ color: 'var(--c-accent)' }}>{fm.library}</p>
          <h2
            className="text-2xl"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}
          >
            {fm.title}
          </h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-widest uppercase active:opacity-80"
          style={{ background: 'var(--ca-grad)', color: 'var(--c-btn-fg)' }}
        >
          <Plus size={13} strokeWidth={2.5} />
          {fm.addBtn}
        </button>
      </div>

      {brands.length === 0 ? (
        <p className="text-center text-sm py-16" style={{ color: 'var(--c-dim)' }}>{fm.empty}</p>
      ) : (
        <>
          {/* ブランドドロップダウン */}
          <div className="relative mb-4">
            <select
              value={activeBrandId}
              onChange={(e) => { setActiveBrandId(e.target.value); setFlavorSearch('') }}
              className="w-full appearance-none px-4 pr-9 py-3 text-sm outline-none transition-colors"
              style={{
                background: 'var(--c-surf)',
                border: '1px solid var(--ca-15)',
                color: 'var(--c-text)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--ca-40)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--ca-15)' }}
            >
              {sortedBrands.map((brand) => (
                <option key={brand.id} value={brand.id} style={{ background: 'var(--c-surf)', color: 'var(--c-text)' }}>
                  {brand.name}（{brand.origin}）
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--c-muted)' }} />
          </div>

          {activeBrand && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs" style={{ color: 'var(--c-muted)' }}>
                  {activeBrand.name} · {activeBrand.origin} · {totalFlavorsForBrand}
                </span>
              </div>

              {/* フレーバー検索 */}
              <div className="relative mb-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--c-muted)' }} />
                <input
                  type="text"
                  placeholder={fm.flavorSearch}
                  value={flavorSearch}
                  onChange={(e) => setFlavorSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs outline-none transition-colors"
                  style={{
                    background: 'var(--c-surf)',
                    border: '1px solid var(--ca-15)',
                    color: 'var(--c-text)',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--ca-40)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--ca-15)' }}
                />
                {flavorSearch && (
                  <button
                    onClick={() => setFlavorSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--c-dim)' }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div
                className="h-px mb-4"
                style={{ background: 'linear-gradient(90deg, var(--ca-40), transparent)' }}
              />

              {activeFlavors.length === 0 ? (
                <p className="text-xs text-center py-8" style={{ color: 'var(--c-dim)' }}>
                  {flavorSearch ? `"${flavorSearch}" — 0` : fm.flavorEmpty}
                </p>
              ) : (
                <div className="space-y-1">
                  {[...inStockFlavors, ...outOfStockFlavors].map((flavor, index) => {
                    const flavorTags = getTags(flavor)
                    const isOutOfStock = flavor.inStock === false
                    const showDivider = inStockFlavors.length > 0 && outOfStockFlavors.length > 0 && index === inStockFlavors.length
                    return (
                      <div key={flavor.id}>
                        {showDivider && (
                          <div className="flex items-center gap-2 my-3">
                            <div className="flex-1 h-px" style={{ background: 'var(--ca-15)' }} />
                            <span className="text-[9px] tracking-widest uppercase shrink-0" style={{ color: 'var(--c-dim)' }}>
                              {fm.stockOff}
                            </span>
                            <div className="flex-1 h-px" style={{ background: 'var(--ca-15)' }} />
                          </div>
                        )}
                        <div
                          onClick={() => navigate(`/flavors/${flavor.id}/edit`)}
                          className="flex items-center gap-2 px-3 py-2.5 transition-colors cursor-pointer"
                          style={{
                            background: 'var(--c-surf)',
                            border: '1px solid var(--ca-08)',
                            borderRadius: 'var(--radius)',
                            opacity: isOutOfStock ? 0.5 : 1,
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ca-30)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ca-08)' }}
                          onTouchStart={(e) => { e.currentTarget.style.borderColor = 'var(--ca-30)' }}
                          onTouchEnd={(e) => { e.currentTarget.style.borderColor = 'var(--ca-08)' }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs" style={{ color: 'var(--c-text)' }}>{flavor.name}</p>
                            {flavorTags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {flavorTags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-1.5 py-0.5 text-[9px] border"
                                    style={{
                                      border: '1px solid var(--ca-20)',
                                      color: 'var(--c-muted)',
                                      borderRadius: 'var(--radius)',
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* 在庫トグル（テキストラベル付き） */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleStock(flavor.id) }}
                            className="shrink-0 px-2 py-0.5 text-[9px] font-medium transition-colors"
                            style={{
                              background: isOutOfStock ? 'transparent' : 'var(--ca-10)',
                              border: `1px solid ${isOutOfStock ? 'var(--ca-20)' : 'var(--c-accent)'}`,
                              color: isOutOfStock ? 'var(--c-dim)' : 'var(--c-accent)',
                              borderRadius: 'var(--radius)',
                            }}
                          >
                            {isOutOfStock ? fm.stockOff : fm.stockOn}
                          </button>
                          <ChevronRight size={13} className="shrink-0" style={{ color: 'var(--c-dim)' }} />
                          <button
                            onClick={(e) => handleDeleteFlavor(e, flavor)}
                            className="shrink-0 p-1 transition-colors active:text-red-500"
                            style={{ color: 'var(--c-dim)' }}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {showModal && (
        <AddModal
          brands={brands}
          flavors={flavors}
          globalTags={globalTags}
          onAddBrand={addBrand}
          onAddFlavor={addFlavor}
          onClose={() => setShowModal(false)}
          onError={showToast}
          fm={fm}
        />
      )}

      <Toast message={toastMsg} />

      {/* 削除確認モーダル */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          onClick={() => setDeleteTarget(null)}
        >
          <div className="absolute inset-0 bg-black/70" />
          <div
            className="relative w-full max-w-[320px] p-5"
            style={{
              background: 'var(--c-surf)',
              border: '1px solid var(--ca-20)',
              borderRadius: 'var(--radius)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--c-text)' }}>
              {fm.deleteTitle}
            </h3>
            <p className="text-xs mb-5 leading-relaxed" style={{ color: 'var(--c-muted)' }}>
              {fm.deleteConfirm(deleteTarget.name)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 text-sm active:opacity-70"
                style={{ border: '1px solid var(--ca-20)', color: 'var(--c-muted)' }}
              >
                {fm.deleteCancelBtn}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 text-sm font-semibold active:opacity-80"
                style={{ background: 'var(--c-danger-bg)', color: 'var(--c-danger-fg)' }}
              >
                {fm.deleteOkBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 追加モーダル ─────────────────────────────────────────────

function AddModal({ brands, flavors, globalTags, onAddBrand, onAddFlavor, onClose, onError, fm }) {
  const m = fm.modal

  const [brandMode, setBrandMode]             = useState('select')
  const [selectedBrandId, setSelectedBrandId] = useState(brands[0]?.id ?? '')
  const [newBrandName,   setNewBrandName]     = useState('')
  const [newBrandOrigin, setNewBrandOrigin]   = useState('')

  const [flavorMode, setFlavorMode]             = useState('new')
  const [flavorName, setFlavorName]             = useState('')
  const [selectedTags, setSelectedTags]         = useState([])
  const [selectedTagFilter, setSelectedTagFilter] = useState('')
  const [selectedFlavorId, setSelectedFlavorId] = useState('')

  const uniqueFlavorsByTag = useMemo(() => {
    const seen = new Set()
    const byTag = {}
    const sorted = [...flavors].sort((a, b) => a.name.localeCompare(b.name, 'en'))
    for (const f of sorted) {
      if (seen.has(f.name)) continue
      seen.add(f.name)
      const tags = getTags(f)
      if (tags.length === 0) {
        ;(byTag[''] ??= []).push(f)
      } else {
        tags.forEach((tag) => { ;(byTag[tag] ??= []).push(f) })
      }
    }
    return byTag
  }, [flavors])

  const toggleTag = (tag) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )

  const handleSave = () => {
    let brandId = selectedBrandId
    if (brandMode === 'new') {
      if (!newBrandName.trim()) { onError(m.alertBrand); return }
      const nb = onAddBrand({
        name: newBrandName.trim(),
        nameJa: newBrandName.trim(),
        origin: newBrandOrigin.trim(),
      })
      brandId = nb.id
    } else {
      if (!brandId) { onError(m.alertBrandSelect); return }
    }

    if (flavorMode === 'select') {
      const existing = flavors.find((f) => f.id === selectedFlavorId)
      if (!existing) { onError(m.alertFlavor); return }
      onAddFlavor({ brandId, name: existing.name, nameJa: existing.name, tags: getTags(existing) })
    } else {
      if (!flavorName.trim()) { onError(m.alertFlavorName); return }
      onAddFlavor({ brandId, name: flavorName.trim(), nameJa: flavorName.trim(), tags: selectedTags })
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl"
        style={{
          background: 'var(--c-surf-2)',
          border: '1px solid var(--ca-20)',
          maxHeight: '88vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--ca-10)' }}
        >
          <h3 className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{m.title}</h3>
          <button onClick={onClose} className="p-1" style={{ color: 'var(--c-muted)' }}><X size={18} /></button>
        </div>

        <div className="px-5 py-5 space-y-6">

          {/* ── ブランド ── */}
          <section>
            <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: 'var(--c-accent)' }}>{m.brand}</p>
            <ModeToggle
              value={brandMode}
              onChange={setBrandMode}
              options={[{ value: 'select', label: m.selectExisting }, { value: 'new', label: m.newRegister }]}
            />
            <div className="mt-3">
              {brandMode === 'select' ? (
                <SelectField
                  value={selectedBrandId}
                  onChange={setSelectedBrandId}
                  placeholder={m.brand}
                  options={[...brands]
                    .sort((a, b) => a.name.localeCompare(b.name, 'en'))
                    .map((b) => ({ value: b.id, label: `${b.name} (${b.origin})` }))}
                />
              ) : (
                <div className="space-y-2">
                  <ModalInput label={m.brandName} value={newBrandName} onChange={setNewBrandName} placeholder={m.brandNamePlaceholder} />
                  <ModalInput label={m.origin} value={newBrandOrigin} onChange={setNewBrandOrigin} placeholder={m.originPlaceholder} />
                </div>
              )}
            </div>
          </section>

          {/* ── フレーバー ── */}
          <section>
            <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: 'var(--c-accent)' }}>{m.flavor}</p>
            <ModeToggle
              value={flavorMode}
              onChange={(v) => { setFlavorMode(v); setSelectedTagFilter(''); setSelectedFlavorId('') }}
              options={[{ value: 'new', label: m.newRegister }, { value: 'select', label: m.selectExisting }]}
            />
            <div className="mt-3">
              {flavorMode === 'new' ? (
                <div className="space-y-3">
                  <ModalInput label={m.flavorName} value={flavorName} onChange={setFlavorName} placeholder={m.flavorNamePlaceholder} />
                  <div>
                    <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: 'var(--c-muted)' }}>{m.tags ?? 'タグ（任意）'}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {globalTags.map((tag) => {
                        const active = selectedTags.includes(tag)
                        return (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className="px-2.5 py-1 text-[10px] border transition-colors"
                            style={{
                              background: active ? 'var(--ca-15)' : 'transparent',
                              borderColor: active ? 'var(--c-accent)' : 'var(--ca-20)',
                              color: active ? 'var(--c-accent)' : 'var(--c-muted)',
                            }}
                          >
                            {tag}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <SelectField
                    value={selectedTagFilter}
                    onChange={(v) => { setSelectedTagFilter(v); setSelectedFlavorId('') }}
                    placeholder={m.selectCategory}
                    options={globalTags
                      .filter((tag) => uniqueFlavorsByTag[tag])
                      .map((tag) => ({ value: tag, label: tag }))}
                  />
                  {selectedTagFilter && (
                    <SelectField
                      value={selectedFlavorId}
                      onChange={setSelectedFlavorId}
                      placeholder={m.selectFlavor}
                      options={(uniqueFlavorsByTag[selectedTagFilter] ?? [])
                        .map((f) => ({ value: f.id, label: f.name }))}
                    />
                  )}
                </div>
              )}
            </div>
          </section>

          {/* アクションボタン */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm active:opacity-70"
              style={{
                border: '1px solid var(--ca-20)',
                color: 'var(--c-muted)',
              }}
            >
              {m.cancel}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 text-sm font-semibold active:opacity-80"
              style={{ background: 'var(--ca-grad)', color: 'var(--c-btn-fg)' }}
            >
              {m.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 共通UIパーツ ─────────────────────────────────────────────

function ModeToggle({ value, onChange, options }) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="flex-1 py-1.5 text-xs border transition-colors"
          style={
            value === opt.value
              ? { borderColor: 'var(--c-accent)', color: 'var(--c-accent)', background: 'var(--ca-08)' }
              : { borderColor: 'var(--ca-15)', color: 'var(--c-muted)', background: 'transparent' }
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function ModalInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: 'var(--c-muted)' }}>{label}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
  )
}

function SelectField({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-3 pr-8 py-2.5 text-sm outline-none transition-colors"
        style={{
          background: 'var(--c-surf-3)',
          border: '1px solid var(--ca-15)',
          color: value ? 'var(--c-text)' : 'var(--c-muted)',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--ca-40)' }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--ca-15)' }}
      >
        {placeholder && (
          <option value="" style={{ background: 'var(--c-surf)', color: 'var(--c-muted)' }}>{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: 'var(--c-surf)', color: 'var(--c-text)' }}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--c-muted)' }} />
    </div>
  )
}
