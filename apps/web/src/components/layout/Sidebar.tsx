import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bot, Puzzle, FolderOpen, MessageSquare, Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const navItems = [
  { to: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/agents', icon: Bot, labelKey: 'nav.agents' },
  { to: '/skills', icon: Puzzle, labelKey: 'nav.skills' },
  { to: '/workspace', icon: FolderOpen, labelKey: 'nav.workspace' },
  { to: '/chat', icon: MessageSquare, labelKey: 'nav.chat' },
];

const bottomItems = [{ to: '/settings', icon: Settings, labelKey: 'nav.settings' }];

function NavItem({ to, icon: Icon, labelKey }: { to: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; labelKey: string }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const label = t(labelKey);
  const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink
          to={to}
          end={to === '/'}
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
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-background">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
          <span className="text-xs font-bold text-primary-foreground">O</span>
        </div>
        <span className="text-sm font-semibold tracking-wide text-foreground">Omnia</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        {navItems.map(item => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-2">
        <Separator className="mb-2" />
        <div className="flex flex-col gap-0.5">
          {bottomItems.map(item => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>
      </div>
    </aside>
  );
}
