/**
 * 路由配置
 *
 * 集中管理所有页面路由，便于查看整体路由结构。
 *
 * @module app/router
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/layouts'
import { Dashboard } from '@/views/dashboard'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          {/* 后续路由在此追加 */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
