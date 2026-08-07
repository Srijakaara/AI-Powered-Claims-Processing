import { useState } from 'react'
import { UserPlus, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type RoleId = 'operational' | 'auditor' | 'executive' | 'admin'
type UserStatus = 'Active' | 'Suspended'

type User = {
  id: string
  username: string
  email: string
  role: RoleId
  status: UserStatus
}

const ROLE_OPTIONS: { id: RoleId; label: string }[] = [
  { id: 'operational', label: 'Operational User' },
  { id: 'auditor', label: 'Auditor' },
  { id: 'executive', label: 'Executive Sponsor' },
  { id: 'admin', label: 'Admin' },
]

const ROLE_LABEL: Record<RoleId, string> = Object.fromEntries(
  ROLE_OPTIONS.map((r) => [r.id, r.label]),
) as Record<RoleId, string>

const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'A. Verma', email: 'operational@trustshield.ai', role: 'operational', status: 'Active' },
  { id: 'u2', username: 'S. Kapoor', email: 'auditor@trustshield.ai', role: 'auditor', status: 'Active' },
  { id: 'u3', username: 'R. Malhotra', email: 'executive@trustshield.ai', role: 'executive', status: 'Active' },
  { id: 'u4', username: 'N. Sinha', email: 'admin@trustshield.ai', role: 'admin', status: 'Active' },
]

type ClaimClass = { id: string; label: string; description: string }

const CLAIM_CLASSES: ClaimClass[] = [
  { id: 'motor', label: 'Motor', description: 'Auto-settle straight-through motor claims' },
  { id: 'health', label: 'Health', description: 'Auto-settle straight-through health claims' },
]

type EnvelopeSetting = { enabled: boolean; threshold: number }

type ReleaseGateRow = {
  model: string
  version: string
  modelCard: string
  biasReport: 'Passed' | 'Flagged'
  released: boolean
}

