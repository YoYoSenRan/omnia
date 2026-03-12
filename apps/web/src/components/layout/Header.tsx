import { useConnectionStore } from '@/stores/connection-store'
import { Badge } from '@/components/ui/badge'

const statusConfig = {
  connected: { label: 'Connected', className: 'bg-success/15 text-success border-success/30' },
  connecting: { label: 'Connecting', className: 'bg-warning/15 text-warning border-warning/30' },
  authenticating: { label: 'Authenticating', className: 'bg-warning/15 text-warning border-warning/30' },
  disconnected: { label: 'Disconnected', className: 'bg-destructive/15 text-destructive border-destructive/30' },
} as const

export function Header() {
  const status = useConnectionStore((s) => s.status)
  const config = statusConfig[status]

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div />
      <div className="flex items-center gap-3">
        <Badge variant="outline" className={config.className}>
          <span className="mr-1.5 inline-block size-1.5 rounded-full bg-current" />
          Gateway: {config.label}
        </Badge>
      </div>
    </header>
  )
}
