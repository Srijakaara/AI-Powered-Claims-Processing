import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import rolesData from '@/data/roles.json'
import { setAuthedUser, type RoleId } from '@/lib/auth'

type Role = {
  id: RoleId
  label: string
  personName: string
  channel: string
  email: string
  password: string
  route: string
  implemented: boolean
}

const roles = rolesData as Role[]

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  function signInWith(targetEmail: string, targetPassword: string) {
    const match = roles.find(
      (r) => r.email.toLowerCase() === targetEmail.trim().toLowerCase() && r.password === targetPassword,
    )
    if (!match) {
      setError('Invalid email or password.')
      return
    }
    setError(null)
    setAuthedUser({
      id: match.id,
      label: match.label,
      personName: match.personName,
      email: match.email,
      route: match.route,
    })
    navigate(match.route)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    signInWith(email, password)
  }

  function handleRoleQuickSelect(role: Role) {
    setEmail(role.email)
    setPassword(role.password)
    setError(null)
  }

  return (
    <div className="grid min-h-svh grid-cols-1 lg:grid-cols-2">
      {/* Left: brand */}
      <div className="flex flex-col justify-center bg-navy-600 px-6 py-16 text-white lg:px-10">
        <div className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <ShieldCheck size={22} />
          TrustShield
        </div>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-100">
          AI-powered claims processing and settlement — triage, review, and audit every claim from one
          compounding intelligence layer.
        </p>
      </div>

      {/* Right: sign in */}
      <div className="flex flex-col justify-center px-6 py-16 lg:px-10">
        <div className="mx-auto w-full max-w-lg">
          <h1 className="text-xl font-semibold text-[var(--ink)]">Sign in to your account</h1>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">Enter your credentials to continue.</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="text-xs font-medium text-[var(--ink-muted)]">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@trustshield.ai"
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--ink)] outline-none focus:border-navy-400"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-medium text-[var(--ink-muted)]">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--ink)] outline-none focus:border-navy-400"
              />
            </div>

            {error && <p className="text-xs font-medium text-danger">{error}</p>}

            <button
              type="submit"
              className="mt-1 rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-700"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">Demo roles</p>
            <p className="mt-1 text-xs text-[var(--ink-muted)]">
              Pick a role to auto-fill its credentials, then click Sign In.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleQuickSelect(role)}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3.5 py-2.5 text-left text-sm text-[var(--ink)] transition-colors hover:border-navy-300 hover:bg-navy-50"
                >
                  <span className="font-medium">{role.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
