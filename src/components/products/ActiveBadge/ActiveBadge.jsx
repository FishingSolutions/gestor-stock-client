export default function ActiveBadge({ activo }) {
  if (activo) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded bg-stock-green-bg px-2 py-0.5 text-[11px] font-bold text-stock-green">
        <span className="h-1.5 w-1.5 rounded-full bg-stock-green" />
        Activo
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded bg-cream-200 px-2 py-0.5 text-[11px] font-bold text-brown-500">
      <span className="h-1.5 w-1.5 rounded-full bg-brown-400" />
      Inactivo
    </span>
  )
}
