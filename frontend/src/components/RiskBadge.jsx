const LEVELS = {
  ALTO:  { bg: 'bg-red-950/60',     text: 'text-red-400',     border: 'border-red-800/60',     dot: 'bg-red-400' },
  MEDIO: { bg: 'bg-amber-950/60',   text: 'text-amber-400',   border: 'border-amber-800/60',   dot: 'bg-amber-400' },
  BAJO:  { bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/60', dot: 'bg-emerald-400' },
  ERROR: { bg: 'bg-slate-800/60',   text: 'text-slate-400',   border: 'border-slate-700/60',   dot: 'bg-slate-400' },
}

export default function RiskBadge({ level }) {
  const c = LEVELS[level] ?? LEVELS.ERROR
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border tracking-wide ${c.bg} ${c.text} ${c.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {level}
    </span>
  )
}
