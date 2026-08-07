import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import {
  ArrowLeft,
  Bot,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  X,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import casesData from '@/data/cases.json'
import decisionData from '@/data/decision.json'

type CaseCategory = 'auto' | 'hitl' | 'exception'

type Case = {
  caseId: string
  category: CaseCategory
  claimType: string
  status: string
  aiConfidence: number
  aiRecommendation: string
  humanAction: string
  overridden: boolean
}

type RuleResult = 'passed' | 'flagged' | 'failed'

type Decision = {
  caseId: string
  claimant: { name: string; policyNumber: string; city: string; claimAmount: number }
  incident: { date: string; description: string }
  rules: { id: string; label: string; result: RuleResult; detail: string }[]
  documents: { id: string; name: string; fileType: string; masked: string; revealed: string }[]
  timeline: { at: string; title: string; actor: string; detail: string }[]
  decision: { pattern: string; patternDescription: string; reason: string }
}

const cases = casesData as Case[]
const decisions = decisionData as Record<string, Decision>

const CATEGORY_META: Record<CaseCategory, { label: string; icon: typeof Bot }> = {
  auto: { label: 'Auto', icon: Bot },
  hitl: { label: 'HITL', icon: Users },
  exception: { label: 'Exception', icon: AlertTriangle },
}

const RULE_META: Record<RuleResult, { label: string; icon: typeof CheckCircle2; tone: string }> = {
  passed: { label: 'Passed', icon: CheckCircle2, tone: 'text-success' },
  flagged: { label: 'Flagged', icon: AlertCircle, tone: 'text-warning' },
  failed: { label: 'Failed', icon: XCircle, tone: 'text-danger' },
}

function currency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`
}

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DocumentRow({ doc }: { doc: Decision['documents'][number] }) {
  const [open, setOpen] = useState(false)
  const [revealed, setRevealed] = useState(false)

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setRevealed(false)
      }}
    >
      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <FileText size={16} className="shrink-0 text-[var(--ink-muted)]" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--ink)]">{doc.name}</p>
            <p className="font-mono text-xs text-[var(--ink-muted)]">{doc.masked}</p>
          </div>
        </div>
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--ink-muted)] hover:border-navy-300 hover:text-navy-700"
          >
            <Eye size={13} />
            View
          </button>
        </Dialog.Trigger>
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] focus:outline-none">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-navy-600" />
              <Dialog.Title className="text-sm font-semibold text-[var(--ink)]">{doc.name}</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="text-[var(--ink-muted)] hover:text-[var(--ink)]"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-1 text-xs text-[var(--ink-muted)]">
            {doc.fileType} document submitted by claimant.
          </Dialog.Description>

          <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-5 text-center">
            <p className="font-mono text-lg tracking-wide text-[var(--ink)]">
              {revealed ? doc.revealed : doc.masked}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
              <ShieldCheck size={13} />
              Sensitive fields are masked by default.
            </p>
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--ink-muted)] hover:border-navy-300 hover:text-navy-700"
            >
              {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
              {revealed ? 'Mask' : 'Reveal'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

type HumanDecision = 'approved' | 'rejected'

function decisionStorageKey(caseId: string) {
  return `trustshield:reviewer-decision:${caseId}`
}

function ReviewerDecisionCard({ c }: { c: Case }) {
  const [decision, setDecision] = useState<HumanDecision | null>(() => {
    const stored = localStorage.getItem(decisionStorageKey(c.caseId))
    return stored === 'approved' || stored === 'rejected' ? stored : null
  })
  const [decidedAt, setDecidedAt] = useState<string | null>(null)

  function decide(next: HumanDecision) {
    setDecision(next)
    setDecidedAt(new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }))
    localStorage.setItem(decisionStorageKey(c.caseId), next)
  }

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--ink)]">Reviewer Decision</h2>
          <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
            AI recommended <span className="font-medium text-[var(--ink)]">{c.aiRecommendation}</span>. Confirm or override below.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => decide('approved')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
              decision === 'approved'
                ? 'border-success bg-success-100 text-success'
                : 'border-[var(--border)] text-[var(--ink-muted)] hover:border-success hover:text-success',
            )}
          >
            <ThumbsUp size={15} />
            Approve
          </button>
          <button
            type="button"
            onClick={() => decide('rejected')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
              decision === 'rejected'
                ? 'border-danger bg-danger-100 text-danger'
                : 'border-[var(--border)] text-[var(--ink-muted)] hover:border-danger hover:text-danger',
            )}
          >
            <ThumbsDown size={15} />
            Reject
          </button>
        </div>
      </div>

      {decision && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
          {decision === 'approved' ? (
            <CheckCircle2 size={13} className="text-success" />
          ) : (
            <XCircle size={13} className="text-danger" />
          )}
          Case {decision} by you{decidedAt ? ` · ${decidedAt}` : ''}.
        </p>
      )}
    </section>
  )
}

export default function DecisionPage() {
  const { caseId } = useParams<{ caseId: string }>()

  const record = useMemo(() => {
    const c = cases.find((x) => x.caseId === caseId)
    const d = caseId ? decisions[caseId] : undefined
    if (!c || !d) return null
    return { c, d }
  }, [caseId])

  if (!record) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:underline">
          <ArrowLeft size={15} /> Back to Cases
        </Link>
        <p className="mt-6 text-sm text-[var(--ink-muted)]">
          No case found for &ldquo;{caseId}&rdquo;.
        </p>
      </div>
    )
  }

  const { c, d } = record
  const CategoryIcon = CATEGORY_META[c.category].icon

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:underline">
        <ArrowLeft size={15} /> Back to Cases
      </Link>

      <header className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-mono text-xl font-semibold text-[var(--ink)]">{c.caseId}</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-medium text-navy-700">
              <CategoryIcon size={12} /> {CATEGORY_META[c.category].label}
            </span>
            <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--ink-muted)]">
              {c.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            {c.claimType} claim &middot; {d.claimant.name} &middot; {d.claimant.city}
          </p>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {c.category !== 'auto' && c.status === 'Pending' && <ReviewerDecisionCard c={c} />}

        {/* Case details */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Case Details</h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-[var(--ink-muted)]">Claimant</dt>
              <dd className="mt-0.5 text-[var(--ink)]">{d.claimant.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--ink-muted)]">Policy Number</dt>
              <dd className="mt-0.5 font-mono text-[var(--ink)]">{d.claimant.policyNumber}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--ink-muted)]">Claim Amount</dt>
              <dd className="mt-0.5 font-mono text-[var(--ink)]">{currency(d.claimant.claimAmount)}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--ink-muted)]">Incident Date</dt>
              <dd className="mt-0.5 text-[var(--ink)]">{d.incident.date}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-[var(--ink-muted)]">Description</dt>
              <dd className="mt-0.5 text-[var(--ink)]">{d.incident.description}</dd>
            </div>
          </dl>
        </section>

        {/* Rules */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Rule Evaluation</h2>
          <ul className="mt-3 flex flex-col gap-2.5">
            {d.rules.map((rule) => {
              const meta = RULE_META[rule.result]
              const Icon = meta.icon
              return (
                <li key={rule.id} className="flex items-start gap-2.5">
                  <Icon size={16} className={cn('mt-0.5 shrink-0', meta.tone)} />
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--ink)]">{rule.label}</p>
                    <p className="text-xs text-[var(--ink-muted)]">{rule.detail}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Documents */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] lg:col-span-2">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Submitted Documents</h2>
          <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
            Sensitive fields are masked by default. Click view to reveal.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {d.documents.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} />
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Case Timeline</h2>
          <ol className="mt-3 flex flex-col gap-4">
            {d.timeline.map((event, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-600">
                    <Clock size={13} />
                  </span>
                  {i < d.timeline.length - 1 && <span className="mt-1 w-px flex-1 bg-[var(--border)]" />}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-medium text-[var(--ink)]">{event.title}</p>
                  <p className="text-xs text-[var(--ink-muted)]">
                    {formatTimestamp(event.at)} &middot; {event.actor}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{event.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Decision pattern & reasoning */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
            <Sparkles size={15} className="text-navy-600" />
            Decision Pattern &amp; Reasoning
          </h2>

          <div className="mt-3 rounded-lg bg-navy-50 px-3.5 py-3">
            <p className="text-sm font-medium text-navy-700">{d.decision.pattern}</p>
            <p className="mt-1 text-xs text-navy-700/80">{d.decision.patternDescription}</p>
          </div>

          <div className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-[var(--ink-muted)]">AI Confidence</dt>
              <dd className="mt-0.5 font-mono font-medium text-[var(--ink)]">{c.aiConfidence}%</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--ink-muted)]">Routed As</dt>
              <dd className="mt-0.5 text-[var(--ink)]">{CATEGORY_META[c.category].label}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--ink-muted)]">AI Recommendation</dt>
              <dd className="mt-0.5 text-[var(--ink)]">{c.aiRecommendation}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--ink-muted)]">Final Action</dt>
              <dd className={cn('mt-0.5 font-medium', c.overridden ? 'text-warning' : 'text-[var(--ink)]')}>
                {c.humanAction}
              </dd>
            </div>
          </div>

          <p className="mt-3.5 text-xs leading-relaxed text-[var(--ink-muted)]">{d.decision.reason}</p>
        </section>
      </div>
    </div>
  )
}
