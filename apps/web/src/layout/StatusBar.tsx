import { useTranslation } from 'react-i18next'
import { useConnectionStore } from '@/stores/connection-store'

const statusColor = {
  connected: 'bg-success',
  connecting: 'bg-warning',
  authenticating: 'bg-warning',
  disconnected: 'bg-destructive',
} as const

export function StatusBar() {
  const { t } = useTranslation()
  const status = useConnectionStore((s) => s.status)

  return (
    <footer className="flex h-6 shrink-0 items-center justify-between border-t border-border bg-muted/50 px-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className={`inline-block size-1.5 rounded-full ${statusColor[status]}`} />
          {t('header.gateway', { status: t(`status.${status}`) })}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span>{t('statusBar.protocol')}</span>
        <span>v0.0.1</span>
      </div>
    </footer>
  )
}
