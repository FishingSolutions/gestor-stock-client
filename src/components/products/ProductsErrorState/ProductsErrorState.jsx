import { AlertTriangle } from 'lucide-react'

export default function ProductsErrorState({ error, onRetry }) {
 const message =
  typeof error === 'string'
   ? error
   : error?.message || 'Revisá la conexión con Supabase e intentá de nuevo.'

 return (
  <div className="flex flex-col items-center rounded-lg bg-white px-6 py-12 text-center">
   <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stock-red-bg text-wine-600">
    <AlertTriangle size={22} />
   </div>
   <h2 className="mt-4 text-base font-semibold text-brown-900">
    No pudimos cargar los productos
   </h2>
   <p className="mt-1 max-w-lg text-sm text-brown-600">{message}</p>
   {error?.hint && (
    <p className="mt-2 max-w-lg text-xs text-brown-500">{error.hint}</p>
   )}
   <button
    type="button"
    onClick={onRetry}
    className="mt-5 rounded bg-rust-600 px-4 py-2 text-sm font-semibold text-cream-50 transition-colors hover:bg-rust-700"
   >
    Reintentar
   </button>
  </div>
 )
}
