import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useLocalStorage } from './hooks/useLocalStorage'
import { LangProvider } from './contexts/LangContext'
import AgeGate from './pages/AgeGate'
import Home from './pages/Home'
import RecipeCreate from './pages/RecipeCreate'
import RecipeList from './pages/RecipeList'
import FlavorManage from './pages/FlavorManage'
import FlavorEdit from './pages/FlavorEdit'
import Legal from './pages/Legal'
import Layout from './components/common/Layout'

export default function App() {
  const [ageVerified, setAgeVerified] = useLocalStorage('ageVerified', false)

  if (!ageVerified) {
    return (
      <LangProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/legal" element={<Legal />} />
            <Route path="*" element={<AgeGate onVerify={() => setAgeVerified(true)} />} />
          </Routes>
        </BrowserRouter>
      </LangProvider>
    )
  }

  return (
    <LangProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/legal" element={<Legal />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/recipes" element={<RecipeList />} />
            <Route path="/recipes/new" element={<RecipeCreate />} />
            <Route path="/recipes/:id/edit" element={<RecipeCreate />} />
            <Route path="/flavors" element={<FlavorManage />} />
            <Route path="/flavors/:id/edit" element={<FlavorEdit />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LangProvider>
  )
}
