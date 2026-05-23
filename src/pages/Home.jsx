import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PlusCircle, BookOpen, ChevronRight, Library } from 'lucide-react'
import { useRecipes } from '../hooks/useStorage'
import { useLang } from '../contexts/LangContext'
import { useTheme, THEMES } from '../contexts/ThemeContext'

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
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 45% at 50% 30%, var(--ca-07) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 40% 30% at 20% 80%, var(--ca-04) 0%, transparent 60%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 30% 25% at 85% 65%, var(--ca-03) 0%, transparent 60%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">

        {/* アプリ名 */}
        <h1
          className="text-5xl font-bold tracking-[0.25em] mb-2"
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
        </div>

        {/* リーガルリンク + テーマ切り替え + 言語切り替え */}
        <div className="mt-6 flex items-center justify-between w-full">
          <Link
            to="/legal"
            className="text-[11px] tracking-wide underline underline-offset-2 active:opacity-60"
            style={{ color: 'var(--c-dim)' }}
          >
            {h.legal}
          </Link>
          <div className="flex items-center gap-2">
            <ThemeButton />
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
    </div>
  )
}

function ThemeButton() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0]

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-1.5 text-xs font-semibold tracking-widest active:opacity-60 transition-opacity"
        style={{ border: '1px solid var(--ca-40)', color: 'var(--c-accent)' }}
      >
        Theme
      </button>

      {open && (
        <div
          className="absolute bottom-full right-0 mb-2 py-1 flex flex-col z-50"
          style={{
            background: 'var(--c-surf-2)',
            border: '1px solid var(--ca-20)',
            borderRadius: 8,
            minWidth: 120,
            boxShadow: '0 -4px 16px rgba(0,0,0,0.5)',
          }}
        >
          {THEMES.map((t) => {
            const active = t.id === theme
            return (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false) }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-left"
                style={{
                  color: active ? 'var(--c-accent)' : 'var(--c-muted)',
                  background: active ? 'var(--ca-08)' : 'transparent',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: t.accent,
                    boxShadow: active ? `0 0 6px ${t.accent}` : 'none',
                    flexShrink: 0,
                  }}
                />
                {t.label}
              </button>
            )
          })}
        </div>
      )}
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
