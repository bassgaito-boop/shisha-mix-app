import { useState, useCallback } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) return JSON.parse(item)
      return typeof initialValue === 'function' ? initialValue() : initialValue
    } catch {
      return typeof initialValue === 'function' ? initialValue() : initialValue
    }
  })

  const setValue = useCallback((value) => {
    setStoredValue((prev) => {
      try {
        const next = value instanceof Function ? value(prev) : value
        window.localStorage.setItem(key, JSON.stringify(next))
        return next
      } catch (error) {
        console.error(error)
        if (error?.name === 'QuotaExceededError' || error?.code === 22) {
          window.dispatchEvent(new CustomEvent('shisha-storage-error'))
        }
        return prev
      }
    })
  }, [key])

  return [storedValue, setValue]
}
