import { create } from "zustand"

type Theme = "system" | "light" | "dark"
type ResolvedTheme = "light" | "dark"

const THEME_STORAGE_KEY = "omnia-console-theme"
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

function getSystemTheme(): ResolvedTheme {
  return mediaQuery.matches ? "dark" : "light"
}

function applyTheme(theme: Theme): ResolvedTheme {
  const resolved = theme === "system" ? getSystemTheme() : theme
  document.documentElement.classList.toggle("dark", resolved === "dark")
  return resolved
}

/** 从 localStorage 或系统偏好读取初始主题 */
function getInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
  if (stored === "system" || stored === "light" || stored === "dark") return stored
  return "system"
}

interface ThemeState {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const initialTheme = getInitialTheme()

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  resolvedTheme: applyTheme(initialTheme),
  setTheme: (theme) => {
    const resolvedTheme = applyTheme(theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    set({ theme, resolvedTheme })
  },
}))

mediaQuery.addEventListener("change", () => {
  const { theme } = useThemeStore.getState()
  if (theme !== "system") return

  useThemeStore.setState({
    resolvedTheme: applyTheme("system"),
  })
})
