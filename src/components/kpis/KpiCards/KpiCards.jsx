import { Archive, CircleAlert, Layers, TriangleAlert } from 'lucide-react'
import KpiCard from '../KpiCard/KpiCard'

const ICONS = {
  total: Archive,
  units: Layers,
  low: TriangleAlert,
  out: CircleAlert,
}

export default function KpiCards({ items, pending = false, className = '' }) {
  return (
    <div className={`grid grid-cols-2 gap-3 xl:grid-cols-4 ${className}`}>
      {items.map(({ key, ...item }) => {
        const Icon = ICONS[key]

        return (
          <KpiCard
            key={key ?? item.title}
            {...item}
            icon={Icon ? <Icon size={18} /> : null}
            pending={pending}
          />
        )
      })}
    </div>
  )
}
