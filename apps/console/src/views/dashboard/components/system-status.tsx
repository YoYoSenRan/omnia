import { useTranslation } from "react-i18next"
import { RefreshCw } from "lucide-react"
import { useHealth, useGatewayStatus, useTriggerSync } from "@/hooks/use-system-status"
import { Button } from "@/components/ui/button"

export function SystemStatus() {
  const { t } = useTranslation()
  const { data: health, isLoading: healthLoading } = useHealth()
  const { data: gateway, isLoading: gatewayLoading } = useGatewayStatus()
  const sync = useTriggerSync()

  const backendOk = health?.status === "ok"
  const gatewayOk = gateway?.status === "connected"

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-6">
        {/* Backend */}
        <div className="flex items-center gap-2 text-sm">
          {healthLoading ? (
            <span className="size-2 rounded-full bg-gray-400" />
          ) : (
            <span className={`size-2 rounded-full ${backendOk ? "bg-green-500" : "bg-red-500"}`} />
          )}
          <span className="text-muted-foreground">
            {t(backendOk ? "dashboard.backendNormal" : "dashboard.backendDown")}
          </span>
        </div>

        {/* Gateway */}
        <div className="flex items-center gap-2 text-sm">
          {gatewayLoading ? (
            <span className="size-2 rounded-full bg-gray-400" />
          ) : (
            <span className={`size-2 rounded-full ${gatewayOk ? "bg-green-500" : "bg-yellow-500"}`} />
          )}
          <span className="text-muted-foreground">
            {t(gatewayOk ? "dashboard.gatewayConnected" : "dashboard.gatewayDisconnected")}
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={sync.isPending}
        onClick={() => sync.mutate()}
      >
        <RefreshCw className={`mr-1.5 size-3.5 ${sync.isPending ? "animate-spin" : ""}`} />
        {t(sync.isPending ? "dashboard.syncing" : "dashboard.triggerSync")}
      </Button>
    </div>
  )
}
