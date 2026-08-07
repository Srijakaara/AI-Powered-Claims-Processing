import { useNavigate } from 'react-router-dom'
import { ShieldCheck, LogOut, PanelLeftClose, PanelLeftOpen, Menu } from 'lucide-react'
import { type AuthedUser, clearAuthedUser, initials } from '@/lib/auth'

export function TopNav({
  user,
  collapsed,
  onToggleCollapsed,
  onOpenMobileMenu,
}: {
  user: AuthedUser
  collapsed: boolean
  onToggleCollapsed: () => void
  onOpenMobileMenu: () => void
}) {
  const navigate = useNavigate()

  function handleSignOut() {
    clearAuthedUser()
    navigate('/login')
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-muted)] transition-colors hover:bg-navy-50 hover:text-navy-700 lg:hidden"
        >
          <Menu size={18} />
        </button>
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-muted)] transition-colors hover:bg-navy-50 hover:text-navy-700 lg:flex"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <div className="flex items-center gap-2 text-sm font-bold tracking-tight text-navy-600">
          <ShieldCheck size={19} />
          TrustShield
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight text-[var(--ink)]">{user.personName}</p>
          <p className="text-xs leading-tight text-[var(--ink-muted)]">{user.label}</p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-semibold text-navy-700">
          {initials(user.personName)}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium text-[var(--ink-muted)] transition-colors hover:border-navy-300 hover:text-navy-700"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </header>
  )
}
