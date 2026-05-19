import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useLang } from '../contexts/LangContext'

export default function Legal() {
  const navigate = useNavigate()
  const { t } = useLang()
  const l = t.legal

  return (
    <div className="min-h-svh bg-[#0a0a0a] px-5 pt-12 pb-16">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-[#5a5555] text-sm mb-8 active:opacity-60"
      >
        <ChevronLeft size={16} />
        {l.back}
      </button>

      <h1
        className="text-2xl text-[#c9a84c] mb-1"
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
      >
        {l.title}
      </h1>
      <p className="text-[#3a3535] text-[10px] tracking-widest uppercase mb-10">{l.subtitle}</p>

      <Section title={l.termsTitle}>
        <Item label={l.age.label}>{l.age.text}</Item>
        <Item label={l.disclaimer.label}>{l.disclaimer.text}</Item>
        <Item label={l.prohibited.label}>{l.prohibited.text}</Item>
        <Item label={l.changes.label}>{l.changes.text}</Item>
      </Section>

      <div className="h-px bg-[rgba(201,168,76,0.1)] my-8" />

      <Section title={l.privacyTitle}>
        <Item label={l.collect.label}>{l.collect.text}</Item>
        <Item label={l.storage.label}>{l.storage.text}</Item>
        <Item label={l.share.label}>{l.share.text}</Item>
        <Item label={l.analytics.label}>{l.analytics.text}</Item>
        <Item label={l.contact.label}>{l.contact.text}</Item>
      </Section>

      <p className="text-[#3a3535] text-[10px] text-center mt-10">{l.updated}</p>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="mb-2">
      <p className="text-[#c9a84c] text-[10px] tracking-widest uppercase mb-4">{title}</p>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Item({ label, children }) {
  return (
    <div>
      <p className="text-[#f0ede8] text-xs font-medium mb-1">{label}</p>
      <p className="text-[#5a5555] text-xs leading-relaxed">{children}</p>
    </div>
  )
}
