import { useNavigate } from 'react-router-dom'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  Radio,
  Scale,
  ShieldAlert,
  Database as MemoryIcon,
  LineChart as LineChartIcon,
  ShieldCheck,
  Database,
  Image,
  FileHeart,
  NotebookPen,
  Server,
  Plug,
} from 'lucide-react'
import { Footer } from '@/components/layout/Footer'

const TAT_TREND = [
  { month: 'Mar', tat: 15.2 },
  { month: 'Apr', tat: 14.1 },
  { month: 'May', tat: 13.0 },
  { month: 'Jun', tat: 11.6 },
  { month: 'Jul', tat: 10.4 },
  { month: 'Aug', tat: 9.3 },
]

const PILLARS = [
  {
    icon: Radio,
    title: 'Intake Intelligence',
    description:
      'Multi-channel intake (app, WhatsApp, call) with instant FNOL capture, damage-photo AI, and document auto-read.',
  },
  {
    icon: Scale,
    title: 'Adjudication Automation',
    description:
      'Rules + ML adjudicate simple claims end-to-end; complex claims routed to an adjuster with pre-work done.',
  },
  {
    icon: ShieldAlert,
    title: 'Leakage Prevention',
    description: 'Pattern detection on over-billing, inflated repair quotes, and duplicate submissions.',
  },
  {
    icon: MemoryIcon,
    title: 'Settlement Memory',
    description: 'Every settled claim, adjudication decision, and dispute outcome enriches the model.',
  },
]

const PILLAR_GUARANTEES = [
  { icon: LineChartIcon, label: 'Executive KPI visibility on every pillar' },
  { icon: ShieldCheck, label: 'Auditor-replayable with rationale + model version' },
]

const DATA_GROUPS = [
  {
    title: 'Ingested into Compounding Memory',
    items: [
      { icon: Database, label: 'Claims + Policy DB' },
      { icon: Image, label: 'Damage Photos + Invoices' },
      { icon: FileHeart, label: 'Medical Reports + Hospital Bills' },
      { icon: ShieldAlert, label: 'Fraud-Indicator History' },
      { icon: NotebookPen, label: 'Adjuster Notes' },
    ],
  },
  {
    title: 'Source Systems of Record',
    items: [
      { icon: Server, label: 'Majesco Policy' },
      { icon: Server, label: 'Guidewire ClaimCenter' },
      { icon: Server, label: 'Custom Fraud Rules Engine' },
      { icon: Server, label: 'SAP S/4HANA' },
      { icon: Server, label: 'Qlik BI' },
      { icon: Server, label: 'ServiceNow' },
    ],
  },
  {
    title: 'Integration Channels',
    items: [
      { icon: Plug, label: 'Guidewire ClaimCenter' },
      { icon: Plug, label: 'Majesco Policy' },
      { icon: Plug, label: 'Network-Hospital APIs (Health)' },
      { icon: Plug, label: 'Workshop-Estimate Platforms (Motor)' },
      { icon: Plug, label: 'UPI + NEFT for Payouts' },
    ],
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-svh bg-[var(--surface-muted)]">
      <nav className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="text-lg font-bold tracking-tight text-navy-600">TrustShield</div>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="rounded-lg bg-navy-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-700"
          >
            Sign In
          </button>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-14 lg:px-10 lg:py-24">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-[var(--ink)] sm:text-4xl lg:text-5xl">
            AI-Powered Claims Processing &amp; Settlement
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--ink-muted)] lg:mt-5 lg:text-base">
            TrustShield triages every motor and health claim the moment it's reported, scores it with AI
            confidence, and routes it straight through, to a reviewer, or to an investigator — cutting
            turnaround time and leakage while your team handles rising volume at flat headcount.
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:p-7">
          <p className="text-sm font-medium text-[var(--ink)]">Average Claim TAT (days)</p>
          <p className="text-xs text-[var(--ink-muted)]">Trending down as pattern intelligence compounds</p>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TAT_TREND} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tatFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--ink-muted)', fontSize: 12 }}
                />
                <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${value} days`, 'Avg TAT']}
                />
                <Area
                  type="monotone"
                  dataKey="tat"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fill="url(#tatFill)"
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
        <h2 className="text-xl font-semibold text-[var(--ink)] sm:text-2xl">Built around four solution pillars</h2>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Each pillar is an independent workstream, unified by a shared Compounding Memory layer.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {PILLARS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] lg:p-7">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                <Icon size={20} />
              </span>
              <p className="mt-4 text-sm font-semibold text-[var(--ink)]">{title}</p>
              <p className="mt-2 text-xs leading-relaxed text-[var(--ink-muted)]">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-navy-50 p-4 sm:flex-row sm:items-center sm:gap-8 lg:p-5">
          {PILLAR_GUARANTEES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs font-medium text-navy-700">
              <Icon size={14} />
              {label}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
        <h2 className="text-xl font-semibold text-[var(--ink)] sm:text-2xl">Data Resources</h2>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">The signals the AI reasons over for every claim.</p>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5">
          {DATA_GROUPS.map(({ title, items }) => (
            <div key={title} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] lg:p-7">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">{title}</p>
              <ul className="mt-4 flex flex-col gap-3">
                {items.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2 text-sm text-[var(--ink)]">
                    <Icon size={14} className="shrink-0 text-navy-600" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="rounded-2xl bg-navy-600 px-6 py-10 text-center text-white sm:px-16 lg:py-16">
          <h2 className="text-xl font-semibold sm:text-2xl lg:text-3xl">Ready to see it in action?</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-navy-100">
            Sign in to explore the operational workbench.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-6 rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-navy-700 transition-colors hover:bg-navy-50 lg:mt-7"
          >
            Sign In
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
