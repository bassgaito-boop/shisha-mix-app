import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../contexts/LangContext'

const currentYear = new Date().getFullYear()
const years  = Array.from({ length: 100 }, (_, i) => currentYear - i)
const months = Array.from({ length: 12 },  (_, i) => i + 1)
const days   = Array.from({ length: 31 },  (_, i) => i + 1)

function calcAge(year, month, day) {
  const today = new Date()
  const birth = new Date(year, month - 1, day)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export default function AgeGate({ onVerify }) {
  const navigate = useNavigate()
  const { t } = useLang()
  const a = t.ageGate

  const [year,  setYear]  = useState('')
  const [month, setMonth] = useState('')
  const [day,   setDay]   = useState('')
  const [denied, setDenied] = useState(false)

  const handleConfirm = () => {
    if (!year || !month || !day) return
    calcAge(year, month, day) >= 20 ? onVerify() : setDenied(true)
  }

  const ready = year && month && day

  if (denied) {
    return (
      <main className="min-h-svh flex flex-col items-center justify-center px-8" style={{ background: 'var(--c-bg)' }}>
        <p className="text-sm tracking-wide text-center leading-relaxed" style={{ color: 'var(--c-sub)' }}>{a.denied}</p>
        <p className="text-xs mt-3 text-center" style={{ color: 'var(--c-muted)' }}>{a.deniedSub}</p>
      </main>
    )
  }

  return (
    <main
      className="min-h-svh flex flex-col items-center justify-center px-8 relative overflow-hidden"
      style={{ background: 'var(--c-bg)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 60%, var(--ca-06) 0%, transparent 70%)' }}
      />
      <div className="relative z-10 text-center max-w-xs w-full">
        <h1
          className="text-4xl font-bold tracking-[0.2em] mb-10"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--c-accent)' }}
        >
          SHISHA MIX
        </h1>
        <div
          className="w-16 h-px mx-auto mb-10"
          style={{ background: 'linear-gradient(90deg, transparent, var(--c-accent), transparent)' }}
        />
        <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--c-sub)' }}>{a.desc1}</p>
        <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--c-sub)' }}>{a.desc2}</p>
        <p className="text-base font-medium mb-6 tracking-wide" style={{ color: 'var(--c-text)' }}>{a.prompt}</p>

        <div className="flex gap-2 mb-8">
          <BirthSelect value={year}  onChange={setYear}  placeholder={a.year}  options={years.map(y => ({ value: y, label: `${y}` }))} />
          <BirthSelect value={month} onChange={setMonth} placeholder={a.month} options={months.map(m => ({ value: m, label: `${m}` }))} />
          <BirthSelect value={day}   onChange={setDay}   placeholder={a.day}   options={days.map(d => ({ value: d, label: `${d}` }))} />
        </div>

        <button
          onClick={handleConfirm}
          disabled={!ready}
          className="w-full py-4 font-semibold text-sm tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-30"
          style={{
            background: 'var(--ca-grad)',
            color: 'var(--c-btn-fg)',
            boxShadow: ready ? '0 0 20px var(--ca-30)' : 'none',
          }}
        >
          {a.confirm}
        </button>

        <button
          onClick={() => navigate('/legal')}
          className="mt-5 text-[11px] tracking-wide underline underline-offset-2 active:opacity-60"
          style={{ color: 'var(--c-dim)' }}
        >
          {a.legal}
        </button>
      </div>
      <p className="absolute bottom-8 text-xs tracking-wide" style={{ color: 'var(--c-dim)' }}>{a.footer}</p>
    </main>
  )
}

function BirthSelect({ value, onChange, placeholder, options }) {
  return (
    <div className="flex-1 relative">
      <select
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-2 py-3 text-xs text-center outline-none transition-colors"
        style={{
          background: 'var(--c-surf)',
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: value ? 'var(--ca-40)' : 'var(--ca-15)',
          color: value ? 'var(--c-text)' : 'var(--c-muted)',
        }}
      >
        <option value="" style={{ background: 'var(--c-surf)', color: 'var(--c-muted)' }}>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: 'var(--c-surf)', color: 'var(--c-text)' }}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
