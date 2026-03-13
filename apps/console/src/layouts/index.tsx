import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/layouts/sidebar'
import { Header } from '@/layouts/header'

export function Layout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
