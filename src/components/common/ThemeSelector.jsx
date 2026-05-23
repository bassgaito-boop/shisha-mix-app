import { useState, useEffect, useRef } from 'react'
import { Palette } from 'lucide-react'
import { useTheme, THEMES } from '../../contexts/ThemeContext'

export default function ThemeSelector() {
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
    <div ref={ref} className="fixed top-3 right-3 z-[100]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: current.accent,
          boxShadow: `0 0 10px ${current.accent}70`,
          border: '2px solid rgba(255,255,255,0.18)',
        }}
      >
        <Palette size={13} color="#000" strokeWidth={2} />
      </button>

      {open && (
        <div
          className="absolute top-9 right-0 py-1.5 flex flex-col min-w-[128px]"
          style={{
            background: 'var(--c-surf-2)',
            border: '1px solid var(--ca-20)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          {THEMES.map((t) => {
            const active = t.id === theme
            return (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false) }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors"
                style={{
                  color: active ? 'var(--c-accent)' : 'var(--c-muted)',
                  background: active ? 'var(--ca-08)' : 'transparent',
                }}
              >
                <span
                  className="shrink-0"
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: t.accent,
                    boxShadow: active ? `0 0 6px ${t.accent}` : 'none',
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
