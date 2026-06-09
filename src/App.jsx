import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useLocalStorage } from './hooks/useLocalStorage'
import { LangProvider } from './contexts/LangContext'
import AgeGate from './pages/AgeGate'
import Home from './pages/Home'
import Layout from './components/common/Layout'

const RecipeList    = lazy(() => import('./pages/RecipeList'))
const RecipeCreate  = lazy(() => import('./pages/RecipeCreate'))
const FlavorManage  = lazy(() => import('./pages/FlavorManage'))
const FlavorEdit    = lazy(() => import('./pages/FlavorEdit'))
const SettingManage = lazy(() => import('./pages/SettingManage'))
const Legal         = lazy(() => import('./pages/Legal'))

function PageFallback() {
  return (
    <div className="min-h-svh flex items-center justify-center" style={{ background: 'var(--c-bg)' }}>
      <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--ca-20)', borderTopColor: 'var(--c-accent)' }} />
    </div>
  )
}

export default function App() {
  const [ageVerified, setAgeVerified] = useLocalStorage('ageVerified', false)

  if (!ageVerified) {
    return (
      <LangProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/legal" element={<Suspense fallback={<PageFallback />}><Legal /></Suspense>} />
            <Route path="*" element={<AgeGate onVerify={() => setAgeVerified(true)} />} />
          </Routes>
        </BrowserRouter>
      </LangProvider>
    )
  }

  return (
    <LangProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/legal" element={<Legal />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/recipes" element={<RecipeList />} />
              <Route path="/recipes/new" element={<RecipeCreate />} />
              <Route path="/recipes/:id/edit" element={<RecipeCreate />} />
              <Route path="/flavors" element={<FlavorManage />} />
              <Route path="/flavors/:id/edit" element={<FlavorEdit />} />
              <Route path="/settings" element={<SettingManage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </LangProvider>
  )
}
