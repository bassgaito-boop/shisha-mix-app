import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Trash2, PlusCircle, Pencil, X, ChevronDown, Check, Download, Upload, Copy, CopyPlus, Send, QrCode, Camera, FileText } from 'lucide-react'
import { useRecipes, useFlavors } from '../hooks/useStorage'
import { encodeRecipe, decodeRecipe } from '../utils/shareCode'
import { SLICE_COLORS } from '../constants/colors'
import { useLang } from '../contexts/LangContext'

export default function RecipeList() {
  const { recipes, deleteRecipe, addRecipe, bulkAddRecipes, duplicateRecipe } = useRecipes()
  const { getFlavor, brands, flavors: allFlavors, addBrand, addFlavor } = useFlavors()
  const navigate = useNavigate()
  const { t } = useLang()
  const rl = t.recipeList

  const importTabs = useMemo(
    () => [
      { id: 'code', icon: Copy,     label: rl.codeTab },
      { id: 'qr',   icon: Camera,   label: rl.qrTab   },
      { id: 'json', icon: FileText, label: rl.jsonTab  },
    ],
    [rl]
  )

  // ── バックアップリマインダー ───────────────────────────────
  const userRecipeCount = useMemo(
    () => recipes.filter((r) => !r.id.startsWith('sample-')).length,
    [recipes]
  )
  const [backupDismissed, setBackupDismissed] = useState(
    () => !!localStorage.getItem('backup_reminded')
  )
  const showBackupReminder = userRecipeCount >= 5 && !backupDismissed
  const dismissBackup = () => {
    localStorage.setItem('backup_reminded', '1')
    setBackupDismissed(true)
  }

  // ── インポートモーダル ──────────────────────────────────────
  const [importOpen, setImportOpen] = useState(false)
  const [importTab, setImportTab] = useState('code')
  const [importCode, setImportCode] = useState('')
  const [importPreview, setImportPreview] = useState(null)
  const [importError, setImportError] = useState('')
  const [importDone, setImportDone] = useState(false)
  const [jsonPreview, setJsonPreview] = useState(null)
  const [jsonDone, setJsonDone] = useState(false)
  const jsonFileRef = useRef(null)

  const handlePreview = (code) => {
    const target = code ?? importCode
    setImportError('')
    setImportPreview(null)
    try {
      const data = decodeRecipe(target)
      setImportPreview(data)
    } catch (e) {
      setImportError(e.message)
    }
  }

  const handleImport = () => {
    if (!importPreview) return
    const resolvedFlavors = importPreview.f.map((item) => {
      let brand = brands.find((b) => b.name === item.b)
      if (!brand) brand = addBrand({ name: item.b })
      let flavor = allFlavors.find((f) => f.name === item.fl && f.brandId === brand.id)
      if (!flavor) flavor = addFlavor({ name: item.fl, brandId: brand.id })
      return { brandId: brand.id, flavorId: flavor.id, grams: item.g }
    })
    addRecipe({ name: importPreview.n, flavors: resolvedFlavors, tastingNote: importPreview.t })
    setImportDone(true)
    setTimeout(() => {
      setImportOpen(false)
      setImportCode('')
      setImportPreview(null)
      setImportDone(false)
    }, 1200)
  }

  // ── エクスポート ──────────────────────────────────────────
  const handleExport = () => {
    const data = {
      meta: { version: '1.0', exportedAt: new Date().toISOString(), totalRecipes: recipes.length },
      recipes,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `shisha-mix-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  // ── JSONファイルインポート ─────────────────────────────────
  const handleJsonFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError('')
    setJsonPreview(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        const list = Array.isArray(parsed) ? parsed : parsed.recipes
        if (!Array.isArray(list)) throw new Error('レシピデータが見つかりません')
        const existingIds = new Set(recipes.map((r) => r.id))
        const toAdd = list.filter((r) => r.id && r.name && !existingIds.has(r.id))
        const skipped = list.length - toAdd.length
        setJsonPreview({ toAdd, skipped })
      } catch (err) {
        setImportError('読み込みに失敗しました: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  const handleJsonImport = () => {
    if (!jsonPreview?.toAdd.length) return
    bulkAddRecipes(jsonPreview.toAdd)
    setJsonDone(true)
    setTimeout(() => {
      setImportOpen(false)
      setJsonPreview(null)
      setJsonDone(false)
      if (jsonFileRef.current) jsonFileRef.current.value = ''
    }, 1200)
  }

  const closeImport = () => {
    setImportOpen(false)
    setImportTab('code')
    setImportCode('')
    setImportPreview(null)
    setImportError('')
    setImportDone(false)
    setJsonPreview(null)
    setJsonDone(false)
    if (jsonFileRef.current) jsonFileRef.current.value = ''
  }

  // ── 並べ替え・在庫フィルター ──────────────────────────────
  const [sortBy, setSortBy] = useState('newest')
  const [stockOnly, setStockOnly] = useState(false)

  // ── テキスト検索 ──────────────────────────────────────────
  const [query, setQuery] = useState('')

  // ── フィルター（ブランド・フレーバー・タグ）──────────────
  const [filterBrandId, setFilterBrandId] = useState('')
  const [filterFlavorId, setFilterFlavorId] = useState('')
  const [filterTags, setFilterTags] = useState([])
  const [tagFilterOpen, setTagFilterOpen] = useState(false)

  const toggleTag = (tag) =>
    setFilterTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])

  const clearAll = () => {
    setQuery('')
    setFilterBrandId('')
    setFilterFlavorId('')
    setFilterTags([])
  }

  const hasFilters = !!query || !!filterBrandId || !!filterFlavorId || filterTags.length > 0

  // レシピで実際に使われているブランド・フレーバーのみ
  const { usedBrands, usedFlavors } = useMemo(() => {
    const usedBrandIds  = new Set(recipes.flatMap((r) => r.flavors?.map((f) => f.brandId)  ?? []))
    const usedFlavorIds = new Set(recipes.flatMap((r) => r.flavors?.map((f) => f.flavorId) ?? []))
    return {
      usedBrands:  brands.filter((b) => usedBrandIds.has(b.id)),
      usedFlavors: allFlavors.filter((f) => usedFlavorIds.has(f.id)),
    }
  }, [recipes, brands, allFlavors])

  // 全レシピタグ（タグフィルター用）
  const allRecipeTags = useMemo(() => {
    const tagSet = new Set()
    recipes.forEach((r) => (r.tags ?? []).forEach((t) => tagSet.add(t)))
    return [...tagSet].sort()
  }, [recipes])

  // ブランド選択後のフレーバー候補
  const filterFlavors = useMemo(
    () => usedFlavors.filter((f) => !filterBrandId || f.brandId === filterBrandId),
    [usedFlavors, filterBrandId]
  )

  // ── フィルタリング・ソートロジック ────────────────────────
  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    let result = recipes.filter((r) => {
      if (q) {
        const nameMatch = r.name.toLowerCase().includes(q)
        const flavorMatch = r.flavors?.some((item) => {
          const fl = getFlavor(item.flavorId)
          const br = brands.find((b) => b.id === item.brandId)
          return fl?.name?.toLowerCase().includes(q) || br?.name?.toLowerCase().includes(q)
        })
        if (!nameMatch && !flavorMatch) return false
      }
      if (filterBrandId && !r.flavors?.some((item) => item.brandId === filterBrandId)) return false
      if (filterFlavorId && !r.flavors?.some((item) => item.flavorId === filterFlavorId)) return false
      if (filterTags.length > 0 && !filterTags.some((t) => (r.tags ?? []).includes(t))) return false
      if (stockOnly) {
        const canMake = r.flavors?.every((item) => {
          const fl = allFlavors.find((f) => f.id === item.flavorId)
          return !fl || fl.inStock !== false
        })
        if (!canMake) return false
      }
      return true
    })
    result = [...result].sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'name')   return a.name.localeCompare(b.name, 'ja')
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    return result
  }, [recipes, query, filterBrandId, filterFlavorId, filterTags, getFlavor, brands, allFlavors, stockOnly, sortBy])

  return (
    <div className="px-5 pt-14 pb-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="tracking-[0.3em] text-[10px] uppercase mb-1" style={{ color: 'var(--c-accent)' }}>{rl.collection}</p>
          <h2
            className="text-2xl"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}
          >
            {rl.title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs tracking-wide active:opacity-60 transition-opacity"
            style={{ border: '1px solid var(--ca-25)', color: 'var(--c-accent)' }}
          >
            <Upload size={12} />
            {rl.exportBtn}
          </button>
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs tracking-wide active:opacity-60 transition-opacity"
            style={{ border: '1px solid var(--ca-25)', color: 'var(--c-accent)' }}
          >
            <Download size={12} />
            {rl.importBtn}
          </button>
        </div>
      </div>

      {/* バックアップリマインダー */}
      {showBackupReminder && (
        <div
          className="flex items-start gap-3 p-3 mb-4"
          style={{ background: 'var(--ca-08)', border: '1px solid var(--ca-20)', borderRadius: 'var(--radius)' }}
        >
          <span className="text-base shrink-0 mt-0.5">💾</span>
          <p className="text-[11px] leading-relaxed flex-1" style={{ color: 'var(--c-muted)' }}>
            {rl.backupReminder}
          </p>
          <div className="flex flex-col gap-1.5 shrink-0">
            <button
              onClick={() => { handleExport(); dismissBackup() }}
              className="px-2.5 py-1 text-[10px] font-semibold tracking-wide active:opacity-60"
              style={{ background: 'var(--ca-grad)', color: 'var(--c-btn-fg)' }}
            >
              {rl.backupExportBtn}
            </button>
            <button
              onClick={dismissBackup}
              className="px-2.5 py-1 text-[10px] active:opacity-60"
              style={{ border: '1px solid var(--ca-15)', color: 'var(--c-dim)' }}
            >
              {rl.backupDismiss}
            </button>
          </div>
        </div>
      )}

      {/* テキスト検索 */}
      <div className="relative mb-2.5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--c-muted)' }} />
        <input
          type="text"
          placeholder={rl.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-sm outline-none transition-colors"
          style={{
            background: 'var(--c-surf)',
            border: '1px solid var(--ca-15)',
            color: 'var(--c-text)',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--ca-40)' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--ca-15)' }}
        />
      </div>

      {/* ブランド・フレーバーフィルター（1行） */}
      <div className="flex items-center gap-2 mb-2.5">
        <FilterSelect
          value={filterBrandId}
          onChange={(v) => { setFilterBrandId(v); setFilterFlavorId('') }}
          placeholder={rl.brandPlaceholder}
          options={usedBrands.map((b) => ({ value: b.id, label: b.name }))}
        />
        <FilterSelect
          value={filterFlavorId}
          onChange={(v) => setFilterFlavorId(v)}
          placeholder={rl.flavorPlaceholder}
        >
          {!filterBrandId
            ? usedBrands.map((brand) => {
                const bf = filterFlavors.filter((f) => f.brandId === brand.id)
                return bf.length > 0 ? (
                  <optgroup key={brand.id} label={brand.name} style={{ background: 'var(--c-surf)', color: 'var(--c-accent)' }}>
                    {bf.map((f) => (
                      <option key={f.id} value={f.id} style={{ background: 'var(--c-surf)', color: 'var(--c-text)' }}>{f.name}</option>
                    ))}
                  </optgroup>
                ) : null
              })
            : filterFlavors.map((f) => (
                <option key={f.id} value={f.id} style={{ background: 'var(--c-surf)', color: 'var(--c-text)' }}>{f.name}</option>
              ))}
        </FilterSelect>
        {(filterBrandId || filterFlavorId) && (
          <button
            onClick={() => { setFilterBrandId(''); setFilterFlavorId('') }}
            className="w-8 h-9 shrink-0 flex items-center justify-center transition-colors active:text-red-500"
            style={{ color: 'var(--c-dim)' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* タグフィルター（折りたたみ） */}
      {allRecipeTags.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setTagFilterOpen((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-colors"
            style={{
              border: `1px solid ${filterTags.length > 0 ? 'var(--c-accent)' : 'var(--ca-20)'}`,
              background: filterTags.length > 0 ? 'var(--ca-10)' : 'transparent',
              color: filterTags.length > 0 ? 'var(--c-accent)' : 'var(--c-muted)',
            }}
          >
            <ChevronDown
              size={11}
              style={{
                transform: tagFilterOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
            {rl.tagFilterBtn}
            {filterTags.length > 0 && (
              <span
                className="ml-0.5 px-1.5 py-0.5 text-[9px] font-semibold rounded-full"
                style={{ background: 'var(--c-accent)', color: 'var(--c-btn-fg)' }}
              >
                {filterTags.length}
              </span>
            )}
          </button>
          {tagFilterOpen && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {allRecipeTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="px-2.5 py-1 text-[10px] border transition-colors"
                  style={{
                    background: filterTags.includes(tag) ? 'var(--ca-15)' : 'transparent',
                    borderColor: filterTags.includes(tag) ? 'var(--c-accent)' : 'var(--ca-20)',
                    color: filterTags.includes(tag) ? 'var(--c-accent)' : 'var(--c-muted)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  {tag}
                </button>
              ))}
              <p className="w-full text-[10px] mt-1" style={{ color: 'var(--c-dim)' }}>
                {rl.tagFilterOr}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 並べ替え・在庫フィルター */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStockOnly((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-colors"
            style={{
              border: `1px solid ${stockOnly ? 'var(--c-accent)' : 'var(--ca-20)'}`,
              background: stockOnly ? 'var(--ca-10)' : 'transparent',
              color: stockOnly ? 'var(--c-accent)' : 'var(--c-muted)',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: stockOnly ? 'var(--c-accent)' : 'var(--c-dim)' }} />
            {rl.stockFilter}
          </button>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs active:opacity-60 transition-opacity"
              style={{
                background: 'var(--c-surf)',
                border: '1px solid var(--ca-15)',
                color: 'var(--c-muted)',
              }}
            >
              <X size={11} />
              {rl.clear}
            </button>
          )}
        </div>
        <div className="relative">
          <select
            aria-label={rl.sortLabel}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none pl-2.5 pr-6 py-1.5 text-xs outline-none"
            style={{
              background: 'var(--c-surf)',
              border: '1px solid var(--ca-15)',
              color: 'var(--c-muted)',
            }}
          >
            <option value="newest">{rl.sortNewest}</option>
            <option value="oldest">{rl.sortOldest}</option>
            <option value="name">{rl.sortName}</option>
          </select>
          <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--c-dim)' }} />
        </div>
      </div>

      {/* 件数バッジ（絞り込み中のみ） */}
      {hasFilters && (
        <p className="text-xs mb-4" style={{ color: 'var(--c-muted)' }}>
          <span className="font-medium" style={{ color: 'var(--c-accent)' }}>{filtered.length}</span> {rl.countSuffix}
        </p>
      )}

      {/* レシピ一覧 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm mb-6" style={{ color: 'var(--c-muted)' }}>
            {hasFilters ? rl.noResults : rl.empty}
          </p>
          {!hasFilters && (
            <button
              onClick={() => navigate('/recipes/new')}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold tracking-wide"
              style={{ background: 'var(--ca-grad)', color: 'var(--c-btn-fg)' }}
            >
              <PlusCircle size={16} />
              {rl.createFirst}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              getFlavor={getFlavor}
              brands={brands}
              onDelete={deleteRecipe}
              onDuplicate={duplicateRecipe}
            />
          ))}
        </div>
      )}

      {/* インポートモーダル */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/70" onClick={closeImport} />
          <div
            className="relative w-full max-w-[390px] p-5"
            style={{
              background: 'var(--c-surf)',
              border: '1px solid var(--ca-20)',
              borderRadius: 'var(--radius)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm tracking-wide" style={{ color: 'var(--c-text)' }}>{rl.importTitle}</h3>
              <button onClick={closeImport} className="transition-colors" style={{ color: 'var(--c-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div className="flex mb-4" style={{ border: '1px solid var(--ca-15)' }}>
              {importTabs.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => { setImportTab(id); setImportPreview(null); setImportError(''); setJsonPreview(null); setJsonDone(false) }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs transition-colors"
                  style={{
                    background: importTab === id ? 'var(--ca-15)' : 'transparent',
                    color: importTab === id ? 'var(--c-accent)' : 'var(--c-muted)',
                  }}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>

            {importTab === 'code' ? (
              <>
                <p className="text-xs mb-2" style={{ color: 'var(--c-muted)' }}>{rl.codePasteHint}</p>
                <textarea
                  value={importCode}
                  onChange={(e) => { setImportCode(e.target.value); setImportPreview(null); setImportError('') }}
                  placeholder="SHI-..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-xs font-mono outline-none transition-colors resize-none"
                  style={{
                    background: 'var(--c-surf-3)',
                    border: '1px solid var(--ca-15)',
                    color: 'var(--c-text)',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--ca-40)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--ca-15)' }}
                />
              </>
            ) : importTab === 'qr' ? (
              !importPreview && (
                <QrScanner
                  onResult={(code) => {
                    setImportCode(code)
                    setImportTab('code')
                    handlePreview(code)
                  }}
                  onError={(msg) => setImportError(msg)}
                />
              )
            ) : (
              <div>
                <p className="text-xs mb-3" style={{ color: 'var(--c-muted)' }}>{rl.jsonHint}</p>
                <input
                  ref={jsonFileRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleJsonFile}
                  className="hidden"
                  id="json-file-input"
                />
                <label
                  htmlFor="json-file-input"
                  className="flex items-center justify-center gap-2 w-full py-3 text-xs tracking-wide cursor-pointer active:opacity-60 transition-opacity"
                  style={{ border: '1px dashed var(--ca-30)', color: 'var(--c-accent)' }}
                >
                  <FileText size={13} />
                  {rl.jsonSelectBtn}
                </label>
                {jsonPreview && (
                  <div className="mt-3 p-3 space-y-1" style={{ background: 'var(--c-surf-3)', border: '1px solid var(--ca-12)', borderRadius: 'var(--radius)' }}>
                    <p className="text-xs font-medium" style={{ color: 'var(--c-accent)' }}>
                      {rl.jsonPreviewAdd(jsonPreview.toAdd.length)}
                    </p>
                    {jsonPreview.skipped > 0 && (
                      <p className="text-xs" style={{ color: 'var(--c-muted)' }}>
                        {rl.jsonPreviewSkip(jsonPreview.skipped)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {importError && (
              <p className="text-red-400 text-xs mt-2">{importError}</p>
            )}

            {importPreview && (
              <div
                className="mt-3 p-3"
                style={{
                  background: 'var(--c-surf-3)',
                  border: '1px solid var(--ca-12)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <p className="text-xs tracking-wide mb-2" style={{ color: 'var(--c-accent)' }}>{importPreview.n}</p>
                <div className="space-y-1 mb-2">
                  {importPreview.f.map((item, i) => (
                    <div key={item.fl + item.b} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: SLICE_COLORS[i % SLICE_COLORS.length] }} />
                      <p className="text-xs flex-1 truncate" style={{ color: 'var(--c-text)' }}>
                        {item.fl}<span style={{ color: 'var(--c-muted)' }}>：{item.b}</span>
                      </p>
                      <span className="text-[10px]" style={{ color: 'var(--c-sub)' }}>{item.g}g</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              {importTab === 'json' ? (
                jsonPreview?.toAdd.length > 0 ? (
                  <button
                    onClick={handleJsonImport}
                    className="flex-1 py-3 text-sm font-semibold tracking-wide transition-all"
                    style={{
                      background: jsonDone ? '#2a4a2a' : 'var(--ca-grad)',
                      color: jsonDone ? '#7ec8a0' : 'var(--c-btn-fg)',
                    }}
                  >
                    {jsonDone ? rl.jsonDoneMsg : rl.jsonAddBtn}
                  </button>
                ) : jsonPreview ? (
                  <p className="flex-1 text-center text-xs py-3" style={{ color: 'var(--c-muted)' }}>
                    {rl.jsonNoNew}
                  </p>
                ) : null
              ) : importTab === 'code' && !importPreview ? (
                <button
                  onClick={() => handlePreview()}
                  disabled={!importCode.trim()}
                  className="flex-1 py-3 text-sm font-semibold tracking-wide disabled:opacity-30 transition-opacity"
                  style={{ background: 'var(--ca-grad)', color: 'var(--c-btn-fg)' }}
                >
                  {rl.previewBtn}
                </button>
              ) : importPreview ? (
                <button
                  onClick={handleImport}
                  className="flex-1 py-3 text-sm font-semibold tracking-wide transition-all"
                  style={{
                    background: importDone ? '#2a4a2a' : 'var(--ca-grad)',
                    color: importDone ? '#7ec8a0' : 'var(--c-btn-fg)',
                  }}
                >
                  {importDone ? rl.addedMsg : rl.addBtn}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── フィルター用セレクト ─────────────────────────────────────

function FilterSelect({ value, onChange, placeholder, options, children }) {
  return (
    <div className="relative flex-1 min-w-0">
      <select
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none pl-3 pr-7 py-2.5 text-xs outline-none transition-colors"
        style={{
          background: 'var(--c-surf)',
          border: '1px solid var(--ca-15)',
          color: value ? 'var(--c-text)' : 'var(--c-muted)',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--ca-40)' }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--ca-15)' }}
      >
        <option value="" style={{ background: 'var(--c-surf)', color: 'var(--c-muted)' }}>{placeholder}</option>
        {children ?? options?.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: 'var(--c-surf)', color: 'var(--c-text)' }}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--c-muted)' }} />
    </div>
  )
}

// ─── レシピカード ──────────────────────────────────────────────

async function generateShareCard(recipe, getFlavor, brands, scanToImport = 'Scan to import') {
  const code = encodeRecipe(recipe, getFlavor, brands)
  const totalGrams = recipe.totalGrams ?? recipe.flavors?.reduce((s, f) => s + (f.grams || 0), 0) ?? 0
  const flavors = recipe.flavors ?? []

  const W = 420
  const flavorH = Math.max(flavors.length * 38, 38)
  const noteH = (recipe.tastingNote || recipe.memo) ? 36 : 0
  const H = 96 + flavorH + 20 + noteH + 160

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#111111'
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = 'rgba(201,168,76,0.3)'
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1)

  ctx.fillStyle = 'rgba(201,168,76,0.6)'
  ctx.font = '600 11px system-ui,sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('SHISHA MIX', W - 16, 22)
  ctx.textAlign = 'left'

  ctx.fillStyle = '#f0ede8'
  ctx.font = 'bold 20px Georgia,serif'
  ctx.fillText(recipe.name, 16, 52)

  ctx.fillStyle = '#5a5555'
  ctx.font = '11px system-ui,sans-serif'
  ctx.fillText(`${totalGrams}g · ${new Date(recipe.createdAt).toLocaleDateString('ja-JP')}`, 16, 70)

  ctx.strokeStyle = 'rgba(201,168,76,0.2)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(16, 82); ctx.lineTo(W - 16, 82); ctx.stroke()

  const listMaxW = 255
  flavors.forEach((item, i) => {
    const fl = getFlavor(item.flavorId)
    const br = brands.find((b) => b.id === item.brandId)
    const pct = totalGrams > 0 ? Math.round((item.grams / totalGrams) * 100) : 0
    const y = 105 + i * 38

    ctx.fillStyle = SLICE_COLORS[i % SLICE_COLORS.length]
    ctx.beginPath(); ctx.arc(24, y, 5, 0, Math.PI * 2); ctx.fill()

    ctx.fillStyle = '#f0ede8'
    ctx.font = '13px system-ui,sans-serif'
    ctx.fillText(truncate(fl?.name ?? 'Unknown', ctx, listMaxW - 100), 38, y + 5)

    ctx.fillStyle = '#5a5555'
    ctx.font = '10px system-ui,sans-serif'
    ctx.fillText(br?.name ?? '', 38, y + 20)

    ctx.fillStyle = '#9a9090'
    ctx.font = '11px system-ui,sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`${item.grams}g / ${pct}%`, listMaxW, y + 5)
    ctx.textAlign = 'left'
  })

  const afterFlavorY = 105 + flavorH + 10
  if (recipe.tastingNote || recipe.memo) {
    ctx.strokeStyle = 'rgba(201,168,76,0.1)'
    ctx.beginPath(); ctx.moveTo(16, afterFlavorY); ctx.lineTo(W - 16, afterFlavorY); ctx.stroke()
    ctx.fillStyle = '#5a5555'
    ctx.font = '11px system-ui,sans-serif'
    ctx.fillText(truncate(recipe.tastingNote || recipe.memo, ctx, W - 32), 16, afterFlavorY + 20)
  }

  const qrSize = 130
  const qrX = W - qrSize - 16
  const qrY = 88
  const qrCanvas = document.createElement('canvas')
  const { default: QRCodeLib } = await import('qrcode')
  await QRCodeLib.toCanvas(qrCanvas, code, { width: qrSize, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8)
  ctx.drawImage(qrCanvas, qrX, qrY)

  ctx.fillStyle = '#5a5555'
  ctx.font = '10px system-ui,sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(scanToImport, qrX + qrSize / 2, qrY + qrSize + 16)
  ctx.textAlign = 'left'

  ctx.fillStyle = 'rgba(201,168,76,0.5)'
  ctx.font = '11px system-ui,sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('#ShishaMix', W - 16, H - 10)
  ctx.textAlign = 'left'

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

function truncate(text, ctx, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  while (t.length > 0 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1)
  return t + '…'
}

function buildXPostText(recipe, getFlavor, brands) {
  const totalGrams =
    recipe.totalGrams ?? recipe.flavors?.reduce((s, f) => s + (f.grams || 0), 0) ?? 0

  const lines = [`🍯 ${recipe.name}`, '─'.repeat(20)]

  recipe.flavors?.forEach((item) => {
    const fl = getFlavor(item.flavorId)
    const br = brands.find((b) => b.id === item.brandId)
    const pct = totalGrams > 0 ? Math.round((item.grams / totalGrams) * 100) : 0
    lines.push(`${fl?.name ?? 'Unknown'}（${br?.name ?? ''}） ${item.grams}g / ${pct}%`)
  })

  lines.push('─'.repeat(20))
  lines.push(`合計: ${totalGrams}g`)

  if (recipe.tastingNote || recipe.memo) {
    lines.push('', recipe.tastingNote || recipe.memo)
  }

  lines.push('', '#ShishaMix')

  return lines.join('\n')
}

function RecipeCard({ recipe, getFlavor, brands, onDelete, onDuplicate }) {
  const navigate = useNavigate()
  const { t } = useLang()
  const rl = t.recipeList
  const [shareOpen, setShareOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [duplicated, setDuplicated] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleDuplicate = (e) => {
    e.stopPropagation()
    onDuplicate(recipe.id)
    setDuplicated(true)
    setTimeout(() => setDuplicated(false), 1500)
  }

  const handleDelete = () => {
    onDelete(recipe.id)
    setDeleteOpen(false)
  }

  const handleCopyCode = async () => {
    const code = encodeRecipe(recipe, getFlavor, brands)
    await navigator.clipboard.writeText(code)
    setCodeCopied(true)
    setTimeout(() => {
      setCodeCopied(false)
      setShareOpen(false)
    }, 1500)
  }

  const handleShareImg = async () => {
    const text = buildXPostText(recipe, getFlavor, brands)
    try {
      const blob = await generateShareCard(recipe, getFlavor, brands, rl.scanToImport)
      const file = new File([blob], 'shisha-recipe.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: recipe.name, text, files: [file] })
      } else if (navigator.share) {
        await navigator.share({ title: recipe.name, text })
      } else {
        await navigator.clipboard.writeText(text)
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${recipe.name}.png`
        a.click()
        URL.revokeObjectURL(a.href)
      }
      setShareOpen(false)
    } catch {
      // キャンセル時は何もしない
    }
  }

  const totalGrams =
    recipe.totalGrams ?? recipe.flavors?.reduce((s, f) => s + (f.grams || 0), 0) ?? 0
  const note = recipe.tastingNote || recipe.memo || ''
  const tags = recipe.tags ?? []

  return (
    <div
      className="p-4"
      style={{
        background: 'var(--c-surf)',
        border: '1px solid var(--ca-10)',
        borderRadius: 'var(--radius)',
      }}
    >
      {/* 名前（単独行） */}
      <h3 className="font-medium text-sm mb-2 leading-snug" style={{ color: 'var(--c-text)' }}>
        {recipe.name}
      </h3>

      {/* アイコン行（4つ） */}
      <div className="flex items-center gap-0 mb-3" style={{ marginLeft: '-6px' }}>
        <button
          onClick={(e) => { e.stopPropagation(); setShareOpen(true) }}
          className="p-1.5 transition-colors"
          style={{ color: 'var(--c-muted)' }}
          title={rl.shareBtn}
        >
          <Send size={14} />
        </button>
        <button
          onClick={handleDuplicate}
          className="p-1.5 transition-colors"
          style={{ color: 'var(--c-muted)' }}
          title={rl.duplicateTooltip}
        >
          {duplicated ? <Check size={14} style={{ color: 'var(--c-accent)' }} /> : <CopyPlus size={14} />}
        </button>
        <button
          onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
          className="p-1.5 transition-colors"
          style={{ color: 'var(--c-muted)' }}
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setDeleteOpen(true) }}
          className="p-1.5 transition-colors active:text-red-500"
          style={{ color: 'var(--c-dim)' }}
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* フレーバーリスト + ミニドーナツ */}
      {recipe.flavors && recipe.flavors.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1.5 min-w-0">
            {recipe.flavors.map((item, i) => {
              const fl = getFlavor(item.flavorId)
              const br = brands.find((b) => b.id === item.brandId)
              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: SLICE_COLORS[i % SLICE_COLORS.length] }}
                  />
                  <p className="text-xs flex-1 truncate min-w-0" style={{ color: 'var(--c-text)' }}>
                    {fl?.name ?? 'Unknown'}
                    <span style={{ color: 'var(--c-muted)' }}>　{br?.name ?? ''}</span>
                  </p>
                </div>
              )
            })}
          </div>
          <div className="shrink-0">
            <MiniDonut items={recipe.flavors} total={totalGrams} />
          </div>
        </div>
      )}

      {/* タグ */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[9px]"
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

      {/* テイスティングノート（折り畳み） */}
      {note && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--ca-08)' }}>
          <button
            onClick={() => setNoteOpen((v) => !v)}
            className="flex items-center gap-1.5 text-xs w-full text-left active:opacity-60 transition-opacity"
            style={{ color: 'var(--c-muted)' }}
          >
            <ChevronDown
              size={12}
              style={{
                transform: noteOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
                color: 'var(--c-dim)',
              }}
            />
            Tasting Note
          </button>
          {noteOpen && (
            <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--c-muted)' }}>
              {note}
            </p>
          )}
        </div>
      )}

      {/* 共有ボトムシート */}
      {shareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          onClick={() => setShareOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70" />
          <div
            className="relative w-full max-w-[400px] p-5"
            style={{
              background: 'var(--c-surf)',
              border: '1px solid var(--ca-20)',
              borderRadius: 'var(--radius)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs tracking-widest uppercase mb-0.5" style={{ color: 'var(--c-accent)' }}>{rl.shareBtn}</p>
                <p className="text-sm font-medium truncate" style={{ color: 'var(--c-text)', maxWidth: '260px' }}>{recipe.name}</p>
              </div>
              <button onClick={() => setShareOpen(false)} style={{ color: 'var(--c-muted)' }}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => { setShareOpen(false); setQrOpen(true) }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-left transition-colors active:opacity-70"
                style={{ background: 'var(--c-surf-2)', border: '1px solid var(--ca-12)', borderRadius: 'var(--radius)' }}
              >
                <QrCode size={16} style={{ color: 'var(--c-accent)', flexShrink: 0 }} />
                <span style={{ color: 'var(--c-text)' }}>{rl.shareQr}</span>
              </button>
              <button
                onClick={handleCopyCode}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-left transition-colors active:opacity-70"
                style={{ background: 'var(--c-surf-2)', border: '1px solid var(--ca-12)', borderRadius: 'var(--radius)' }}
              >
                {codeCopied
                  ? <Check size={16} style={{ color: 'var(--c-accent)', flexShrink: 0 }} />
                  : <Copy size={16} style={{ color: 'var(--c-accent)', flexShrink: 0 }} />}
                <span style={{ color: 'var(--c-text)' }}>{codeCopied ? rl.shareCopied : rl.shareCopyCode}</span>
              </button>
              <button
                onClick={handleShareImg}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-left transition-colors active:opacity-70"
                style={{ background: 'var(--c-surf-2)', border: '1px solid var(--ca-12)', borderRadius: 'var(--radius)' }}
              >
                <Send size={16} style={{ color: 'var(--c-accent)', flexShrink: 0 }} />
                <span style={{ color: 'var(--c-text)' }}>{rl.shareImg}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QRコードモーダル */}
      {qrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5" onClick={() => setQrOpen(false)}>
          <div className="absolute inset-0 bg-black/70" />
          <div
            className="relative p-6 flex flex-col items-center gap-4 w-full max-w-[300px]"
            style={{
              background: 'var(--c-surf)',
              border: '1px solid var(--ca-20)',
              borderRadius: 'var(--radius)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full">
              <p className="text-sm font-medium truncate flex-1 mr-2" style={{ color: 'var(--c-text)' }}>{recipe.name}</p>
              <button onClick={() => setQrOpen(false)} className="shrink-0" style={{ color: 'var(--c-muted)' }}>
                <X size={16} />
              </button>
            </div>
            <QrCanvas value={encodeRecipe(recipe, getFlavor, brands)} />
            <p className="text-xs text-center whitespace-pre-line" style={{ color: 'var(--c-muted)' }}>{rl.qrScreenshotHint}</p>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          onClick={() => setDeleteOpen(false)}
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
              {rl.deleteTitle}
            </h3>
            <p className="text-xs mb-5 leading-relaxed" style={{ color: 'var(--c-muted)' }}>
              {rl.deleteConfirm(recipe.name)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteOpen(false)}
                className="flex-1 py-2.5 text-sm active:opacity-70"
                style={{ border: '1px solid var(--ca-20)', color: 'var(--c-muted)' }}
              >
                {rl.deleteCancelBtn}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 text-sm font-semibold active:opacity-80"
                style={{ background: '#4a2a2a', color: '#e07070' }}
              >
                {rl.deleteOkBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ミニドーナツチャート ──────────────────────────────────────

function MiniDonut({ items, total }) {
  const SIZE = 72
  const R = 28
  const r = 11
  const cx = SIZE / 2
  const cy = SIZE / 2
  const textR = (R + r) / 2

  const slices = items.filter((item) => item.grams > 0)
  if (slices.length === 0) return null

  if (slices.length === 1) {
    return (
      <svg width={SIZE} height={SIZE} className="shrink-0">
        <circle cx={cx} cy={cy} r={R} fill={SLICE_COLORS[0]} />
        <circle cx={cx} cy={cy} r={r} style={{ fill: 'var(--c-surf)' }} />
        <text x={cx} y={cy + 3} textAnchor="middle" fill="rgba(255,255,255,0.92)" fontSize="7.5" fontWeight="bold">
          100%
        </text>
      </svg>
    )
  }

  let angle = -Math.PI / 2
  const paths = slices.map((item, i) => {
    const sweep = (item.grams / total) * 2 * Math.PI
    const end = angle + sweep
    const large = sweep > Math.PI ? 1 : 0
    const mid = angle + sweep / 2

    const ox1 = cx + R * Math.cos(angle), oy1 = cy + R * Math.sin(angle)
    const ox2 = cx + R * Math.cos(end),   oy2 = cy + R * Math.sin(end)
    const ix1 = cx + r * Math.cos(end),   iy1 = cy + r * Math.sin(end)
    const ix2 = cx + r * Math.cos(angle), iy2 = cy + r * Math.sin(angle)
    const d = `M ${ox1} ${oy1} A ${R} ${R} 0 ${large} 1 ${ox2} ${oy2} L ${ix1} ${iy1} A ${r} ${r} 0 ${large} 0 ${ix2} ${iy2} Z`

    const pct = Math.round((item.grams / total) * 100)
    const tx = cx + textR * Math.cos(mid)
    const ty = cy + textR * Math.sin(mid)
    angle = end
    return { d, color: SLICE_COLORS[i % SLICE_COLORS.length], pct, tx, ty, key: item.flavorId ?? i }
  })

  return (
    <svg width={SIZE} height={SIZE} className="shrink-0">
      {paths.map((p) => (
        <g key={p.key}>
          <path d={p.d} fill={p.color} />
          {p.pct >= 8 && (
            <text
              x={p.tx}
              y={p.ty + 2.5}
              textAnchor="middle"
              fill="rgba(255,255,255,0.92)"
              fontSize="7.5"
              fontWeight="bold"
            >
              {p.pct}%
            </text>
          )}
        </g>
      ))}
      <circle cx={cx} cy={cy} r={r - 1} style={{ fill: 'var(--c-surf)' }} />
    </svg>
  )
}

// ─── QRコード表示（canvas） ───────────────────────────────────

function QrCanvas({ value }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    import('qrcode').then(({ default: QRCodeLib }) => {
      QRCodeLib.toCanvas(canvasRef.current, value, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      })
    })
  }, [value])

  return (
    <div className="p-3 bg-white">
      <canvas ref={canvasRef} />
    </div>
  )
}

// ─── QRスキャナー ──────────────────────────────────────────────

function QrScanner({ onResult, onError }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const { t } = useLang()

  useEffect(() => {
    let active = true
    let stream = null
    let animFrame = null

    let jsQR = null
    import('jsqr').then((m) => { jsQR = m.default })

    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        if (!active) { s.getTracks().forEach((t) => t.stop()); return }
        stream = s
        videoRef.current.srcObject = s
        videoRef.current.play().then(tick).catch(() => {})
      })
      .catch(() => onError(t.recipeList.qrHint))

    function tick() {
      if (!active) return
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return
      if (jsQR && video.readyState >= 2 && video.videoWidth > 0) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0)
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(img.data, img.width, img.height)
        if (code?.data) {
          active = false
          stream?.getTracks().forEach((t) => t.stop())
          onResult(code.data)
          return
        }
      }
      animFrame = requestAnimationFrame(tick)
    }

    return () => {
      active = false
      cancelAnimationFrame(animFrame)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <div className="relative w-full">
      <video ref={videoRef} playsInline muted className="w-full" />
      <canvas ref={canvasRef} className="hidden" />
      <p className="text-xs text-center mt-2" style={{ color: 'var(--c-muted)' }}>{t.recipeList.qrHint}</p>
    </div>
  )
}
