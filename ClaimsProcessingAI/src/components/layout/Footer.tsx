export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="text-sm font-bold tracking-tight text-navy-600">TrustShield</div>
        <p className="text-xs text-[var(--ink-muted)]">
          AI-powered claims processing &amp; settlement &middot; Kaara Compounding Build
        </p>
        <p className="text-xs text-[var(--ink-muted)]">&copy; {new Date().getFullYear()} TrustShield. Prototype build.</p>
      </div>
    </footer>
  )
}
