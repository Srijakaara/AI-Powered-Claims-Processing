import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Bot, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import casesData from '@/data/cases.json'
import decisionData from '@/data/decision.json'
import { type CaseCategory, type Channel, type AiStage } from '@/components/case-meta'
import {
  ConfidenceBar,
  CategoryBadge,
  ChannelBadge,
  StatusBadge,
  OverrideBadge,
} from '@/components/case-badges'

type Case = {
  caseId: string
  category: CaseCategory
  claimType: string
  status: string
  aiConfidence: number
  aiRecommendation: string
  humanAction: string
  overridden: boolean
  fnolId: string
  channel: Channel
  receivedAt: string
  photoAI: AiStage
  documentAI: AiStage
}

type Decision = {
  claimant: { name: string }
}

const cases = casesData as Case[]
const decisions = decisionData as Record<string, Decision>

const STATUS_CARDS = [
  { status: 'Approved', label: 'Approved', icon: CheckCircle2, tone: 'text-success' },
  { status: 'Auto-Approved', label: 'Auto-Approved', icon: Bot, tone: 'text-success' },
  { status: 'Rejected', label: 'Rejected', icon: XCircle, tone: 'text-danger' },
] as const

function formatReceived(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function Auditor() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const counts = useMemo(() => {
    return STATUS_CARDS.reduce(
      (acc, { status }) => {
        acc[status] = cases.filter((c) => c.status === status).length
        return acc
      },
      {} as Record<string, number>,
    )
  }, [])

  const visibleCases = useMemo(() => {
    return cases.filter((c) => {
      if (c.status === 'Pending') return false
      if (statusFilter && c.status !== statusFilter) return false
      return true
    })
  }, [statusFilter])

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--ink)]">Auditor Console</h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Review decisioned claims across auto and human-reviewed pathways.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATUS_CARDS.map(({ status, label, icon: Icon, tone }) => {
          const isActive = statusFilter === status
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(isActive ? null : status)}
              className={cn(
                'flex items-start justify-between rounded-xl border px-5 py-4 text-left shadow-[var(--shadow)] transition-colors',
                isActive
                  ? 'border-navy-600 bg-navy-50'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:border-navy-300',
              )}
            >
              <div>
                <p className="text-sm font-medium text-[var(--ink-muted)]">{label}</p>
                <p className="mt-2 font-mono text-3xl font-semibold text-[var(--ink)]">{counts[status]}</p>
              </div>
              <Icon size={20} className={isActive ? 'text-navy-600' : tone} />
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-[var(--ink-muted)]">
          {statusFilter ?? 'All decisioned'} cases
          <span className="ml-2 font-mono text-[var(--ink)]">{visibleCases.length}</span>
        </h2>

        {statusFilter && (
          <button
            type="button"
            onClick={() => setStatusFilter(null)}
            className="text-sm font-medium text-navy-600 hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
              <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">FNOL ID</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">Channel</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">Received</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">Claimant</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">Case ID</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">Category</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">Claim Type</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">Status</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">AI Confidence</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">Overridden</th>
            </tr>
          </thead>
          <tbody>
            {visibleCases.map((c) => (
              <tr
                key={c.caseId}
                onClick={() => navigate(`/dashboard/cases/${c.caseId}`)}
                className="cursor-pointer border-b border-[var(--border)] transition-colors last:border-0 hover:bg-navy-50"
              >
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[var(--ink-muted)]">{c.fnolId}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <ChannelBadge channel={c.channel} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[var(--ink-muted)]">
                  {formatReceived(c.receivedAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-[var(--ink)]">
                  {decisions[c.caseId]?.claimant.name ?? '—'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-[var(--ink)]">{c.caseId}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <CategoryBadge category={c.category} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-[var(--ink)]">{c.claimType}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <ConfidenceBar confidence={c.aiConfidence} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <OverrideBadge overridden={c.overridden} />
                </td>
              </tr>
            ))}
            {visibleCases.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-[var(--ink-muted)]">
                  No cases found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
