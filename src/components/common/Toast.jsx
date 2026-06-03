import { useState, useCallback, useEffect, useRef } from 'react'

export function useToast() {
  const [message, setMessage] = useState(null)
  const timerRef = useRef(null)

  const showToast = useCallback((msg, duration = 2200) => {
    clearTimeout(timerRef.current)
    setMessage(msg)
    timerRef.current = setTimeout(() => setMessage(null), duration)
  }, [])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return { message, showToast }
}

export function Toast({ message }) {
  if (!message) return null
  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-5 py-2.5 text-xs font-medium tracking-wide whitespace-nowrap pointer-events-none"
      style={{
        background: 'var(--c-surf-2)',
        border: '1px solid var(--ca-30)',
        borderRadius: 'var(--radius)',
        color: 'var(--c-text)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      {message}
    </div>
  )
}
