import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

/** 导航项定义 */
interface NavItem {
  /** i18n key */
  label: string
  /** 路由路径 */
  path: string
}

/** 侧边栏导航项配置 */
const NAV_ITEMS: NavItem[] = [
  { label: 'nav.dashboard', path: '/' },
  { label: 'nav.agents', path: '/agents' },
  { label: 'nav.skills', path: '/skills' },
  { label: 'nav.tasks', path: '/tasks' },
  { label: 'nav.sessions', path: '/sessions' },
]

export function Sidebar() {
  const { pathname } = useLocation()
  const { t } = useTranslation()

  return (
    <aside className="w-60 bg-background border-r border-border flex flex-col">
      {/* Logo 区域 */}
      <div className="h-14 flex items-center px-4 border-b border-border">
        <h1 className="text-lg font-semibold text-foreground">{t('common.appName')}</h1>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          /* 精确匹配首页，前缀匹配其他路由 */
          const isActive =
            item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'block px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {t(item.label)}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
