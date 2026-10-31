export default function StockTag({ level, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold ${level.chipClassName} ${level.textClassName} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${level.dotClassName}`} />
      {level.label}
    </span>
  )
}
