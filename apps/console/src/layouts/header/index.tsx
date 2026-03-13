import { useEffect, useRef, useState } from "react"
import { Check, Languages, Laptop, Moon, Sun } from "lucide-react"
import { useTranslation } from "react-i18next"
import { SUPPORTED_LANGS, changeLanguage, type LangCode } from "@/i18n"
import { useThemeStore } from "@/stores/theme"
import { cn } from "@/lib/utils"

type ThemeOption = "system" | "light" | "dark"

const THEME_OPTIONS: ThemeOption[] = ["system", "light", "dark"]

function ThemeIcon({ theme, className }: { theme: ThemeOption; className?: string }) {
  if (theme === "light") return <Sun className={className} />
  if (theme === "dark") return <Moon className={className} />
  return <Laptop className={className} />
}

export function Header() {
  const { i18n, t } = useTranslation()
  const { theme, setTheme } = useThemeStore()
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const langMenuRef = useRef<HTMLDivElement | null>(null)
  const themeMenuRef = useRef<HTMLDivElement | null>(null)
  const currentLang =
    SUPPORTED_LANGS.find((lang) => i18n.language.startsWith(lang.code))?.code ?? "zh"

  useEffect(() => {
    if (!langMenuOpen && !themeMenuOpen) return

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      const clickedLangMenu = langMenuRef.current?.contains(target)
      const clickedThemeMenu = themeMenuRef.current?.contains(target)

      if (!clickedLangMenu && !clickedThemeMenu) {
        setLangMenuOpen(false)
        setThemeMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLangMenuOpen(false)
        setThemeMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [langMenuOpen, themeMenuOpen])

  return (
    <header className="h-14 shrink-0 flex items-center justify-end gap-3 px-4 border-b border-border">
      {/* 语言切换 */}
      <div ref={langMenuRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setLangMenuOpen((open) => !open)
            setThemeMenuOpen(false)
          }}
          className="flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={t("common.languageMenu")}
          aria-haspopup="menu"
          aria-expanded={langMenuOpen}
        >
          <Languages className="h-4 w-4" />
        </button>

        {langMenuOpen && (
          <div
            role="menu"
            aria-label={t("common.languageMenu")}
            className="absolute right-0 top-10 z-20 min-w-32 space-y-1 rounded-lg border border-border bg-popover p-1.5 shadow-lg"
          >
            {SUPPORTED_LANGS.map((lang) => {
              const isActive = currentLang === lang.code

              return (
                <button
                  key={lang.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => {
                    changeLanguage(lang.code as LangCode)
                    setLangMenuOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-popover-foreground transition-colors",
                    isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/70",
                  )}
                >
                  <span className="flex-1 text-left">{lang.label}</span>
                  <Check className={cn("h-4 w-4", isActive ? "opacity-100" : "opacity-0")} />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 主题切换 */}
      <div ref={themeMenuRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setThemeMenuOpen((open) => !open)
            setLangMenuOpen(false)
          }}
          className="flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={t("common.themeMenu")}
          aria-haspopup="menu"
          aria-expanded={themeMenuOpen}
        >
          <ThemeIcon theme={theme} className="h-4 w-4" />
        </button>

        {themeMenuOpen && (
          <div
            role="menu"
            aria-label={t("common.themeMenu")}
            className="absolute right-0 top-10 z-20 min-w-40 space-y-1 rounded-lg border border-border bg-popover p-1.5 shadow-lg"
          >
            {THEME_OPTIONS.map((option) => {
              const isActive = theme === option

              return (
                <button
                  key={option}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => {
                    setTheme(option)
                    setThemeMenuOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-popover-foreground transition-colors",
                    isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/70",
                  )}
                >
                  <ThemeIcon theme={option} className="h-4 w-4" />
                  <span className="flex-1 text-left">
                    {t(`common.theme${option.charAt(0).toUpperCase()}${option.slice(1)}`)}
                  </span>
                  <Check className={cn("h-4 w-4", isActive ? "opacity-100" : "opacity-0")} />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </header>
  )
}
