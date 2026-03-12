import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import { LayoutDashboard, Bot, Puzzle, FolderOpen, MessageSquare, Settings, ChevronsUpDown, Plus, Check } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/stores/project-store'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Project } from '@omnia/types'

const navItems = [
  { path: '', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { path: 'agents', icon: Bot, labelKey: 'nav.agents' },
  { path: 'skills', icon: Puzzle, labelKey: 'nav.skills' },
  { path: 'workspace', icon: FolderOpen, labelKey: 'nav.workspace' },
  { path: 'chat', icon: MessageSquare, labelKey: 'nav.chat' },
]

const bottomItems = [{ path: 'settings', icon: Settings, labelKey: 'nav.settings' }]

function NavItem({ path, icon: Icon, labelKey }: { path: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; labelKey: string }) {
  const { t } = useTranslation()
  const { projectId } = useParams()
  const { pathname } = useLocation()
  const label = t(labelKey)
  const to = `/p/${projectId}${path ? `/${path}` : ''}`
  const isActive = path === '' ? pathname === to : pathname.startsWith(to)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink
          to={to}
          end={path === ''}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
            isActive ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}>
          <Icon size={18} strokeWidth={1.8} />
          <span className="truncate">{label}</span>
        </NavLink>
      </TooltipTrigger>
      <TooltipContent side="right" className="md:hidden">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function ProjectSwitcher() {
  const { t } = useTranslation()
  const { projectId } = useParams()
  const navigate = useNavigate()
  const currentProject = useProjectStore((s) => s.currentProject)

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<Project[]>('/api/projects'),
    refetchInterval: 10_000,
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-14 w-full items-center gap-2 px-5 outline-none hover:bg-accent transition-colors">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary shrink-0">
          <span className="text-xs font-bold text-primary-foreground">
            {(currentProject?.name ?? 'O')[0].toUpperCase()}
          </span>
        </div>
        <span className="flex-1 truncate text-left text-sm font-semibold tracking-wide text-foreground">
          {currentProject?.name ?? 'Omnia'}
        </span>
        <ChevronsUpDown size={14} className="shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {projects.map((p) => (
          <DropdownMenuItem
            key={p.id}
            onClick={() => {
              if (p.id !== projectId) {
                navigate(`/p/${p.id}`)
              }
            }}
          >
            <span className="flex-1 truncate">{p.name}</span>
            {p.id === projectId && <Check size={14} className="shrink-0 text-primary" />}
          </DropdownMenuItem>
        ))}
        {projects.length > 0 && <DropdownMenuSeparator />}
        <DropdownMenuItem onClick={() => navigate('/welcome')}>
          <Plus size={14} className="mr-2" />
          {t('project.newProject')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-background">
      {/* Project Switcher */}
      <ProjectSwitcher />

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        {navItems.map(item => (
          <NavItem key={item.path} {...item} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-2">
        <Separator className="mb-2" />
        <div className="flex flex-col gap-0.5">
          {bottomItems.map(item => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>
      </div>
    </aside>
  )
}
