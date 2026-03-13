/**
 * 全局 Provider 层
 *
 * 集中管理 QueryClientProvider 等全局上下文，
 * 避免 App.tsx 内嵌套过深。
 *
 * @module app/providers
 */

import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/** TanStack Query 客户端实例 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /* 4xx 错误不重试 */
      retry: (failureCount, error) => {
        if (error instanceof Error && 'status' in error) {
          const status = (error as { status: number }).status
          if (status >= 400 && status < 500) return false
        }
        return failureCount < 2
      },
      /* 窗口重新聚焦时不自动重新拉取 */
      refetchOnWindowFocus: false,
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