const RELEASE_GATE_ROWS: ReleaseGateRow[] = [
  { model: 'Triage Classifier', version: 'v3.2.1', modelCard: 'View', biasReport: 'Passed', released: true },
  { model: 'Document Extractor', version: 'v2.5.0', modelCard: 'View', biasReport: 'Passed', released: true },
  { model: 'Auto-Approve Scorer', version: 'v4.0.0', modelCard: 'View', biasReport: 'Flagged', released: false },
]

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
      <h2 className="text-sm font-semibold text-[var(--ink)]">{title}</h2>
      <div className="mt-3.5">{children}</div>
    </section>
  )
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<RoleId>('operational')

  const [envelope, setEnvelope] = useState<Record<string, EnvelopeSetting>>({
    motor: { enabled: true, threshold: 90 },
    health: { enabled: true, threshold: 90 },
  })

  const [gateRows, setGateRows] = useState<ReleaseGateRow[]>(RELEASE_GATE_ROWS)

  function handleAddUser() {
    if (!username.trim() || !email.trim()) return
    setUsers((prev) => [
      ...prev,
      { id: `u${prev.length + 1}-${Date.now()}`, username: username.trim(), email: email.trim(), role, status: 'Active' },
    ])
    setUsername('')
    setEmail('')
  }

  function toggleUserStatus(id: string) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u)),
    )
  }

  function toggleClaimClass(id: string) {
    setEnvelope((prev) => ({ ...prev, [id]: { ...prev[id], enabled: !prev[id].enabled } }))
  }

  function setClaimClassThreshold(id: string, threshold: number) {
    setEnvelope((prev) => ({ ...prev, [id]: { ...prev[id], threshold } }))
  }

  function toggleGateRelease(index: number) {
    setGateRows((prev) => prev.map((r, i) => (i === index ? { ...r, released: !r.released } : r)))
  }

  function rollbackGate(index: number) {
    setGateRows((prev) => prev.map((r, i) => (i === index ? { ...r, released: false } : r)))
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--ink)]">Admin Console</h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Manage users, autonomy boundaries, and model release gates.
        </p>
      </header>

      <SectionCard title="Users & Roles">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs font-medium text-[var(--ink-muted)]">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Full name"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--ink)] outline-none focus:border-navy-400"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-[var(--ink-muted)]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@trustshield.ai"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--ink)] outline-none focus:border-navy-400"
            />
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs font-medium text-[var(--ink-muted)]">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as RoleId)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--ink)] outline-none focus:border-navy-400"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleAddUser}
            className="flex items-center gap-1.5 rounded-lg bg-navy-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-700"
          >
            <UserPlus size={15} />
            Add User
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">User Name</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">Role</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">Email</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--ink)]">{u.username}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--ink)]">{ROLE_LABEL[u.role]}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--ink-muted)]">{u.email}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleUserStatus(u.id)}
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                        u.status === 'Active'
                          ? 'bg-success-100 text-success hover:bg-success-100/70'
                          : 'bg-danger-100 text-danger hover:bg-danger-100/70',
                      )}
                    >
                      {u.status === 'Active' ? 'Active' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[var(--ink-muted)]">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Autonomy Envelope">
          <p className="text-xs text-[var(--ink-muted)]">
            Toggle which claim classes are eligible for AI straight-through auto-approval, and set the minimum AI
            confidence required to auto-settle without human review.
          </p>
          <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CLAIM_CLASSES.map((claimClass) => {
              const setting = envelope[claimClass.id]
              const enabled = setting.enabled
              return (
                <div
                  key={claimClass.id}
                  className={cn(
                    'overflow-hidden rounded-lg border transition-colors',
                    enabled ? 'border-navy-300 bg-navy-50' : 'border-[var(--border)] bg-[var(--surface)]',
                  )}
                >
                  <div className="flex items-start justify-between gap-3 px-3.5 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--ink)]">{claimClass.label}</p>
                      <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{claimClass.description}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      onClick={() => toggleClaimClass(claimClass.id)}
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 items-center overflow-hidden rounded-full p-0.5 transition-colors',
                        enabled ? 'bg-navy-600' : 'bg-[var(--border)]',
                      )}
                    >
                      <span
                        className={cn(
                          'h-5 w-5 shrink-0 rounded-full bg-white shadow transition-transform',
                          enabled ? 'translate-x-5' : 'translate-x-0',
                        )}
                      />
                    </button>
                  </div>

                  <label
                    className={cn(
                      'flex items-center justify-between gap-3 border-t px-3.5 py-2.5 text-xs',
                      enabled ? 'border-navy-200/70' : 'border-[var(--border)]',
                    )}
                  >
                    <span className={enabled ? 'text-[var(--ink)]' : 'text-[var(--ink-muted)]'}>
                      Auto-approve threshold
                    </span>
                    <span className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        disabled={!enabled}
                        value={setting.threshold}
                        onChange={(e) =>
                          setClaimClassThreshold(claimClass.id, Math.min(100, Math.max(0, Number(e.target.value))))
                        }
                        className="w-14 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-right font-mono text-xs font-medium text-[var(--ink)] outline-none focus:border-navy-400 disabled:opacity-50"
                      />
                      <span className="font-mono text-[var(--ink-muted)]">% conf.</span>
                    </span>
                  </label>
                </div>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard title="Release Gate">
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                  <th className="whitespace-nowrap px-3 py-2.5 font-medium text-[var(--ink-muted)]">Model</th>
                  <th className="whitespace-nowrap px-3 py-2.5 font-medium text-[var(--ink-muted)]">Version</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-center font-medium text-[var(--ink-muted)]">Model Card</th>
                  <th className="whitespace-nowrap px-3 py-2.5 font-medium text-[var(--ink-muted)]">Bias Report</th>
                  <th className="whitespace-nowrap px-3 py-2.5 font-medium text-[var(--ink-muted)]">Rollback</th>
                  <th className="whitespace-nowrap px-3 py-2.5 font-medium text-[var(--ink-muted)]">Gate Release</th>
                </tr>
              </thead>
              <tbody>
                {gateRows.map((row, i) => (
                  <tr key={row.model} className="border-b border-[var(--border)] last:border-0">
                    <td className="whitespace-nowrap px-3 py-2.5 text-[var(--ink)]">{row.model}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-[var(--ink-muted)]">
                      {row.version}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-center">
                      <button
                        type="button"
                        aria-label="View model card"
                        className="inline-flex items-center justify-center text-success hover:text-success/80"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                          row.biasReport === 'Passed' ? 'bg-success-100 text-success' : 'bg-warning-100 text-warning',
                        )}
                      >
                        {row.biasReport === 'Passed' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                        {row.biasReport}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => rollbackGate(i)}
                        className="flex items-center gap-1 rounded-md border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--ink-muted)] hover:border-navy-300 hover:text-navy-700"
                      >
                        <RotateCcw size={12} />
                        Rollback
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => toggleGateRelease(i)}
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                          row.released
                            ? 'bg-success-100 text-success hover:bg-success-100/70'
                            : 'bg-[var(--surface-muted)] text-[var(--ink-muted)] hover:text-navy-700',
                        )}
                      >
                        {row.released ? 'Released' : 'Gated'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
