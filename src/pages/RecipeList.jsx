import { useState, useEffect, useRef, useMemo } from 'react'
import jsQR from 'jsqr'
import { useNavigate } from 'react-router-dom'
import { Search, Trash2, PlusCircle, Pencil, X, ChevronDown, Plus, Check, Download, Upload, Copy, Send, QrCode, Camera, FileText } from 'lucide-react'
import { useRecipes, useFlavors } from '../hooks/useStorage'
import { encodeRecipe, decodeRecipe } from '../utils/shareCode'
import QRCodeLib from 'qrcode'
import { SLICE_COLORS } from '../constants/colors'
import { useLang } from '../contexts/LangContext'

export default function RecipeList() {
  const { recipes, deleteRecipe, addRecipe, bulkAddRecipes } = useRecipes()
  const { getFlavor, brands, flavors: allFlavors, addBrand, addFlavor } = useFlavors()
  const navigate = useNavigate()
  const { t } = useLang()
  const rl = t.recipeList

  // ── QRモーダル ────────────────────────────────────────────
  const [qrRecipe, setQrRecipe] = useState(null)

  // ── インポートモーダル ──────────────────────────────────────
  const [importOpen, setImportOpen] = useState(false)
  const [importTab, setImportTab] = useState('code') // 'code' | 'qr' | 'json'
  const [importCode, setImportCode] = useState('')
  const [importPreview, setImportPreview] = useState(null)
  const [importError, setImportError] = useState('')
  const [importDone, setImportDone] = useState(false)
  const [jsonPreview, setJsonPreview] = useState(null) // { toAdd, skipped }
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

  // ── テキスト検索 ──────────────────────────────────────────
  const [query, setQuery] = useState('')

  // ── フィルター行（初期1行、ADD FILTERで追加）─────────────
  const [filterRows, setFilterRows] = useState([{ id: 0, brandId: '', flavorId: '' }])

  const addFilterRow = () =>
    setFilterRows((prev) => [...prev, { id: Date.now(), brandId: '', flavorId: '' }])

  const updateRow = (id, field, val) =>
    setFilterRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, [field]: val, ...(field === 'brandId' ? { flavorId: '' } : {}) }
          : r
      )
    )

  const removeRow = (id) => {
    setFilterRows((prev) => {
      if (prev.length === 1) return [{ id: 0, brandId: '', flavorId: '' }]
      return prev.filter((r) => r.id !== id)
    })
  }

  const clearAll = () => { setQuery(''); setFilterRows([{ id: 0, brandId: '', flavorId: '' }]) }

  const hasFilters = !!query || filterRows.some((r) => r.brandId || r.flavorId)

  // レシピで実際に使われているブランド・フレーバーのみ
  const { usedBrands, usedFlavors } = useMemo(() => {
    const usedBrandIds  = new Set(recipes.flatMap((r) => r.flavors?.map((f) => f.brandId)  ?? []))
    const usedFlavorIds = new Set(recipes.flatMap((r) => r.flavors?.map((f) => f.flavorId) ?? []))
    return {
      usedBrands:  brands.filter((b) => usedBrandIds.has(b.id)),
      usedFlavors: allFlavors.filter((f) => usedFlavorIds.has(f.id)),
    }
  }, [recipes, brands, allFlavors])

  // ── フィルタリングロジック（全行AND）─────────────────────
  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return recipes.filter((r) => {
      if (q) {
        const nameMatch = r.name.toLowerCase().includes(q)
        const flavorMatch = r.flavors?.some((item) => {
          const fl = getFlavor(item.flavorId)
          const br = brands.find((b) => b.id === item.brandId)
          return fl?.name?.toLowerCase().includes(q) || br?.name?.toLowerCase().includes(q)
        })
        if (!nameMatch && !flavorMatch) return false
      }
      for (const row of filterRows) {
        if (row.brandId  && !r.flavors?.some((item) => item.brandId  === row.brandId))  return false
        if (row.flavorId && !r.flavors?.some((item) => item.flavorId === row.flavorId)) return false
      }
      return true
    })
  }, [recipes, query, filterRows, getFlavor, brands])

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

      {/* フィルター行群 */}
      <div className="space-y-2 mb-3">
        {filterRows.map((row) => {
          const rowFlavors = usedFlavors.filter((f) => !row.brandId || f.brandId === row.brandId)
          return (
            <div key={row.id} className="flex items-center gap-2">
              {/* ブランド */}
              <FilterSelect
                value={row.brandId}
                onChange={(v) => updateRow(row.id, 'brandId', v)}
                placeholder={rl.brandPlaceholder}
                options={usedBrands.map((b) => ({ value: b.id, label: b.name }))}
              />
              {/* フレーバー */}
              <FilterSelect
                value={row.flavorId}
                onChange={(v) => updateRow(row.id, 'flavorId', v)}
                placeholder={rl.flavorPlaceholder}
              >
                {!row.brandId
                  ? usedBrands.map((brand) => {
                      const bf = rowFlavors.filter((f) => f.brandId === brand.id)
                      return bf.length > 0 ? (
                        <optgroup key={brand.id} label={brand.name} style={{ background: 'var(--c-surf)', color: 'var(--c-accent)' }}>
                          {bf.map((f) => (
                            <option key={f.id} value={f.id} style={{ background: 'var(--c-surf)', color: 'var(--c-text)' }}>{f.name}</option>
                          ))}
                        </optgroup>
                      ) : null
                    })
                  : rowFlavors.map((f) => (
                      <option key={f.id} value={f.id} style={{ background: 'var(--c-surf)', color: 'var(--c-text)' }}>{f.name}</option>
                    ))}
              </FilterSelect>
              {/* 行クリア／削除 */}
              <button
                onClick={() => removeRow(row.id)}
                className="w-8 h-9 shrink-0 flex items-center justify-center transition-colors active:text-red-500"
                style={{ color: 'var(--c-dim)' }}
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>

      {/* ADD FILTER / 全クリア */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={addFilterRow}
          className="flex items-center gap-1.5 px-3 py-2 border-dashed border text-xs tracking-wide active:opacity-60 transition-opacity"
          style={{
            borderColor: 'var(--ca-25)',
            color: 'var(--c-accent)',
          }}
        >
          <Plus size={11} strokeWidth={2.5} />
          {rl.addFilter}
        </button>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 px-3 py-2 text-xs active:opacity-60 transition-opacity"
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
              onQr={setQrRecipe}
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
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm tracking-wide" style={{ color: 'var(--c-text)' }}>{rl.importTitle}</h3>
              <button onClick={closeImport} className="transition-colors" style={{ color: 'var(--c-muted)' }}>
                <X size={18} />
              </button>
            </div>

            {/* タブ切り替え */}
            <div className="flex mb-4" style={{ border: '1px solid var(--ca-15)' }}>
              {[{ id: 'code', icon: Copy, label: rl.codeTab }, { id: 'qr', icon: Camera, label: rl.qrTab }, { id: 'json', icon: FileText, label: rl.jsonTab }].map(({ id, icon: Icon, label }) => (
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
              /* JSONファイルタブ */
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

            {/* プレビュー */}
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
                    <div key={i} className="flex items-center gap-2">
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

            {/* ボタン */}
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

      {/* QRコードモーダル */}
      {qrRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5" onClick={() => setQrRecipe(null)}>
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
              <p className="text-sm font-medium truncate flex-1 mr-2" style={{ color: 'var(--c-text)' }}>{qrRecipe.name}</p>
              <button onClick={() => setQrRecipe(null)} className="shrink-0" style={{ color: 'var(--c-muted)' }}>
                <X size={16} />
              </button>
            </div>
            <QrCanvas value={encodeRecipe(qrRecipe, getFlavor, brands)} />
            <p className="text-xs text-center whitespace-pre-line" style={{ color: 'var(--c-muted)' }}>{rl.qrScreenshotHint}</p>
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

function RecipeCard({ recipe, getFlavor, brands, onDelete, onQr }) {
  const navigate = useNavigate()
  const { t } = useLang()
  const rl = t.recipeList
  const [shared, setShared] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirm(rl.deleteConfirm(recipe.name))) {
      onDelete(recipe.id)
    }
  }

  const handleShare = async (e) => {
    e.stopPropagation()
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
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch {
      // キャンセル時は何もしない
    }
  }

  const handleCopyCode = async (e) => {
    e.stopPropagation()
    const code = encodeRecipe(recipe, getFlavor, brands)
    await navigator.clipboard.writeText(code)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const totalGrams =
    recipe.totalGrams ?? recipe.flavors?.reduce((s, f) => s + (f.grams || 0), 0) ?? 0

  return (
    <div
      className="p-4"
      style={{
        background: 'var(--c-surf)',
        border: '1px solid var(--ca-10)',
        borderRadius: 'var(--radius)',
      }}
    >

      {/* ヘッダー */}
      <div className="flex items-start gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate" style={{ color: 'var(--c-text)' }}>{recipe.name}</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--c-muted)' }}>
            {totalGrams > 0 && <span>{totalGrams}g · </span>}
            {new Date(recipe.createdAt).toLocaleDateString('ja-JP')}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onQr(recipe) }}
          className="p-1.5 transition-colors shrink-0"
          style={{ color: 'var(--c-muted)' }}
          title={rl.qrTooltip}
        >
          <QrCode size={14} />
        </button>
        <button
          onClick={handleCopyCode}
          className="p-1.5 transition-colors shrink-0"
          style={{ color: 'var(--c-muted)' }}
          title={rl.copyCodeTooltip}
        >
          {codeCopied ? <Check size={14} style={{ color: 'var(--c-accent)' }} /> : <Copy size={14} />}
        </button>
        <button
          onClick={handleShare}
          className="p-1.5 transition-colors shrink-0"
          style={{ color: 'var(--c-muted)' }}
          title={rl.xPostTooltip}
        >
          {shared ? <Check size={14} style={{ color: 'var(--c-accent)' }} /> : <Send size={14} />}
        </button>
        <button
          onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
          className="p-1.5 transition-colors shrink-0"
          style={{ color: 'var(--c-muted)' }}
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 transition-colors shrink-0 hover:text-red-500 active:text-red-500"
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
                    <span style={{ color: 'var(--c-muted)' }}>：{br?.name ?? ''}</span>
                  </p>
                  <span className="text-[10px] shrink-0" style={{ color: 'var(--c-sub)' }}>{item.grams}g</span>
                </div>
              )
            })}
          </div>
          <div className="shrink-0">
            <MiniDonut items={recipe.flavors} total={totalGrams} />
          </div>
        </div>
      )}

      {/* テイスティングノート */}
      {(recipe.tastingNote || recipe.memo) && (
        <p
          className="mt-3 text-xs leading-relaxed pt-3"
          style={{
            color: 'var(--c-muted)',
            borderTop: '1px solid var(--ca-08)',
          }}
        >
          {recipe.tastingNote || recipe.memo}
        </p>
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
    return { d, color: SLICE_COLORS[i % SLICE_COLORS.length], pct, tx, ty }
  })

  return (
    <svg width={SIZE} height={SIZE} className="shrink-0">
      {paths.map((p, i) => (
        <g key={i}>
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
    QRCodeLib.toCanvas(canvasRef.current, value, {
      width: 200,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
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
      if (video.readyState >= 2 && video.videoWidth > 0) {
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
