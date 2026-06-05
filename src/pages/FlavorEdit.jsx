import { useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { ChevronLeft, Plus } from 'lucide-react'
import { useFlavors, useTags, useRecipes } from '../hooks/useStorage'
import { getTags } from '../constants/categories'
import { useLang } from '../contexts/LangContext'

export default function FlavorEdit() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { flavors, brands, updateFlavor, deleteFlavor, deleteBrand } = useFlavors()
  const { tags: globalTags, addTag: addGlobalTag } = useTags()
  const { t } = useLang()
  const fe = t.flavorEdit

  const { recipes } = useRecipes()
  const flavor = flavors.find((f) => f.id === id) ?? null
  const brand  = brands.find((b) => b.id === flavor?.brandId) ?? null
  const usedRecipes = recipes.filter((r) => r.flavors?.some((f) => f.flavorId === id))

  const [name, setName]               = useState(flavor?.name ?? '')
  const [selectedTags, setSelectedTags] = useState(() => getTags(flavor ?? {}))
  const [note, setNote]               = useState(flavor?.note ?? '')
  const [newTagInput, setNewTagInput] = useState('')
  const [deleteOpen, setDeleteOpen]   = useState(false)

  if (!flavor) return <Navigate to="/flavors" replace />

  const toggleTag = (tag) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )

  const handleAddNewTag = () => {
    const tag = newTagInput.trim()
    if (!tag) return
    addGlobalTag(tag)
    setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]))
    setNewTagInput('')
  }

  const handleSave = () => {
    updateFlavor(id, {
      ...(flavor.isCustom && name.trim() ? { name: name.trim(), nameJa: name.trim() } : {}),
      tags: selectedTags,
      note: note.trim(),
    })
    navigate('/flavors')
  }

  const handleDelete = () => {
    deleteFlavor(id)
    const remaining = flavors.filter((f) => f.brandId === flavor.brandId && f.id !== flavor.id)
    if (remaining.length === 0) {
      deleteBrand(flavor.brandId)
    }
    navigate('/flavors')
  }

  return (
    <div className="px-5 pt-14 pb-10">

      {/* ヘッダー */}
      <div className="mb-7">
        <button
          onClick={() => navigate('/flavors')}
          className="flex items-center gap-1 text-sm mb-4 active:opacity-70 transition-opacity"
          style={{ color: 'var(--c-accent)' }}
        >
          <ChevronLeft size={16} />
          {fe.back}
        </button>
        <p className="tracking-[0.3em] text-[10px] uppercase mb-1" style={{ color: 'var(--c-accent)' }}>{fe.label}</p>
        <h2
          className="text-2xl"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}
        >
          {fe.title}
        </h2>
      </div>

      {/* ブランド情報 */}
      <div
        className="mb-5 px-4 py-3"
        style={{
          background: 'var(--c-surf)',
          border: '1px solid var(--ca-10)',
          borderRadius: 'var(--radius)',
        }}
      >
        <p className="text-[10px] tracking-widest uppercase mb-0.5" style={{ color: 'var(--c-muted)' }}>{fe.brand}</p>
        <p className="text-sm" style={{ color: 'var(--c-text)' }}>{brand?.name ?? '—'}</p>
        {brand?.origin && <p className="text-xs mt-0.5" style={{ color: 'var(--c-muted)' }}>{brand.origin}</p>}
      </div>

      {/* フレーバー名 */}
      <div className="mb-6">
        <label className="block text-[10px] tracking-widest uppercase mb-2" style={{ color: 'var(--c-muted)' }}>
          {fe.flavorName}
        </label>
        {flavor.isCustom ? (
          <input
            type="text"
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
        ) : (
          <p
            className="px-4 py-3 text-sm"
            style={{
              background: 'var(--c-surf)',
              border: '1px solid var(--ca-08)',
              color: 'var(--c-text)',
              borderRadius: 'var(--radius)',
            }}
          >
            {flavor.name}
          </p>
        )}
      </div>

      {/* タグ */}
      <div className="mb-6">
        <label className="block text-[10px] tracking-widest uppercase mb-3" style={{ color: 'var(--c-muted)' }}>
          {fe.tags}
        </label>

        {/* 既存タグ一覧 */}
        <div className="flex flex-wrap gap-2 mb-3">
          {globalTags.map((tag) => {
            const active = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="px-3 py-1.5 text-xs border transition-colors active:opacity-70"
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

        {/* 新規タグ追加 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNewTag()}
            placeholder={fe.newTagPlaceholder}
            className="flex-1 px-3 py-2 text-xs outline-none transition-colors"
            style={{
              background: 'var(--c-surf)',
              border: '1px solid var(--ca-15)',
              color: 'var(--c-text)',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--ca-40)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--ca-15)' }}
          />
          <button
            onClick={handleAddNewTag}
            className="px-3 py-2 border active:opacity-70 transition-opacity"
            style={{
              border: '1px solid var(--ca-25)',
              color: 'var(--c-accent)',
            }}
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* 選択中タグ (新規タグ含む) */}
        {selectedTags.filter((t) => !globalTags.includes(t)).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selectedTags
              .filter((t) => !globalTags.includes(t))
              .map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="px-3 py-1.5 text-xs border transition-colors active:opacity-70"
                  style={{
                    background: 'var(--ca-15)',
                    borderColor: 'var(--c-accent)',
                    color: 'var(--c-accent)',
                  }}
                >
                  {tag}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* メモ・感想 */}
      <div className="mb-8">
        <label className="block text-[10px] tracking-widest uppercase mb-2" style={{ color: 'var(--c-muted)' }}>
          {fe.notes}
        </label>
        <textarea
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={fe.notesPlaceholder}
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

      {/* 使用中レシピ */}
      <div className="mb-8">
        <label className="block text-[10px] tracking-widest uppercase mb-2" style={{ color: 'var(--c-muted)' }}>
          {fe.usedIn}
        </label>
        {usedRecipes.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--c-dim)' }}>{fe.usedInNone}</p>
        ) : (
          <div className="space-y-1.5">
            {usedRecipes.map((r) => (
              <div
                key={r.id}
                className="px-3 py-2 text-xs"
                style={{
                  background: 'var(--c-surf)',
                  border: '1px solid var(--ca-08)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--c-text)',
                }}
              >
                {r.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        className="w-full py-4 font-semibold text-sm tracking-widest uppercase active:scale-[0.98] transition-all mb-3"
        style={{
          background: 'var(--ca-grad)',
          color: 'var(--c-btn-fg)',
          boxShadow: '0 0 20px var(--ca-20)',
        }}
      >
        {fe.save}
      </button>

      {/* 削除ボタン */}
      <button
        onClick={() => setDeleteOpen(true)}
        className="w-full py-3 border text-sm active:opacity-70 transition-opacity"
        style={{ borderColor: 'var(--c-danger-fg)', color: 'var(--c-danger-fg)', opacity: 0.6 }}
      >
        {fe.deleteBtn}
      </button>

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
              {fe.deleteTitle}
            </h3>
            <p className="text-xs mb-5 leading-relaxed" style={{ color: 'var(--c-muted)' }}>
              {fe.deleteConfirm(flavor.name)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteOpen(false)}
                className="flex-1 py-2.5 text-sm active:opacity-70"
                style={{ border: '1px solid var(--ca-20)', color: 'var(--c-muted)' }}
              >
                {fe.deleteCancelBtn}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 text-sm font-semibold active:opacity-80"
                style={{ background: 'var(--c-danger-bg)', color: 'var(--c-danger-fg)' }}
              >
                {fe.deleteOkBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
