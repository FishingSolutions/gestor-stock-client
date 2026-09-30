// src/components/KpiCard.jsx
const tones = {
    blue: { icon: 'bg-blue-100 text-blue-600', badge: 'bg-blue-50 text-blue-700' },
    amber: { icon: 'bg-amber-100 text-amber-600', badge: 'bg-amber-50 text-amber-700' },
    red: { icon: 'bg-red-100 text-red-600', badge: 'bg-red-100 text-red-700' },
    green: { icon: 'bg-green-100 text-green-600', badge: 'bg-green-100 text-green-700' },
}

export default function KpiCard({ title, value, unit, icon, badge, tone = 'blue' }) {
    const t = tones[tone]
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {title}
                </span>
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.icon}`}>
                    {icon}
                </span>
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
                {value} <span className="text-sm font-normal text-slate-500">{unit}</span>
            </p>

            {badge && (
                <span className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${t.badge}`}>
                    {badge}
                </span>
            )}
        </div>
    )
}