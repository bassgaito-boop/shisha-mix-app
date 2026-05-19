import { useNavigate, Link } from 'react-router-dom'
import { PlusCircle, BookOpen, ChevronRight, Library } from 'lucide-react'
import { useRecipes } from '../hooks/useStorage'
import { useLang } from '../contexts/LangContext'

export default function Home() {
  const navigate = useNavigate()
  const { recipes } = useRecipes()
  const { lang, t, toggleLang } = useLang()
  const h = t.home

  const menuItems = [
    { label: h.createRecipe, sub: h.createRecipeSub, to: '/recipes/new', Icon: PlusCircle },
    { label: h.recipeList,   sub: h.recipeListSub,   to: '/recipes',     Icon: BookOpen  },
    { label: h.flavorList,   sub: h.flavorListSub,   to: '/flavors',     Icon: Library   },
  ]

  return (
    <div className="relative min-h-[calc(100svh-80px)] flex flex-col items-center justify-center px-6 overflow-hidden">

      {/* 煙グラデーション背景 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 45% at 50% 30%, rgba(201,168,76,0.07) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 40% 30% at 20% 80%, rgba(201,168,76,0.04) 0%, transparent 60%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 30% 25% at 85% 65%, rgba(201,168,76,0.03) 0%, transparent 60%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">

        {/* アプリ名 */}
        <h1 className="text-5xl font-bold tracking-[0.25em] text-[#c9a84c] mb-2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          SHISHA MIX
        </h1>
        <p className="text-[#6a6060] text-xs tracking-[0.2em] uppercase mb-8">{h.subtitle}</p>
        <div className="w-24 h-px mb-10" style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />

        {/* メニューカード */}
        <div className="w-full space-y-3 mb-10">
          {menuItems.map(({ label, sub, to, Icon }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all duration-200 active:scale-[0.98]"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,168,76,0.25)' }}
              onMouseDown={(e) => { e.currentTarget.style.boxShadow = '0 0 24px rgba(201,168,76,0.25), inset 0 0 12px rgba(201,168,76,0.04)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.55)' }}
              onMouseUp={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)' }}
              onTouchStart={(e) => { e.currentTarget.style.boxShadow = '0 0 24px rgba(201,168,76,0.25), inset 0 0 12px rgba(201,168,76,0.04)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.55)' }}
              onTouchEnd={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)' }}
            >
              <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
                <Icon size={18} className="text-[#c9a84c]" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#f0ede8] text-sm font-semibold tracking-widest uppercase">{label}</p>
                <p className="text-[#5a5555] text-xs mt-0.5 tracking-wide">{sub}</p>
              </div>
              <ChevronRight size={16} className="text-[#c9a84c] opacity-50 shrink-0" />
            </button>
          ))}
        </div>

        {/* 統計 */}
        <div className="flex items-center gap-6">
          <Stat value={recipes.length} label={h.stat} />
        </div>

        {/* リーガルリンク + 言語切り替え */}
        <div className="mt-6 flex items-center gap-3">
          <Link to="/legal" className="text-[#3a3535] text-[11px] tracking-wide underline underline-offset-2 active:opacity-60">
            {h.legal}
          </Link>
          <span className="text-[#3a3535] text-[11px]">·</span>
          <button
            onClick={toggleLang}
            className="text-[#c9a84c] text-[11px] tracking-widest font-medium active:opacity-60 transition-opacity"
          >
            {lang === 'ja' ? 'EN' : 'JP'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[#c9a84c] text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{value}</span>
      <span className="text-[#3a3535] text-[10px] tracking-widest uppercase">{label}</span>
    </div>
  )
}
