import { useTranslation } from "react-i18next"
import { SUPPORTED_LANGS, changeLanguage, type LangCode } from "@/i18n"
import { useThemeStore } from "@/stores/theme"

export function Header() {
  const { i18n, t } = useTranslation()
  const { theme, toggleTheme } = useThemeStore()

  return (
    <header className="h-14 shrink-0 flex items-center justify-end gap-3 px-4 border-b border-border">
      {/* 语言切换 */}
      <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
        {SUPPORTED_LANGS.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code as LangCode)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              i18n.language === lang.code ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* 主题切换 */}
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label={t("common.toggleTheme")}
      >
        {theme === "light" ? (
          /* 太阳图标 */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        ) : (
          /* 月亮图标 */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        )}
      </button>
    </header>
  )
}
