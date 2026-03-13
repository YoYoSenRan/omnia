import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { request } from "@/lib/api"
import { QUERY_KEYS } from "@/lib/constants"
import type { HealthStatus, GatewayStatus } from "@/types"

/** 后端健康检查（30s 轮询） */
export function useHealth() {
  return useQuery({
    queryKey: QUERY_KEYS.health,
    queryFn: () => request<HealthStatus>("/health"),
    refetchInterval: 30_000,
  })
}

/** 网关连接状态（30s 轮询） */
export function useGatewayStatus() {
  return useQuery({
    queryKey: QUERY_KEYS.gatewayStatus,
    queryFn: () => request<GatewayStatus>("/api/gateway/status"),
    refetchInterval: 30_000,
  })
}

/** 触发 Agent 同步 */
export function useTriggerSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => request("/api/agents/sync", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agents })
    },
  })
}
