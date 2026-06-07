import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PlusCircle, BookOpen, ChevronRight, Library } from 'lucide-react'
import { useRecipes, useFlavors } from '../hooks/useStorage'
import { useLang } from '../contexts/LangContext'

export default function Home() {
  const navigate = useNavigate()
  const { recipes } = useRecipes()
  const { flavors, brands } = useFlavors()
  const { lang, t, toggleLang } = useLang()
  const h = t.home

  const [tipSeen, setTipSeen] = useState(() => !!localStorage.getItem('onboarding_seen'))
  const dismissTip = () => {
    localStorage.setItem('onboarding_seen', '1')
    setTipSeen(true)
  }

  const menuItems = useMemo(() => [
    { label: h.createRecipe, sub: h.createRecipeSub, to: '/recipes/new', Icon: PlusCircle },
    { label: h.recipeList,   sub: h.recipeListSub,   to: '/recipes',     Icon: BookOpen  },
    { label: h.flavorList,   sub: h.flavorListSub,   to: '/flavors',     Icon: Library   },
  ], [h])

  return (
    <div className="relative min-h-[calc(100svh-80px)] flex flex-col items-center justify-center px-6 overflow-hidden">

      {/* 煙グラデーション背景 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 45% at 50% 30%, var(--ca-07) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 40% 30% at 20% 80%, var(--ca-04) 0%, transparent 60%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 30% 25% at 85% 65%, var(--ca-03) 0%, transparent 60%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">

        {/* アプリ名 */}
        <h1
          className="text-5xl font-bold tracking-[0.12em] whitespace-nowrap mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--c-accent)' }}
        >
          SHISHA MIX
        </h1>
        <p className="text-[10px] tracking-[0.2em] uppercase mb-8" style={{ color: 'var(--c-dim)' }}>{h.subtitle}</p>
        <div className="w-24 h-px mb-10" style={{ background: 'linear-gradient(90deg, transparent, var(--c-accent), transparent)' }} />

        {/* メニューカード */}
        <div className="w-full space-y-3 mb-10">
          {menuItems.map(({ label, sub, to, Icon }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all duration-200 active:scale-[0.98]"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--ca-25)',
                borderRadius: 'var(--radius)',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.boxShadow = '0 0 24px var(--ca-25), inset 0 0 12px var(--ca-04)'
                e.currentTarget.style.borderColor = 'var(--ca-55)'
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.boxShadow = ''
                e.currentTarget.style.borderColor = 'var(--ca-25)'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.boxShadow = '0 0 24px var(--ca-25), inset 0 0 12px var(--ca-04)'
                e.currentTarget.style.borderColor = 'var(--ca-55)'
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.boxShadow = ''
                e.currentTarget.style.borderColor = 'var(--ca-25)'
              }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center shrink-0"
                style={{
                  background: 'var(--ca-08)',
                  border: '1px solid var(--ca-20)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <Icon size={18} style={{ color: 'var(--c-accent)' }} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold tracking-widest uppercase" style={{ color: 'var(--c-text)' }}>{label}</p>
                <p className="text-xs mt-0.5 tracking-wide" style={{ color: 'var(--c-muted)' }}>{sub}</p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--c-accent)', opacity: 0.5 }} className="shrink-0" />
            </button>
          ))}
        </div>

        {/* 統計 */}
        <div className="flex items-center gap-6">
          <Stat value={recipes.length} label={h.stat} />
          <div className="w-px h-6" style={{ background: 'var(--ca-20)' }} />
          <Stat value={flavors.length} label={h.statFlavors} />
          <div className="w-px h-6" style={{ background: 'var(--ca-20)' }} />
          <Stat value={brands.length} label={h.statBrands} />
        </div>

        {/* 初回オンボーディングヒント */}
        {!tipSeen && (
          <div
            className="w-full mt-6 p-4"
            style={{
              border: '1px solid var(--ca-15)',
              background: 'var(--ca-04)',
              borderRadius: 'var(--radius)',
            }}
          >
            <div className="space-y-2.5 mb-3">
              {h.onboarding.tips.map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <span className="text-sm shrink-0">{icon}</span>
                  <p className="text-[11px] leading-snug" style={{ color: 'var(--c-muted)' }}>{text}</p>
                </div>
              ))}
            </div>
            <button
              onClick={dismissTip}
              className="w-full py-1.5 text-[11px] font-semibold tracking-widest transition-opacity active:opacity-60"
              style={{ border: '1px solid var(--ca-20)', color: 'var(--c-dim)' }}
            >
              {h.onboarding.dismiss}
            </button>
          </div>
        )}

        {/* リーガルリンク + 言語切り替え */}
        <div className="mt-6 flex items-center justify-between w-full">
          <Link
            to="/legal"
            className="text-[11px] tracking-wide underline underline-offset-2 active:opacity-60"
            style={{ color: 'var(--c-dim)' }}
          >
            {h.legal}
          </Link>
          <button
            onClick={toggleLang}
            className="px-3 py-1.5 text-xs font-semibold tracking-widest active:opacity-60 transition-opacity flex items-center gap-1"
            style={{ border: '1px solid var(--ca-40)' }}
          >
            <span style={{ color: lang === 'ja' ? 'var(--c-accent)' : 'var(--c-muted)' }}>JP</span>
            <span style={{ color: 'var(--c-dim)' }}>/</span>
            <span style={{ color: lang === 'en' ? 'var(--c-accent)' : 'var(--c-muted)' }}>EN</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl font-light" style={{ fontFamily: 'var(--font-display)', color: 'var(--c-accent)' }}>{value}</span>
      <span className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--c-dim)' }}>{label}</span>
    </div>
  )
}
