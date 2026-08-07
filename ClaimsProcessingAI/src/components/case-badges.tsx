import { CheckCircle2, Clock, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type CaseCategory,
  type Channel,
  type AiStage,
  CATEGORY_META,
  CHANNEL_META,
  STATUS_TONE,
  confidenceTone,
  confidenceBarTone,
} from '@/components/case-meta'

export function ConfidenceBar({ confidence }: { confidence: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div className={cn('h-full rounded-full', confidenceBarTone(confidence))} style={{ width: `${confidence}%` }} />
      </div>
      <span className={cn('font-mono text-xs font-medium', confidenceTone(confidence))}>{confidence}%</span>
    </div>
  )
}

export function CategoryBadge({ category }: { category: CaseCategory }) {
  const { label, icon: Icon } = CATEGORY_META[category]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-medium text-navy-700">
      <Icon size={12} strokeWidth={2} />
      {label}
    </span>
  )
}

export function ChannelBadge({ channel }: { channel: Channel }) {
  const { label, icon: Icon } = CHANNEL_META[channel]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-medium text-navy-700">
      <Icon size={12} strokeWidth={2} />
      {label}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_TONE[status] ?? 'border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--ink-muted)]',
      )}
    >
      {status}
    </span>
  )
}

export function OverrideBadge({ overridden }: { overridden: boolean }) {
  if (!overridden) {
    return (
      <span className="inline-flex items-center rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success">
        No
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-warning-100 px-2.5 py-0.5 text-xs font-medium text-warning">
      Yes
    </span>
  )
}

export function AiStageBadge({ stage, icon: Icon }: { stage: AiStage; icon: typeof CheckCircle2 }) {
  const tone =
    stage === 'Processed' || stage === 'Extracted'
      ? 'text-success'
      : stage === 'Pending'
        ? 'text-warning'
        : 'text-[var(--ink-muted)]'
  const StatusIcon = stage === 'Processed' || stage === 'Extracted' ? CheckCircle2 : stage === 'Pending' ? Clock : Ban
  return (
    <span className={cn('flex items-center gap-1.5 whitespace-nowrap text-xs font-medium', tone)}>
      <Icon size={13} className="shrink-0" />
      {stage}
      <StatusIcon size={12} className="shrink-0" />
    </span>
  )
}
