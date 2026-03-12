import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useConnectionStore } from '@/stores/connection-store'
import type { SystemStatus } from '@omnia/types'

export function Settings() {
  const connectionStatus = useConnectionStore((s) => s.status)

  const { data: status } = useQuery({
    queryKey: ['status'],
    queryFn: () => api.get<SystemStatus>('/api/status'),
    refetchInterval: 5000,
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          System configuration and status
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gateway Connection</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant="outline">{connectionStatus}</Badge>
            </div>
            {status && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Server Uptime</span>
                <span className="text-sm text-foreground">
                  {Math.floor(status.uptime)}s
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm text-foreground">0.0.1</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Platform</span>
              <span className="text-sm text-foreground">OpenClaw Web Console</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
