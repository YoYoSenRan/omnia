import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Bot,
  Puzzle,
  FolderOpen,
  MessageSquare,
  Settings,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agents', icon: Bot, label: 'Agents' },
  { to: '/skills', icon: Puzzle, label: 'Skills' },
  { to: '/workspace', icon: FolderOpen, label: 'Workspace' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
]

const bottomItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
]

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )
          }
        >
          <Icon size={18} strokeWidth={1.8} />
          {label}
        </NavLink>
      </TooltipTrigger>
      <TooltipContent side="right" className="md:hidden">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-background">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
          <span className="text-xs font-bold text-primary-foreground">O</span>
        </div>
        <span className="text-sm font-semibold tracking-wide text-foreground">
          Omnia
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-2">
        <Separator className="mb-2" />
        <div className="flex flex-col gap-0.5">
          {bottomItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>
      </div>
    </aside>
  )
}
