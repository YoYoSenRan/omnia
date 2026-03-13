import { create } from 'zustand'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'omnia-console-theme'

/** 从 localStorage 或系统偏好读取初始主题 */
function getInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light'
    document.documentElement.classList.toggle('dark', next === 'dark')
    localStorage.setItem(THEME_STORAGE_KEY, next)
    set({ theme: next })
  },
}))

/** 初始化时同步 DOM class */
document.documentElement.classList.toggle('dark', getInitialTheme() === 'dark')
