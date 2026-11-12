export default function ChartEmptyState({ icon, title, hint, className = '' }) {
  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center gap-1.5 px-6 py-10 text-center ${className}`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-cream-200 text-brown-500">
        {icon}
      </span>
      <p className="text-[12.5px] font-semibold text-brown-700">{title}</p>
      {hint && <p className="max-w-xs text-[11px] text-brown-400">{hint}</p>}
    </div>
  )
}
