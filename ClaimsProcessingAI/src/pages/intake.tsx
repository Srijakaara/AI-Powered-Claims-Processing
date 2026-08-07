import { useMemo, useState } from 'react'
import { ImageIcon, FileScan, Search, Send, Paperclip, Phone, PhoneCall, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import intakeData from '@/data/intake.json'
import { type Channel, type AiStage, CHANNEL_META } from '@/components/case-meta'
import { ChannelBadge, AiStageBadge } from '@/components/case-badges'

type Message = { from: 'claimant' | 'system'; text: string; at: string }

type Fnol = {
  fnolId: string
  channel: Channel
  claimantName: string
  claimType: string
  receivedAt: string
  photoAI: AiStage
  documentAI: AiStage
  completeness: number
  status: 'Ready for Review' | 'Awaiting Documents' | 'Case Created'
  messages: Message[]
  agentName?: string
  durationSec?: number
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

const intake = intakeData as Fnol[]

const STATUS_TONE: Record<Fnol['status'], string> = {
  'Ready for Review': 'bg-success-100 text-success',
  'Awaiting Documents': 'bg-warning-100 text-warning',
  'Case Created': 'bg-navy-50 text-navy-700',
}

function completenessTone(pct: number) {
  if (pct >= 85) return 'bg-success'
  if (pct >= 50) return 'bg-warning'
  return 'bg-danger'
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p.replace('.', ''))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function IntakePage() {
  const [channelFilter, setChannelFilter] = useState<Channel | null>(null)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return intake.filter((f) => {
      if (channelFilter && f.channel !== channelFilter) return false
      if (query && !f.claimantName.toLowerCase().includes(query.toLowerCase()) && !f.fnolId.toLowerCase().includes(query.toLowerCase())) {
        return false
      }
      return true
    })
  }, [channelFilter, query])

  const selected = useMemo(() => intake.find((f) => f.fnolId === selectedId) ?? null, [selectedId])

  return (
    <div className="flex h-full flex-col">
      {/*Header Intake */}
      <header className="border-b border-[var(--border)] px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold text-[var(--ink)]">Intake</h1>
        <p className="mt-0.5 text-sm text-[var(--ink-muted)]">
          Multi-channel FNOL conversations — app, WhatsApp, and call — with live AI photo and document processing.
        </p>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Conversation list */}
        <div
          className={cn(
            'flex w-full shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] sm:w-80',
            selected && 'hidden sm:flex',
          )}
        >
          <div className="border-b border-[var(--border)] p-3">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search claimant or FNOL ID"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] py-1.5 pl-8 pr-2.5 text-sm text-[var(--ink)] outline-none focus:border-navy-400"
              />
            </div>
            <div className="mt-2.5 flex gap-1.5">
              {(['app', 'whatsapp', 'call'] as Channel[]).map((ch) => {
                const isActive = channelFilter === ch
                const Icon = CHANNEL_META[ch].icon
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannelFilter(isActive ? null : ch)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                      isActive ? 'bg-navy-600 text-white' : 'bg-navy-50 text-navy-700 hover:bg-navy-100',
                    )}
                  >
                    <Icon size={12} />
                    {CHANNEL_META[ch].label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {filtered.map((f) => {
              const Icon = CHANNEL_META[f.channel].icon
              const lastMessage = f.messages[f.messages.length - 1]
              const isSelected = selectedId === f.fnolId
              return (
                <button
                  key={f.fnolId}
                  type="button"
                  onClick={() => setSelectedId(f.fnolId)}
                  className={cn(
                    'flex w-full items-start gap-3 border-b border-[var(--border)] px-3 py-3 text-left transition-colors',
                    isSelected ? 'bg-navy-50' : 'hover:bg-[var(--surface-muted)]',
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-semibold text-navy-700">
                    {initials(f.claimantName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-[var(--ink)]">{f.claimantName}</p>
                      <span className="shrink-0 font-mono text-[10px] text-[var(--ink-muted)]">{formatTime(f.receivedAt)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[var(--ink-muted)]">
                      {f.channel === 'call' && f.durationSec != null
                        ? `Call · ${formatDuration(f.durationSec)}${f.agentName ? ` with ${f.agentName}` : ''}`
                        : lastMessage?.text}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Icon size={11} className="text-navy-600" />
                      <span className="font-mono text-[10px] text-[var(--ink-muted)]">{f.fnolId}</span>
                    </div>
                  </div>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-[var(--ink-muted)]">No conversations found.</p>
            )}
          </div>
        </div>

        {/* Conversation thread */}
        {selected ? (
          <div className="flex min-w-0 flex-1 flex-col bg-[var(--surface-muted)]">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  aria-label="Back to conversations"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] sm:hidden"
                >
                  <ArrowLeft size={16} />
                </button>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-semibold text-navy-700">
                  {initials(selected.claimantName)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">{selected.claimantName}</p>
                  <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)]">
                    <ChannelBadge channel={selected.channel} />
                    <span className="font-mono">{selected.fnolId}</span>
                    <span>&middot; {selected.claimType}</span>
                  </div>
                </div>
              </div>
              <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_TONE[selected.status])}>
                {selected.status}
              </span>
            </div>

            <div className="flex items-center gap-5 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-2.5">
              <AiStageBadge stage={selected.photoAI} icon={ImageIcon} />
              <AiStageBadge stage={selected.documentAI} icon={FileScan} />
              <div className="flex flex-1 items-center gap-2.5">
                <div className="h-1.5 flex-1 max-w-[160px] overflow-hidden rounded-full bg-[var(--surface-muted)]">
                  <div className={cn('h-full rounded-full', completenessTone(selected.completeness))} style={{ width: `${selected.completeness}%` }} />
                </div>
                <span className="font-mono text-xs text-[var(--ink-muted)]">{selected.completeness}% complete</span>
              </div>
            </div>

            {selected.channel === 'call' ? (
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                <div className="mx-auto max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div className="flex items-center gap-2.5 border-b border-[var(--border)] pb-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-100 text-navy-600">
                      <PhoneCall size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--ink)]">Inbound call</p>
                      <p className="text-xs text-[var(--ink-muted)]">
                        {selected.agentName ? `Handled by ${selected.agentName}` : 'IVR-assisted'}
                        {selected.durationSec != null && <> &middot; {formatDuration(selected.durationSec)}</>}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-[var(--ink-muted)]">{formatTime(selected.receivedAt)}</span>
                  </div>

                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">Call transcript</p>
                  <div className="mt-2 flex flex-col gap-3">
                    {selected.messages.map((m, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <span
                          className={cn(
                            'w-16 shrink-0 font-medium',
                            m.from === 'claimant' ? 'text-[var(--ink)]' : 'text-navy-700',
                          )}
                        >
                          {m.from === 'claimant' ? 'Caller' : 'Agent'}
                        </span>
                        <p className="flex-1 text-[var(--ink)]">{m.text}</p>
                        <span className="shrink-0 font-mono text-[10px] text-[var(--ink-muted)]">{formatTime(m.at)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
                {selected.messages.map((m, i) => (
                  <div key={i} className={cn('flex', m.from === 'claimant' ? 'justify-start' : 'justify-end')}>
                    <div
                      className={cn(
                        'max-w-md rounded-2xl px-3.5 py-2 text-sm shadow-sm',
                        m.from === 'claimant'
                          ? 'rounded-tl-sm bg-[var(--surface)] text-[var(--ink)]'
                          : 'rounded-tr-sm bg-navy-600 text-white',
                      )}
                    >
                      <p>{m.text}</p>
                      <p className={cn('mt-1 text-right text-[10px]', m.from === 'claimant' ? 'text-[var(--ink-muted)]' : 'text-navy-100')}>
                        {formatTime(m.at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selected.channel === 'call' ? (
              <div className="flex items-center justify-center gap-2 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs text-[var(--ink-muted)]">
                <Phone size={13} />
                Call ended &middot; transcript is read-only
              </div>
            ) : (
              <div className="flex items-center gap-2 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <button type="button" disabled className="text-[var(--ink-muted)]" aria-label="Attach file">
                  <Paperclip size={18} />
                </button>
                <input
                  disabled
                  placeholder="Read-only in this prototype"
                  className="flex-1 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2 text-sm text-[var(--ink-muted)] outline-none"
                />
                <button type="button" disabled className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-200 text-white">
                  <Send size={15} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--ink-muted)]">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  )
}
