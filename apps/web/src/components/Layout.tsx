/**
 * 布局组件
 *
 * 业务前端整体布局框架。
 *
 * @module components/Layout
 */

import { Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
        <h1 className="text-lg font-semibold text-gray-900">Omnia</h1>
      </header>

      {/* 内容区 */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
