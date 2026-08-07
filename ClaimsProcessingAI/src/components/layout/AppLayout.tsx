import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { getAuthedUser } from '@/lib/auth'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'

export function AppLayout() {
  const user = getAuthedUser()
  const [collapsed, setCollapsed] = useState(false)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-svh flex-col bg-[var(--surface-muted)]">
      <TopNav user={user} collapsed={collapsed} onToggleCollapsed={() => setCollapsed((v) => !v)} />
      <div className="flex min-h-0 flex-1">
        <Sidebar roleId={user.id} collapsed={collapsed} />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
