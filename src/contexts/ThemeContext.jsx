import { createContext, useContext, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

export const THEMES = [
  { id: 'default',   label: 'Default',   accent: '#c9a84c' },
  { id: 'business',  label: 'Business',  accent: '#4f95e8' },
  { id: 'creator',   label: 'Creator',   accent: '#d670b8' },
  { id: 'gaming',    label: 'Gaming',    accent: '#00d4ff' },
  { id: 'lifestyle', label: 'Lifestyle', accent: '#c49a6c' },
  { id: 'senior',    label: 'Senior',    accent: '#3d9be9' },
]

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage('shisha_theme', 'default')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
