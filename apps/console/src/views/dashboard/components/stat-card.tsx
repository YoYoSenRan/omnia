import type { ReactNode } from "react"

interface StatCardProps {
  icon: ReactNode
  title: string
  value: string | number
  subtitle?: string
}

export function StatCard({ icon, title, value, subtitle }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{title}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
