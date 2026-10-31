// src/components/KpiCard.jsx
const tones = {
    blue: { icon: 'bg-cream-200 text-rust-600', badge: 'bg-cream-100 text-rust-700' },
    amber: { icon: 'bg-stock-amber-bg text-stock-amber', badge: 'bg-stock-amber-bg text-stock-amber' },
    red: { icon: 'bg-stock-red-bg text-wine-600', badge: 'bg-stock-red-bg text-wine-600' },
    green: { icon: 'bg-stock-green-bg text-stock-green', badge: 'bg-stock-green-bg text-stock-green' },
}

export default function KpiCard({ title, value, unit, icon, badge, tone = 'blue' }) {
    const t = tones[tone]
    return (
        <div className="rounded-lg bg-white p-5">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-brown-500">
                    {title}
                </span>
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.icon}`}>
                    {icon}
                </span>
            </div>

            <p className="mt-3 text-3xl font-bold text-brown-900">
                {value} <span className="text-sm font-normal text-brown-500">{unit}</span>
            </p>

            {badge && (
                <span className={`mt-3 inline-block rounded px-2.5 py-0.5 text-xs font-medium ${t.badge}`}>
                    {badge}
                </span>
            )}
        </div>
    )
}
