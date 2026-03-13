import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { request } from '@/lib/api'
import { QUERY_KEYS } from '@/lib/constants'
import type { Agent } from '@/types'

/** 查询所有 Agent */
export function useAgents() {
  return useQuery({
    queryKey: QUERY_KEYS.agents,
    queryFn: () => request<Agent[]>('/api/agents'),
  })
}

/** 查询单个 Agent */
export function useAgent(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.agent(id),
    queryFn: () => request<Agent>(`/api/agents/${id}`),
    enabled: !!id,
  })
}

/** 创建 Agent */
export function useCreateAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Agent>) =>
      request<Agent>('/api/agents', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agents })
    },
  })
}

/** 更新 Agent */
export function useUpdateAgent(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Agent>) =>
      request<Agent>(`/api/agents/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agents })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agent(id) })
    },
  })
}

/** 删除 Agent */
export function useDeleteAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      request<{ id: string }>(`/api/agents/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agents })
    },
  })
}
