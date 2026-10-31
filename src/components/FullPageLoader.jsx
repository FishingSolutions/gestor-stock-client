import { Loader2 } from 'lucide-react'

export default function FullPageLoader({ label = 'Cargando...' }) {
 return (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas text-brown-600">
   <Loader2 className="h-8 w-8 animate-spin text-rust-600" aria-hidden="true" />
   <p className="text-sm">{label}</p>
  </div>
 )
}
