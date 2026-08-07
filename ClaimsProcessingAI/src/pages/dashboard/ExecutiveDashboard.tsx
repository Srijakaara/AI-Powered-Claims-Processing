import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import casesData from '@/data/cases.json'
import decisionData from '@/data/decision.json'
import { type CaseCategory, CATEGORY_META } from '@/components/case-meta'
import { StatusBadge, CategoryBadge } from '@/components/case-badges'

type Case = {
  caseId: string
  category: CaseCategory
  claimType: string
  status: string
  aiConfidence: number
  aiRecommendation: string
  humanAction: string
  overridden: boolean
  receivedAt: string
}

type Decision = {
  claimant: { name: string }
  decision: { pattern: string; reason: string }
}

const cases = casesData as Case[]
const decisions = decisionData as Record<string, Decision>

// PRD Section 3.2 / 15 — POC targets vs. TrustShield's pre-AI baseline.
interface Goal {
  label: string
  baseline: string
  target: string
  claimTypeFilter: 'All' | string
}

const POC_GOALS: Goal[] = [
  { label: 'Motor-claims TAT', baseline: '12 days', target: '3 days', claimTypeFilter: 'Motor' },
  { label: 'Health-claims TAT', baseline: '18 days', target: '7 days', claimTypeFilter: 'Health' },
  { label: 'STP rate', baseline: '14%', target: '42%', claimTypeFilter: 'All' },
  { label: 'Leakage reduction', baseline: 'baseline', target: '−25%', claimTypeFilter: 'All' },
  { label: 'Customer NPS on claims', baseline: 'baseline', target: '+15 pts', claimTypeFilter: 'All' },
]

const CLAIM_TYPES = ['Motor', 'Health']
const CHART_STATUSES = ['Approved', 'Auto-Approved', 'Rejected'] as const
const CHART_COLOR: Record<(typeof CHART_STATUSES)[number], string> = {
  Approved: 'var(--color-success)',
  'Auto-Approved': 'var(--color-navy-500)',
  Rejected: 'var(--color-danger)',
}

// Baseline manual adjudication time vs. AI-assisted review time — drives the
// "Total Hours Saved" headline, so per-row and aggregate numbers agree.
const MANUAL_BASELINE_MIN = 45
const ASSISTED_MIN = 12

type ResolutionMeta =
  | { kind: 'auto' }
  | { kind: 'assisted'; withAi: number; withoutAi: number; saved: number }

