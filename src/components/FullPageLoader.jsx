import { Loader2 } from 'lucide-react'

export default function FullPageLoader({ label = 'Cargando...' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F8F9FF] text-slate-500">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
