import { useQuery } from "@tanstack/react-query"
import { request } from "@/lib/api"
import { QUERY_KEYS } from "@/lib/constants"
import type { Skill } from "@/types"

/** 查询所有 Skill */
export function useSkills() {
  return useQuery({
    queryKey: QUERY_KEYS.skills,
    queryFn: () => request<Skill[]>("/api/skills"),
  })
}
