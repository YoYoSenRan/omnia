/**
 * 根布局组件
 *
 * 控制台整体框架：侧边栏 + 内容区。
 * 使用 Outlet 渲染子路由页面。
 *
 * @module layouts
 */

import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/layouts/sidebar'

export function Layout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      {/* 内容区 */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
