import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { X } from 'lucide-react'
import BottomNav from './BottomNav'
import { useLang } from '../../contexts/LangContext'

export default function Layout() {
  const { t } = useLang()
  const rl = t.recipeList
  const [storageError, setStorageError] = useState(false)

  useEffect(() => {
    const handler = () => setStorageError(true)
    window.addEventListener('shisha-storage-error', handler)
    return () => window.removeEventListener('shisha-storage-error', handler)
  }, [])

  return (
    <div className="flex flex-col min-h-svh" style={{ background: 'var(--c-bg)' }}>
      {storageError && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3"
          style={{ background: '#7f1d1d', borderBottom: '1px solid #ef4444' }}
        >
          <p className="flex-1 text-xs leading-snug text-white">{rl.storageError}</p>
          <button
            onClick={() => setStorageError(false)}
            className="shrink-0 text-white opacity-70 active:opacity-100"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
