import { useQuery } from "@tanstack/react-query"
import { request } from "@/lib/api"
import { QUERY_KEYS } from "@/lib/constants"
import type { Session } from "@/types"

/** 查询所有 Session */
export function useSessions() {
  return useQuery({
    queryKey: QUERY_KEYS.sessions,
    queryFn: () => request<Session[]>("/api/sessions"),
  })
}
