import { useNavigate } from 'react-router-dom'
import { PlusCircle, BookOpen, Clock } from 'lucide-react'
import { useRecipes } from '../hooks/useRecipes'

export default function Home() {
  const navigate = useNavigate()
  const { recipes } = useRecipes()
  const recent = recipes.slice(0, 3)

  return (
    <div className="px-5 pt-14 pb-4">
      {/* ヘッダー */}
      <div className="mb-10">
        <p className="text-[#c9a84c] tracking-[0.3em] text-[10px] uppercase mb-2">
          Your Personal
        </p>
        <h1
          className="text-3xl text-[#f0ede8] leading-tight"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Shisha Mix<br />
          <span className="text-[#c9a84c]">Recipe Lab</span>
        </h1>
      </div>

      {/* クイックアクション */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => navigate('/recipes/new')}
          className="flex flex-col items-start p-4 rounded-xl border border-[rgba(201,168,76,0.2)] bg-[#111] active:scale-[0.98] transition-all duration-200"
          style={{ boxShadow: 'inset 0 1px 0 rgba(201,168,76,0.08)' }}
        >
          <PlusCircle size={20} className="text-[#c9a84c] mb-3" strokeWidth={1.5} />
          <span className="text-[#f0ede8] text-sm font-medium">New Recipe</span>
          <span className="text-[#5a5555] text-xs mt-0.5">レシピを作成</span>
        </button>

        <button
          onClick={() => navigate('/recipes')}
          className="flex flex-col items-start p-4 rounded-xl border border-[rgba(201,168,76,0.2)] bg-[#111] active:scale-[0.98] transition-all duration-200"
          style={{ boxShadow: 'inset 0 1px 0 rgba(201,168,76,0.08)' }}
        >
          <BookOpen size={20} className="text-[#c9a84c] mb-3" strokeWidth={1.5} />
          <span className="text-[#f0ede8] text-sm font-medium">All Recipes</span>
          <span className="text-[#5a5555] text-xs mt-0.5">{recipes.length} 件保存済み</span>
        </button>
      </div>

      {/* 区切り */}
      <div className="flex items-center gap-3 mb-5">
        <Clock size={13} className="text-[#c9a84c]" />
        <span className="text-[#5a5555] text-xs tracking-widest uppercase">Recent</span>
        <div className="flex-1 h-px bg-[rgba(201,168,76,0.1)]" />
      </div>

      {/* 最近のレシピ */}
      {recent.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#5a5555] text-sm">まだレシピがありません</p>
          <p className="text-[#3a3535] text-xs mt-1">最初のレシピを作成しましょう</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recent.map((recipe) => (
            <RecipeRow key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}

function RecipeRow({ recipe }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate('/recipes')}
      className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#111] border border-[rgba(201,168,76,0.1)] active:scale-[0.98] transition-all duration-200 text-left"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg"
        style={{ background: 'rgba(201,168,76,0.1)' }}
      >
        {recipe.emoji || '🌿'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#f0ede8] text-sm font-medium truncate">{recipe.name}</p>
        <p className="text-[#5a5555] text-xs mt-0.5">
          {recipe.flavors?.length ?? 0} flavors
        </p>
      </div>
      <span className="text-[#3a3535] text-xs shrink-0">
        {new Date(recipe.createdAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
      </span>
    </button>
  )
}
