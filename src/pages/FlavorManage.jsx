import { useState, useMemo } from 'react'
import { X, Plus, ChevronDown } from 'lucide-react'
import { useFlavors } from '../hooks/useStorage'

const CATEGORIES = [
  'フルーツ', 'ミント', 'お菓子・スイーツ',
  'フローラル', 'ドリンク', 'ナッツ', 'スパイス', '変わり種',
]

export default function FlavorManage() {
  const { brands, flavors, addBrand, addFlavor, deleteBrand, deleteFlavor } = useFlavors()
  const [activeBrandId, setActiveBrandId] = useState(brands[0]?.id ?? '')
  const [showModal, setShowModal] = useState(false)

  const activeBrand   = brands.find((b) => b.id === activeBrandId)
  const activeFlavors = flavors.filter((f) => f.brandId === activeBrandId)

  // カテゴリ別にグループ化（各カテゴリ内はアルファベット順）
  const byCategory = activeFlavors.reduce((acc, f) => {
    ;(acc[f.category] ??= []).push(f)
    return acc
  }, {})
  for (const arr of Object.values(byCategory)) {
    arr.sort((a, b) => a.name.localeCompare(b.name, 'en'))
  }

  const handleDeleteFlavor = (flavor) => {
    if (!confirm(`「${flavor.name}」を削除しますか？`)) return
    deleteFlavor(flavor.id)
    // フレーバーがなくなったらブランドも自動削除
    const remaining = flavors.filter(
      (f) => f.brandId === flavor.brandId && f.id !== flavor.id
    )
    if (remaining.length === 0) {
      const nextBrand = brands.find((b) => b.id !== flavor.brandId)
      deleteBrand(flavor.brandId)
      setActiveBrandId(nextBrand?.id ?? '')
    }
  }

  return (
    <div className="px-5 pt-14 pb-10">

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[#c9a84c] tracking-[0.3em] text-[10px] uppercase mb-1">Library</p>
          <h2
            className="text-2xl text-[#f0ede8]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Flavor List
          </h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-[#0a0a0a] text-xs font-semibold tracking-widest uppercase active:opacity-80"
          style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c97a)' }}
        >
          <Plus size={13} strokeWidth={2.5} />
          追加
        </button>
      </div>

      {brands.length === 0 ? (
        <p className="text-center text-[#3a3535] text-sm py-16">
          ブランドがありません。「追加」から登録してください。
        </p>
      ) : (
        <>
          {/* ── ブランドドロップダウン ── */}
          <div className="relative mb-5">
            <select
              value={activeBrandId}
              onChange={(e) => setActiveBrandId(e.target.value)}
              className="w-full appearance-none px-4 pr-9 py-3 bg-[#111] border border-[rgba(201,168,76,0.15)] text-[#f0ede8] text-sm outline-none focus:border-[rgba(201,168,76,0.4)] transition-colors"
            >
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id} style={{ background: '#111', color: '#f0ede8' }}>
                  {brand.name}（{brand.origin}）
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5555] pointer-events-none" />
          </div>

          {activeBrand && (
            <>
              {/* ── ブランド情報バー ── */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#5a5555] text-xs">
                  {activeBrand.name} · {activeBrand.origin} · {activeFlavors.length}種
                </span>
              </div>

              {/* ゴールド区切り線 */}
              <div
                className="h-px mb-4"
                style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.4), transparent)' }}
              />

              {/* ── フレーバー一覧（カテゴリ別） ── */}
              {activeFlavors.length === 0 ? (
                <p className="text-[#3a3535] text-xs text-center py-8">
                  このブランドにフレーバーがありません
                </p>
              ) : (
                <div className="space-y-5">
                  {CATEGORIES.filter((c) => byCategory[c]).map((cat) => (
                    <div key={cat}>
                      <p className="text-[#c9a84c] text-[10px] tracking-widest uppercase mb-2">
                        {cat}
                      </p>
                      <div className="space-y-1">
                        {byCategory[cat].map((flavor) => (
                          <div
                            key={flavor.id}
                            className="flex items-center gap-2 px-3 py-2 bg-[#111] border border-[rgba(201,168,76,0.08)]"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] shrink-0 opacity-50" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[#f0ede8] text-xs">{flavor.name}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteFlavor(flavor)}
                              className="shrink-0 text-[#3a3535] p-1 hover:text-red-500 transition-colors"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* 追加モーダル */}
      {showModal && (
        <AddModal
          brands={brands}
          flavors={flavors}
          onAddBrand={addBrand}
          onAddFlavor={addFlavor}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

// ─── 追加モーダル ─────────────────────────────────────────────

function AddModal({ brands, flavors, onAddBrand, onAddFlavor, onClose }) {
  // ブランド
  const [brandMode, setBrandMode]           = useState('select')
  const [selectedBrandId, setSelectedBrandId] = useState(brands[0]?.id ?? '')
  const [newBrandName,   setNewBrandName]   = useState('')
  const [newBrandOrigin, setNewBrandOrigin] = useState('')

  // フレーバー
  const [flavorMode, setFlavorMode]             = useState('select')
  const [selectedFlavorId, setSelectedFlavorId] = useState('')
  const [flavorName, setFlavorName]             = useState('')
  const [flavorCat,  setFlavorCat]              = useState(CATEGORIES[0])

  // 既存フレーバーを五十音順にソート
  const sortedFlavors = useMemo(
    () => [...flavors].sort((a, b) => a.name.localeCompare(b.name, 'en')),
    [flavors]
  )

  const handleSave = () => {
    // ── ブランドを確定 ──
    let brandId = selectedBrandId
    if (brandMode === 'new') {
      if (!newBrandName.trim()) return alert('ブランド名（英語）を入力してください')
      const nb = onAddBrand({
        name:   newBrandName.trim(),
        nameJa: newBrandName.trim(),
        origin: newBrandOrigin.trim(),
      })
      brandId = nb.id
    } else {
      if (!brandId) return alert('ブランドを選択してください')
    }

    // ── フレーバーを確定 ──
    let name, category
    if (flavorMode === 'select') {
      const existing = flavors.find((f) => f.id === selectedFlavorId)
      if (!existing) return alert('フレーバーを選択してください')
      ;({ name, category } = existing)
    } else {
      if (!flavorName.trim()) return alert('フレーバー名を入力してください')
      name     = flavorName.trim()
      category = flavorCat
    }

    onAddFlavor({ brandId, name, nameJa: name, category })
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
          background: '#161616',
          border: '1px solid rgba(201,168,76,0.2)',
          maxHeight: '88vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(201,168,76,0.1)]">
          <h3 className="text-[#f0ede8] text-sm font-medium">フレーバーを追加</h3>
          <button onClick={onClose} className="text-[#5a5555] p-1"><X size={18} /></button>
        </div>

        <div className="px-5 py-5 space-y-6">

          {/* ── ブランド ── */}
          <section>
            <p className="text-[#c9a84c] text-[10px] tracking-widest uppercase mb-3">ブランド</p>
            <ModeToggle
              value={brandMode}
              onChange={setBrandMode}
              options={[{ value: 'select', label: '既存から選択' }, { value: 'new', label: '新規登録' }]}
            />
            <div className="mt-3">
              {brandMode === 'select' ? (
                <SelectField
                  value={selectedBrandId}
                  onChange={setSelectedBrandId}
                  placeholder="ブランドを選択"
                  options={brands.map((b) => ({ value: b.id, label: `${b.name} (${b.origin})` }))}
                />
              ) : (
                <div className="space-y-2">
                  <ModalInput label="ブランド名 *" value={newBrandName}   onChange={setNewBrandName}   placeholder="例: Starbuzz" />
                  <ModalInput label="原産国"       value={newBrandOrigin} onChange={setNewBrandOrigin} placeholder="例: USA" />
                </div>
              )}
            </div>
          </section>

          {/* ── フレーバー ── */}
          <section>
            <p className="text-[#c9a84c] text-[10px] tracking-widest uppercase mb-3">フレーバー</p>
            <ModeToggle
              value={flavorMode}
              onChange={setFlavorMode}
              options={[{ value: 'select', label: '既存から選択' }, { value: 'new', label: '新規登録' }]}
            />
            <div className="mt-3">
              {flavorMode === 'select' ? (
                <div className="relative">
                  <select
                    value={selectedFlavorId}
                    onChange={(e) => setSelectedFlavorId(e.target.value)}
                    className="w-full appearance-none px-3 pr-8 py-2.5 bg-[#0a0a0a] border border-[rgba(201,168,76,0.15)] text-sm outline-none focus:border-[rgba(201,168,76,0.4)] transition-colors"
                    style={{ color: selectedFlavorId ? '#f0ede8' : '#5a5555' }}
                    size={1}
                  >
                    <option value="" style={{ background: '#111', color: '#5a5555' }}>
                      フレーバーを選択（アルファベット順）
                    </option>
                    {sortedFlavors.map((f) => {
                      const brand = brands.find((b) => b.id === f.brandId)
                      return (
                        <option key={f.id} value={f.id} style={{ background: '#111', color: '#f0ede8' }}>
                          {f.name} ({brand?.name ?? ''})
                        </option>
                      )
                    })}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5a5555] pointer-events-none" />
                </div>
              ) : (
                <div className="space-y-2">
                  <ModalInput label="フレーバー名 *" value={flavorName} onChange={setFlavorName} placeholder="例: Tropical Mix" />
                  <div>
                    <p className="text-[#5a5555] text-[10px] tracking-widest uppercase mb-1.5">カテゴリ</p>
                    <SelectField
                      value={flavorCat}
                      onChange={setFlavorCat}
                      options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* アクションボタン */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-[rgba(201,168,76,0.2)] text-[#5a5555] text-sm active:opacity-70"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 text-[#0a0a0a] text-sm font-semibold active:opacity-80"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c97a)' }}
            >
              追加する
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
          className={`flex-1 py-1.5 text-xs border transition-colors ${
            value === opt.value
              ? 'border-[#c9a84c] text-[#c9a84c] bg-[rgba(201,168,76,0.08)]'
              : 'border-[rgba(201,168,76,0.15)] text-[#5a5555]'
          }`}
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
      <p className="text-[#5a5555] text-[10px] tracking-widest uppercase mb-1.5">{label}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[rgba(201,168,76,0.15)] text-[#f0ede8] placeholder-[#3a3535] text-sm outline-none focus:border-[rgba(201,168,76,0.4)] transition-colors"
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
        className="w-full appearance-none px-3 pr-8 py-2.5 bg-[#0a0a0a] border border-[rgba(201,168,76,0.15)] text-sm outline-none focus:border-[rgba(201,168,76,0.4)] transition-colors"
        style={{ color: value ? '#f0ede8' : '#5a5555' }}
      >
        {placeholder && (
          <option value="" style={{ background: '#111', color: '#5a5555' }}>{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: '#111', color: '#f0ede8' }}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5a5555] pointer-events-none" />
    </div>
  )
}
