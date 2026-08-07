import { NavLink } from 'react-router-dom'
import { Home, LayoutDashboard, Inbox, FileSearch, LineChart, Settings, X } from 'lucide-react'
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

export function Sidebar({
  roleId,
  collapsed,
  mobileOpen,
  onCloseMobile,
}: {
  roleId: RoleId
  collapsed: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
}) {
  const navItems = [{ label: 'Home', to: '/', icon: Home }, ...ROLE_NAV_ITEMS[roleId]]

  const nav = (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onCloseMobile}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              collapsed && 'lg:justify-center lg:px-0',
              isActive
                ? 'bg-navy-600 text-white'
                : 'text-[var(--ink-muted)] hover:bg-navy-50 hover:text-navy-700',
            )
          }
        >
          <Icon size={18} strokeWidth={2} className="shrink-0" />
          <span className={cn(collapsed && 'lg:hidden')}>{label}</span>
        </NavLink>
      ))}
    </nav>
  )

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 max-w-[80vw] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] py-5 px-3 transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="mb-3 flex items-center justify-end">
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-muted)] hover:bg-navy-50 hover:text-navy-700"
          >
            <X size={18} />
          </button>
        </div>
        {nav}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden h-full shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] py-5 transition-all duration-200 lg:flex',
          collapsed ? 'w-16 px-2' : 'w-60 px-3',
        )}
      >
        {nav}
      </aside>
    </>
  )
}
