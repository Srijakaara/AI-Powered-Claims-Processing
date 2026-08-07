import { NavLink } from 'react-router-dom'
import { Home, LayoutDashboard, Inbox, FileSearch, LineChart, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RoleId } from '@/lib/auth'

const ROLE_NAV_ITEMS: Record<RoleId, { label: string; to: string; icon: typeof LayoutDashboard }[]> = {
  operational: [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Intake', to: '/intake', icon: Inbox },
  ],
  auditor: [{ label: 'Auditor Replay', to: '/auditor', icon: FileSearch }],
  executive: [{ label: 'Executive Dashboard', to: '/executive', icon: LineChart }],
  admin: [{ label: 'Admin Console', to: '/admin', icon: Settings }],
}

export function Sidebar({ roleId, collapsed }: { roleId: RoleId; collapsed: boolean }) {
  const navItems = [{ label: 'Home', to: '/', icon: Home }, ...ROLE_NAV_ITEMS[roleId]]

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] py-5 transition-all duration-200',
        collapsed ? 'w-16 px-2' : 'w-60 px-3',
      )}
    >
      <nav className="flex flex-col gap-1">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-navy-600 text-white'
                  : 'text-[var(--ink-muted)] hover:bg-navy-50 hover:text-navy-700',
              )
            }
          >
            <Icon size={18} strokeWidth={2} className="shrink-0" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
