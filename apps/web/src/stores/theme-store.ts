import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

function getStoredTheme(): Theme {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

function applyTheme(theme: Theme) {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)

  document.documentElement.classList.toggle('dark', isDark)
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = getStoredTheme()
  applyTheme(initial)

  // Listen for system preference changes
  const mq = matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', () => {
    if (get().theme === 'system') {
      applyTheme('system')
    }
  })

  return {
    theme: initial,
    setTheme: (theme) => {
      localStorage.setItem('theme', theme)
      applyTheme(theme)
      set({ theme })
    },
  }
})
