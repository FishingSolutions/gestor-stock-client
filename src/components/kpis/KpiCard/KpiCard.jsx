const tones = {
  blue: { icon: 'bg-cream-200 text-rust-600', badge: 'bg-cream-100 text-rust-700' },
  amber: { icon: 'bg-stock-amber-bg text-stock-amber', badge: 'bg-stock-amber-bg text-stock-amber' },
  red: { icon: 'bg-stock-red-bg text-wine-600', badge: 'bg-stock-red-bg text-wine-600' },
  green: { icon: 'bg-stock-green-bg text-stock-green', badge: 'bg-stock-green-bg text-stock-green' },
}

export default function KpiCard({
  title,
  value,
  unit,
  icon,
  badge,
  tone = 'blue',
  pending = false,
}) {
  const t = tones[tone] ?? tones.blue

  return (
    <div className="min-w-0 rounded-lg bg-white p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10.5px] font-semibold uppercase tracking-wide text-brown-500 sm:text-[11px]">
          {title}
        </span>
        <span
          className={`hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:flex ${t.icon}`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-1.5 text-[22px] font-bold leading-tight tabular-nums text-brown-900 sm:text-2xl">
        {pending ? '—' : value}{' '}
        {unit && (
          <span className="text-[11px] font-normal text-brown-500 sm:text-xs">{unit}</span>
        )}
      </p>

      {badge && !pending && (
        <span
          className={`mt-2 hidden rounded px-2 py-0.5 text-[10.5px] font-medium sm:inline-block ${t.badge}`}
        >
          {badge}
        </span>
      )}
    </div>
  )
}
