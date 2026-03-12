import { useTranslation } from 'react-i18next'
import { useConnectionStore } from '@/stores/connection-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages, Sun, Moon, Monitor } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'

const statusClassName = {
  connected: 'bg-success/15 text-success border-success/30',
  connecting: 'bg-warning/15 text-warning border-warning/30',
  authenticating: 'bg-warning/15 text-warning border-warning/30',
  disconnected: 'bg-destructive/15 text-destructive border-destructive/30',
} as const

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
  const status = useConnectionStore((s) => s.status)
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const isDark = document.documentElement.classList.contains('dark')
  const ThemeIcon = isDark ? Moon : Sun

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div />
      <div className="flex items-center gap-3">
        <Badge variant="outline" className={statusClassName[status]}>
          <span className="mr-1.5 inline-block size-1.5 rounded-full bg-current" />
          {t('header.gateway', { status: t(`status.${status}`) })}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ThemeIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
          <DropdownMenuContent align="end">
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
