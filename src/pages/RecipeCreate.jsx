import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Minus, Check, X } from 'lucide-react'
import { useRecipes } from '../hooks/useRecipes'

const EMOJIS = ['🌿', '🍑', '🫐', '🍋', '🍇', '🍓', '🌸', '🍃', '☁️', '🔥', '💎', '🌊']

const DEFAULT_FLAVOR = { name: '', ratio: 30 }

export default function RecipeCreate() {
  const navigate = useNavigate()
  const { addRecipe } = useRecipes()

  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🌿')
  const [flavors, setFlavors] = useState([{ ...DEFAULT_FLAVOR }])
  const [memo, setMemo] = useState('')

  const addFlavor = () => setFlavors((f) => [...f, { ...DEFAULT_FLAVOR }])
  const removeFlavor = (i) => setFlavors((f) => f.filter((_, idx) => idx !== i))

  const updateFlavor = (i, field, value) => {
    setFlavors((f) => f.map((fl, idx) => (idx === i ? { ...fl, [field]: value } : fl)))
  }

  const totalRatio = flavors.reduce((s, f) => s + (Number(f.ratio) || 0), 0)

  const handleSave = () => {
    if (!name.trim()) return alert('レシピ名を入力してください')
    if (flavors.some((f) => !f.name.trim())) return alert('フレーバー名を入力してください')
    addRecipe({ name: name.trim(), emoji, flavors, memo: memo.trim() })
    navigate('/recipes')
  }

  return (
    <div className="px-5 pt-14 pb-4">
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

      {/* 絵文字選択 */}
      <div className="mb-5">
        <label className="block text-[#5a5555] text-xs tracking-widest uppercase mb-3">
          Icon
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                emoji === e
                  ? 'bg-[rgba(201,168,76,0.2)] border border-[#c9a84c]'
                  : 'bg-[#111] border border-[rgba(201,168,76,0.1)]'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
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
          className="w-full px-4 py-3 rounded-xl bg-[#111] border border-[rgba(201,168,76,0.15)] text-[#f0ede8] placeholder-[#3a3535] text-sm outline-none focus:border-[rgba(201,168,76,0.4)] transition-colors"
        />
      </div>

      {/* フレーバー */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[#5a5555] text-xs tracking-widest uppercase">
            Flavors
          </label>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono ${
                totalRatio === 100 ? 'text-[#c9a84c]' : 'text-[#5a5555]'
              }`}
            >
              {totalRatio}%
            </span>
            {totalRatio === 100 && <Check size={12} className="text-[#c9a84c]" />}
          </div>
        </div>

        <div className="space-y-3">
          {flavors.map((flavor, i) => (
            <FlavorRow
              key={i}
              flavor={flavor}
              canRemove={flavors.length > 1}
              onUpdate={(field, value) => updateFlavor(i, field, value)}
              onRemove={() => removeFlavor(i)}
            />
          ))}
        </div>

        <button
          onClick={addFlavor}
          className="mt-3 w-full py-3 rounded-xl border border-dashed border-[rgba(201,168,76,0.2)] text-[#5a5555] text-xs tracking-widest uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <Plus size={14} />
          Add Flavor
        </button>
      </div>

      {/* メモ */}
      <div className="mb-8">
        <label className="block text-[#5a5555] text-xs tracking-widest uppercase mb-2">
          Memo
        </label>
        <textarea
          rows={3}
          placeholder="感想、温度設定、コツなど..."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[#111] border border-[rgba(201,168,76,0.15)] text-[#f0ede8] placeholder-[#3a3535] text-sm outline-none focus:border-[rgba(201,168,76,0.4)] transition-colors resize-none"
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
    </div>
  )
}

function FlavorRow({ flavor, canRemove, onUpdate, onRemove }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Flavor name"
        value={flavor.name}
        onChange={(e) => onUpdate('name', e.target.value)}
        className="flex-1 px-3 py-2.5 rounded-lg bg-[#111] border border-[rgba(201,168,76,0.15)] text-[#f0ede8] placeholder-[#3a3535] text-sm outline-none focus:border-[rgba(201,168,76,0.4)] transition-colors min-w-0"
      />
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onUpdate('ratio', Math.max(5, (Number(flavor.ratio) || 0) - 5))}
          className="w-7 h-7 flex items-center justify-center text-[#5a5555] bg-[#111] border border-[rgba(201,168,76,0.1)] rounded"
        >
          <Minus size={12} />
        </button>
        <span className="text-[#f0ede8] text-sm font-mono w-9 text-center">
          {flavor.ratio}%
        </span>
        <button
          onClick={() => onUpdate('ratio', Math.min(100, (Number(flavor.ratio) || 0) + 5))}
          className="w-7 h-7 flex items-center justify-center text-[#5a5555] bg-[#111] border border-[rgba(201,168,76,0.1)] rounded"
        >
          <Plus size={12} />
        </button>
      </div>
      {canRemove && (
        <button onClick={onRemove} className="text-[#3a3535] p-1">
          <X size={16} />
        </button>
      )}
    </div>
  )
}
