import { useQuery } from "@tanstack/react-query"
import { request } from "@/lib/api"
import { QUERY_KEYS } from "@/lib/constants"
import type { AuditLog } from "@/types"

/** 查询最近活动 */
export function useActivities(limit = 20) {
  return useQuery({
    queryKey: QUERY_KEYS.activities,
    queryFn: () => request<AuditLog[]>(`/api/activities?limit=${limit}`),
  })
}
