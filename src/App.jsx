import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useLocalStorage } from './hooks/useLocalStorage'
import AgeGate from './pages/AgeGate'
import Home from './pages/Home'
import RecipeCreate from './pages/RecipeCreate'
import RecipeList from './pages/RecipeList'
import SettingMemo from './pages/SettingMemo'
import Layout from './components/common/Layout'

export default function App() {
  const [ageVerified, setAgeVerified] = useLocalStorage('ageVerified', false)

  if (!ageVerified) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<AgeGate onVerify={() => setAgeVerified(true)} />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/recipes/new" element={<RecipeCreate />} />
          <Route path="/memo" element={<SettingMemo />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