function resolutionMeta(status: string): ResolutionMeta {
  if (status === 'Auto-Approved') return { kind: 'auto' }
  return {
    kind: 'assisted',
    withAi: ASSISTED_MIN,
    withoutAi: MANUAL_BASELINE_MIN,
    saved: MANUAL_BASELINE_MIN - ASSISTED_MIN,
  }
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

export default function ExecutiveDashboard() {
  const [claimTypeFilter, setClaimTypeFilter] = useState<'All' | string>('All')

  const resolvedCases = useMemo(() => cases.filter((c) => c.status !== 'Pending'), [])

  const autoResolvedCount = resolvedCases.filter((c) => c.status === 'Auto-Approved').length
  const assistedCount = resolvedCases.length - autoResolvedCount
  const totalMinutesSaved =
    autoResolvedCount * MANUAL_BASELINE_MIN + assistedCount * (MANUAL_BASELINE_MIN - ASSISTED_MIN)
  const totalHours = (totalMinutesSaved / 60).toFixed(1)

  const liveStpRate = resolvedCases.length
    ? Math.round((autoResolvedCount / resolvedCases.length) * 100)
    : 0

  const recentDecisions = useMemo(() => {
    return [...resolvedCases]
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
      .filter((c) => claimTypeFilter === 'All' || c.claimType === claimTypeFilter)
      .slice(0, 8)
  }, [resolvedCases, claimTypeFilter])

  const chartData = CLAIM_TYPES.map((claimType) => {
    const row: Record<string, string | number> = { claimType }
    CHART_STATUSES.forEach((status) => {
      row[status] = resolvedCases.filter((c) => c.claimType === claimType && c.status === status).length
    })
    return row
  })

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--ink)]">Executive Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          POC outcomes at a glance, tied back to the decisions driving them. Refreshes hourly.
        </p>
      </header>

      <div className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-[var(--ink)]">POC Goals (Week-10 Targets)</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {POC_GOALS.map((goal) => {
            const isActive = claimTypeFilter === goal.claimTypeFilter && goal.claimTypeFilter !== 'All'
            return (
              <button
                key={goal.label}
                type="button"
                onClick={() => setClaimTypeFilter(isActive ? 'All' : goal.claimTypeFilter)}
                className={cn(
                  'flex flex-col items-start gap-1 rounded-xl border p-4 text-left shadow-[var(--shadow)] transition-colors',
                  isActive
                    ? 'border-navy-600 bg-navy-50'
                    : 'border-[var(--border)] bg-[var(--surface)] hover:border-navy-300',
                )}
              >
                <span className="text-xl font-bold text-navy-600">{goal.target}</span>
                <span className="text-xs font-medium text-[var(--ink-muted)]">{goal.label}</span>
                <span className="text-[10px] text-[var(--ink-muted)]">from {goal.baseline}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Total Adjudication Hours Saved by AI</h2>
          <div className="mt-2 text-3xl font-bold text-[var(--ink)]">{totalHours} hrs</div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-semibold text-success">{autoResolvedCount}</div>
              <div className="text-xs text-[var(--ink-muted)]">AI auto-resolved &mdash; zero adjuster involvement</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-navy-600">{assistedCount}</div>
              <div className="text-xs text-[var(--ink-muted)]">AI-assisted review &mdash; human signed off</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Live STP Rate</h2>
          <div className="mt-2 text-3xl font-bold text-[var(--ink)]">{liveStpRate}%</div>
          <p className="mt-4 text-xs text-[var(--ink-muted)]">
            Share of decisioned cases resolved straight-through by AI with zero human touch, against a
            POC baseline of 14% and a Week-10 target of 42%.
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
        <h2 className="text-sm font-semibold text-[var(--ink)]">Decisions by Claim Type &amp; Outcome</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="claimType" tick={{ fontSize: 12, fill: 'var(--ink-muted)' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--ink-muted)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {CHART_STATUSES.map((status) => (
                <Bar key={status} dataKey={status} stackId="outcome" fill={CHART_COLOR[status]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Recently Completed Decisions</h2>
          {claimTypeFilter !== 'All' && (
            <button
              type="button"
              onClick={() => setClaimTypeFilter('All')}
              className="flex items-center gap-1 rounded-full bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-600"
            >
              {claimTypeFilter}
              <X size={12} />
            </button>
          )}
        </div>
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">Case</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">Category</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">Claim Type</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">Completed</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">Status</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">Reason</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">AI / Manual &middot; Time</th>
              </tr>
            </thead>
            <tbody>
              {recentDecisions.map((c) => {
                const reason = decisions[c.caseId]?.decision.reason ?? '—'
                const meta = resolutionMeta(c.status)
                return (
                  <tr key={c.caseId} className="border-b border-[var(--border)] last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-[var(--ink)]">
                      {c.caseId}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <CategoryBadge category={c.category} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[var(--ink-muted)]">{c.claimType}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[var(--ink-muted)]">{timeAgo(c.receivedAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="max-w-xs px-4 py-3 text-xs text-[var(--ink-muted)]">{reason}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {meta.kind === 'auto' ? (
                        <span className="inline-block rounded-full bg-navy-50 px-3 py-1 font-mono text-xs font-medium text-navy-600">
                          AI &middot; 0 min
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-block rounded-full bg-navy-50 px-3 py-1 font-mono text-xs font-medium text-navy-600">
                              With AI &middot; {meta.withAi} min
                            </span>
                            <span className="inline-block rounded-full bg-[var(--ink)] px-3 py-1 font-mono text-xs font-medium text-[var(--surface)]">
                              Without AI &middot; {meta.withoutAi} min
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-success">Saved {meta.saved} min</span>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {recentDecisions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-[var(--ink-muted)]">
                    No decisions for this claim type yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
