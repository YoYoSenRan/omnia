import { useQuery } from "@tanstack/react-query"
import { request } from "@/lib/api"
import { QUERY_KEYS } from "@/lib/constants"
import type { Task } from "@/types"

/** 查询所有 Task */
export function useTasks() {
  return useQuery({
    queryKey: QUERY_KEYS.tasks,
    queryFn: () => request<Task[]>("/api/tasks"),
  })
}
