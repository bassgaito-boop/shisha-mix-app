import { useState } from 'react'
import { Plus, X, Pencil, Trash2 } from 'lucide-react'
import { useSettings, useRecipes } from '../hooks/useStorage'
import { useLang } from '../contexts/LangContext'
import { useToast, Toast } from '../components/common/Toast'

export default function SettingManage() {
  const { settings, addSetting, updateSetting, deleteSetting } = useSettings()
  const { recipes } = useRecipes()
  const { t } = useLang()
  const s = t.setting
  const { message: toastMsg, showToast } = useToast()

  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleSave = (data) => {
    if (!data.name.trim()) { showToast(s.alertName); return }
    if (editTarget === 'new') {
      addSetting(data)
    } else {
      updateSetting(editTarget.id, data)
    }
    setEditTarget(null)
  }

  const usedCount = (id) => recipes.filter((r) => r.settingId === id).length

  return (
    <div className="px-5 pt-14 pb-10">

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="tracking-[0.3em] text-[10px] uppercase mb-1" style={{ color: 'var(--c-accent)' }}>{s.label}</p>
          <h2 className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text)' }}>
            {s.title}
          </h2>
        </div>
        <button
          onClick={() => setEditTarget('new')}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-widest uppercase active:opacity-80"
          style={{ background: 'var(--ca-grad)', color: 'var(--c-btn-fg)' }}
        >
          <Plus size={13} strokeWidth={2.5} />
          {s.addBtn}
        </button>
      </div>

      {settings.length === 0 ? (
        <p className="text-center text-sm py-16" style={{ color: 'var(--c-dim)' }}>{s.empty}</p>
      ) : (
        <div className="space-y-3">
          {settings.map((setting) => (
            <SettingCard
              key={setting.id}
              setting={setting}
              usedCount={usedCount(setting.id)}
              onEdit={() => setEditTarget(setting)}
              onDelete={() => setDeleteTarget(setting)}
              s={s}
            />
          ))}
        </div>
      )}

      {editTarget !== null && (
        <SettingModal
          initial={editTarget === 'new' ? null : editTarget}
          onSave={handleSave}
          onClose={() => setEditTarget(null)}
          s={s}
        />
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          onClick={() => setDeleteTarget(null)}
        >
          <div className="absolute inset-0 bg-black/70" />
          <div
            className="relative w-full max-w-[320px] p-5"
            style={{ background: 'var(--c-surf)', border: '1px solid var(--ca-20)', borderRadius: 'var(--radius)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--c-text)' }}>{s.deleteTitle}</h3>
            <p className="text-xs mb-5 leading-relaxed" style={{ color: 'var(--c-muted)' }}>
              {s.deleteConfirm(deleteTarget.name)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 text-sm active:opacity-70"
                style={{ border: '1px solid var(--ca-20)', color: 'var(--c-muted)' }}
              >
                {s.deleteCancelBtn}
              </button>
              <button
                onClick={() => { deleteSetting(deleteTarget.id); setDeleteTarget(null) }}
                className="flex-1 py-2.5 text-sm font-semibold active:opacity-80"
                style={{ background: 'var(--c-danger-bg)', color: 'var(--c-danger-fg)' }}
              >
                {s.deleteOkBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toastMsg} />
    </div>
  )
}

function SettingCard({ setting, usedCount, onEdit, onDelete, s }) {
  return (
    <div
      className="p-4"
      style={{
        background: 'var(--c-surf)',
        border: '1px solid var(--ca-10)',
        borderRadius: 'var(--radius)',
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{setting.name}</h3>
          {usedCount > 0 && (
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--c-accent)' }}>
              {s.usedInRecipe(usedCount)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEdit} className="p-1.5" style={{ color: 'var(--c-muted)' }}>
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 active:text-red-500 transition-colors" style={{ color: 'var(--c-dim)' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {setting.bowlType    && <Detail label={s.bowlLabel}          value={setting.bowlType} />}
        {setting.stemType    && <Detail label={s.stemLabel}          value={setting.stemType} />}
        {setting.charcoalType && <Detail label={s.charcoalLabel}     value={setting.charcoalType} />}
        {setting.charcoalCount > 0 && (
          <Detail label={s.charcoalCountLabel} value={`${setting.charcoalCount}${s.pieces}`} />
        )}
      </div>
      {setting.note && (
        <p className="mt-2.5 text-xs leading-relaxed" style={{ color: 'var(--c-muted)' }}>{setting.note}</p>
      )}
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[9px] tracking-widest uppercase" style={{ color: 'var(--c-dim)' }}>{label}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--c-sub)' }}>{value}</p>
    </div>
  )
}

function SettingModal({ initial, onSave, onClose, s }) {
  const [name,          setName]          = useState(initial?.name          ?? '')
  const [bowlType,      setBowlType]      = useState(initial?.bowlType      ?? '')
  const [stemType,      setStemType]      = useState(initial?.stemType      ?? '')
  const [charcoalType,  setCharcoalType]  = useState(initial?.charcoalType  ?? '')
  const [charcoalCount, setCharcoalCount] = useState(initial?.charcoalCount ?? 0)
  const [note,          setNote]          = useState(initial?.note          ?? '')

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-y-auto"
        style={{
          background: 'var(--c-surf-2)',
          border: '1px solid var(--ca-20)',
          borderRadius: 16,
          maxHeight: '85vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--ca-10)' }}
        >
          <h3 className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>
            {initial ? s.editTitle : s.createTitle}
          </h3>
          <button onClick={onClose} style={{ color: 'var(--c-muted)' }}><X size={18} /></button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <ModalField label={s.nameLabel}         value={name}         onChange={setName}         placeholder={s.namePlaceholder}      required />
          <ModalField label={s.bowlLabel}         value={bowlType}     onChange={setBowlType}     placeholder={s.bowlPlaceholder} />
          <ModalField label={s.stemLabel}         value={stemType}     onChange={setStemType}     placeholder={s.stemPlaceholder} />
          <ModalField label={s.charcoalLabel}     value={charcoalType} onChange={setCharcoalType} placeholder={s.charcoalPlaceholder} />

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: 'var(--c-muted)' }}>
              {s.charcoalCountLabel}
            </p>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={charcoalCount}
              onChange={(e) => setCharcoalCount(Math.max(0, parseInt(e.target.value) || 0))}
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

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: 'var(--c-muted)' }}>
              {s.noteLabel}
            </p>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={s.notePlaceholder}
              className="w-full px-3 py-2.5 text-sm outline-none resize-none transition-colors"
              style={{
                background: 'var(--c-surf-3)',
                border: '1px solid var(--ca-15)',
                color: 'var(--c-text)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--ca-40)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--ca-15)' }}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm active:opacity-70"
              style={{ border: '1px solid var(--ca-20)', color: 'var(--c-muted)' }}
            >
              {s.cancelBtn}
            </button>
            <button
              onClick={() => onSave({ name, bowlType, stemType, charcoalType, charcoalCount, note })}
              className="flex-1 py-2.5 text-sm font-semibold active:opacity-80"
              style={{ background: 'var(--ca-grad)', color: 'var(--c-btn-fg)' }}
            >
              {s.saveBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModalField({ label, value, onChange, placeholder }) {
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
