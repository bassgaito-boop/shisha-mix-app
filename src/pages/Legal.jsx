import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useLang } from '../contexts/LangContext'

export default function Legal() {
  const navigate = useNavigate()
  const { t } = useLang()
  const l = t.legal

  return (
    <div className="min-h-svh px-5 pt-12 pb-16" style={{ background: 'var(--c-bg)' }}>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm mb-8 active:opacity-60"
        style={{ color: 'var(--c-muted)' }}
      >
        <ChevronLeft size={16} />
        {l.back}
      </button>

      <h1
        className="text-2xl mb-1"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--c-accent)' }}
      >
        {l.title}
      </h1>
      <p className="text-[10px] tracking-widest uppercase mb-10" style={{ color: 'var(--c-dim)' }}>{l.subtitle}</p>

      <Section title={l.termsTitle}>
        <Item label={l.age.label}>{l.age.text}</Item>
        <Item label={l.disclaimer.label}>{l.disclaimer.text}</Item>
        <Item label={l.prohibited.label}>{l.prohibited.text}</Item>
        <Item label={l.changes.label}>{l.changes.text}</Item>
      </Section>

      <div className="h-px my-8" style={{ background: 'var(--ca-10)' }} />

      <Section title={l.privacyTitle}>
        <Item label={l.collect.label}>{l.collect.text}</Item>
        <Item label={l.storage.label}>{l.storage.text}</Item>
        <Item label={l.share.label}>{l.share.text}</Item>
        <Item label={l.analytics.label}>{l.analytics.text}</Item>
        <Item label={l.contact.label}>{l.contact.text}</Item>
      </Section>

      <p className="text-[10px] text-center mt-10" style={{ color: 'var(--c-dim)' }}>{l.updated}</p>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="mb-2">
      <p className="text-[10px] tracking-widest uppercase mb-4" style={{ color: 'var(--c-accent)' }}>{title}</p>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Item({ label, children }) {
  return (
    <div>
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--c-text)' }}>{label}</p>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--c-muted)' }}>{children}</p>
    </div>
  )
}
