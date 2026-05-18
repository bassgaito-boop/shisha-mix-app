import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Trash2, PlusCircle, FlaskConical } from 'lucide-react'
import { useRecipes, useFlavors } from '../hooks/useStorage'

export default function RecipeList() {
  const { recipes, deleteRecipe } = useRecipes()
  const { getFlavor } = useFlavors()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const filtered = recipes.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="px-5 pt-14 pb-4">
      <div className="mb-6">
        <p className="text-[#c9a84c] tracking-[0.3em] text-[10px] uppercase mb-1">Collection</p>
        <h2
          className="text-2xl text-[#f0ede8]"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          My Recipes
        </h2>
      </div>

      {/* 検索 */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a5555]" />
        <input
          type="text"
          placeholder="Search recipes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-[#111] border border-[rgba(201,168,76,0.15)] text-[#f0ede8] placeholder-[#3a3535] text-sm outline-none focus:border-[rgba(201,168,76,0.4)] transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#5a5555] text-sm mb-6">
            {query ? '該当するレシピが見つかりません' : 'レシピがまだありません'}
          </p>
          {!query && (
            <button
              onClick={() => navigate('/recipes/new')}
              className="inline-flex items-center gap-2 px-6 py-3 text-[#0a0a0a] text-sm font-semibold tracking-wide"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c97a)' }}
            >
              <PlusCircle size={16} />
              最初のレシピを作成
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
              onDelete={deleteRecipe}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function RecipeCard({ recipe, getFlavor, onDelete }) {
  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirm(`「${recipe.name}」を削除しますか？`)) {
      onDelete(recipe.id)
    }
  }

  const totalGrams = recipe.totalGrams ?? recipe.flavors?.reduce((s, f) => s + (f.grams || 0), 0) ?? 0

  return (
    <div className="p-4 bg-[#111] border border-[rgba(201,168,76,0.1)]">

      {/* ヘッダー */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-9 h-9 flex items-center justify-center shrink-0"
          style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)' }}
        >
          <FlaskConical size={16} className="text-[#c9a84c]" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[#f0ede8] font-medium text-sm truncate">{recipe.name}</h3>
          <p className="text-[#5a5555] text-xs mt-0.5">
            {totalGrams > 0 && <span>{totalGrams}g · </span>}
            {new Date(recipe.createdAt).toLocaleDateString('ja-JP')}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="p-1.5 text-[#3a3535] hover:text-red-500 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* フレーバーバー */}
      {recipe.flavors && recipe.flavors.length > 0 && (
        <div className="space-y-1.5">
          {recipe.flavors.map((item, i) => {
            const flavorData = getFlavor(item.flavorId)
            const pct = totalGrams > 0 ? Math.round((item.grams / totalGrams) * 100) : 0
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[#9a9090] text-xs w-24 truncate shrink-0">
                  {flavorData?.nameJa ?? '不明'}
                </span>
                <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, #8a6f2e, #c9a84c)',
                    }}
                  />
                </div>
                <span className="text-[#5a5555] text-xs w-10 text-right shrink-0">
                  {item.grams}g
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* テイスティングノート */}
      {(recipe.tastingNote || recipe.memo) && (
        <p className="mt-3 text-[#5a5555] text-xs leading-relaxed border-t border-[rgba(201,168,76,0.08)] pt-3">
          {recipe.tastingNote || recipe.memo}
        </p>
      )}
    </div>
  )
}
