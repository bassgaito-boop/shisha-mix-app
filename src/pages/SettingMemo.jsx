import { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const DEFAULT_MEMO = {
  heatManagement: '',
  coalType: '',
  bowlType: '',
  packingMethod: '',
  sessionNotes: '',
}

export default function SettingMemo() {
  const [saved, setSaved] = useLocalStorage('shisha_setting_memo', DEFAULT_MEMO)
  const [form, setForm] = useState(saved)
  const [flash, setFlash] = useState(false)

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSave = () => {
    setSaved(form)
    setFlash(true)
    setTimeout(() => setFlash(false), 1500)
  }

  const handleReset = () => {
    if (confirm('セッティングメモをリセットしますか？')) {
      setForm(DEFAULT_MEMO)
      setSaved(DEFAULT_MEMO)
    }
  }

  return (
    <div className="px-5 pt-14 pb-4">
      <div className="mb-8">
        <p className="text-[#c9a84c] tracking-[0.3em] text-[10px] uppercase mb-1">Personal</p>
        <h2
          className="text-2xl text-[#f0ede8]"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Setting Memo
        </h2>
        <p className="text-[#5a5555] text-xs mt-1">自分好みのセッティングを記録</p>
      </div>

      <div className="space-y-5">
        <MemoField
          label="Heat Management"
          sublabel="熱管理"
          placeholder="例: HMD使用、中火スタート→強火維持"
          value={form.heatManagement}
          onChange={(v) => update('heatManagement', v)}
          multiline
        />
        <MemoField
          label="Coal Type"
          sublabel="炭の種類"
          placeholder="例: ナチュラルコール 25mm角"
          value={form.coalType}
          onChange={(v) => update('coalType', v)}
        />
        <MemoField
          label="Bowl Type"
          sublabel="ボウルの種類"
          placeholder="例: ファネルボウル、フリークスボウル"
          value={form.bowlType}
          onChange={(v) => update('bowlType', v)}
        />
        <MemoField
          label="Packing Method"
          sublabel="パッキング方法"
          placeholder="例: フラフルーパック、ふんわり盛り"
          value={form.packingMethod}
          onChange={(v) => update('packingMethod', v)}
        />
        <MemoField
          label="Session Notes"
          sublabel="セッションメモ"
          placeholder="気づいたこと、改善点など..."
          value={form.sessionNotes}
          onChange={(v) => update('sessionNotes', v)}
          multiline
          rows={4}
        />
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={handleSave}
          className="flex-1 py-4 flex items-center justify-center gap-2 text-[#0a0a0a] font-semibold text-sm tracking-widest uppercase active:scale-[0.98] transition-all duration-200"
          style={{
            background: flash
              ? 'linear-gradient(135deg, #6dbf6d, #8de08d)'
              : 'linear-gradient(135deg, #c9a84c, #e8c97a)',
            boxShadow: flash
              ? '0 0 24px rgba(109,191,109,0.25)'
              : '0 0 24px rgba(201,168,76,0.25)',
            transition: 'background 0.3s, box-shadow 0.3s',
          }}
        >
          <Save size={16} />
          {flash ? 'Saved!' : 'Save'}
        </button>
        <button
          onClick={handleReset}
          className="px-5 py-4 flex items-center justify-center text-[#5a5555] border border-[rgba(201,168,76,0.15)] rounded-none active:scale-[0.98] transition-all"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  )
}

function MemoField({ label, sublabel, placeholder, value, onChange, multiline, rows = 2 }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <label className="text-[#9a9090] text-xs tracking-widest uppercase">{label}</label>
        <span className="text-[#3a3535] text-xs">{sublabel}</span>
      </div>
      {multiline ? (
        <textarea
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[#111] border border-[rgba(201,168,76,0.15)] text-[#f0ede8] placeholder-[#3a3535] text-sm outline-none focus:border-[rgba(201,168,76,0.4)] transition-colors resize-none"
        />
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[#111] border border-[rgba(201,168,76,0.15)] text-[#f0ede8] placeholder-[#3a3535] text-sm outline-none focus:border-[rgba(201,168,76,0.4)] transition-colors"
        />
      )}
    </div>
  )
}
