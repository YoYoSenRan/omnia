import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages, Sun, Moon, Monitor } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'

const languages = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
]

const themes = [
  { value: 'light' as const, label: 'settings.light', icon: Sun },
  { value: 'dark' as const, label: 'settings.dark', icon: Moon },
  { value: 'system' as const, label: 'settings.system', icon: Monitor },
]

export function Header() {
  const { t, i18n } = useTranslation()
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const isDark = document.documentElement.classList.contains('dark')
  const ThemeIcon = isDark ? Moon : Sun

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div />
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ThemeIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="flex flex-col gap-1">
            {themes.map((item) => (
              <DropdownMenuItem
                key={item.value}
                onClick={() => setTheme(item.value)}
                className={theme === item.value ? 'bg-accent' : undefined}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {t(item.label)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Languages className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="flex flex-col gap-1">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={i18n.language === lang.code ? 'bg-accent' : undefined}
              >
                {lang.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
