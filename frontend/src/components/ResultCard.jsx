const COLORS = {
  blue: {
    ring:  'border-blue-800/40',
    glow:  'bg-blue-950/30',
    value: 'text-blue-300',
    label: 'text-blue-500/80',
  },
  red: {
    ring:  'border-red-800/40',
    glow:  'bg-red-950/30',
    value: 'text-red-300',
    label: 'text-red-500/80',
  },
  amber: {
    ring:  'border-amber-800/40',
    glow:  'bg-amber-950/30',
    value: 'text-amber-300',
    label: 'text-amber-500/80',
  },
  emerald: {
    ring:  'border-emerald-800/40',
    glow:  'bg-emerald-950/30',
    value: 'text-emerald-300',
    label: 'text-emerald-500/80',
  },
}

export default function ResultCard({ label, value, sub, color = 'blue' }) {
  const c = COLORS[color]
  return (
    <div className={`rounded-2xl border ${c.ring} ${c.glow} px-5 py-5 flex flex-col gap-1`}>
      <p className={`text-xs font-semibold uppercase tracking-widest ${c.label}`}>{label}</p>
      <p className={`font-display text-5xl font-semibold leading-none ${c.value}`}>{value}</p>
      <p className="text-xs text-slate-600 mt-1">{sub}</p>
    </div>
  )
}
