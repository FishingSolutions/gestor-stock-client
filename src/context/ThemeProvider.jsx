import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './ThemeContext'

export const THEME_STORAGE_KEY = 'stockfx:theme'

/**
 * Tema inicial: lo guardado por el usuario o, si todavía no eligió,
 * la preferencia del sistema operativo. La misma lógica se ejecuta en el
 * script inline de index.html para pintar el tema correcto desde el arranque.
 */
function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // localStorage puede estar bloqueado; seguimos con la preferencia del sistema.
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Sin persistencia disponible: el tema sigue funcionando en memoria.
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(
    () => ({ theme, isDark: theme === 'dark', toggleTheme }),
    [theme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
