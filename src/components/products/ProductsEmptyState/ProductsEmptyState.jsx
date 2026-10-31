import { SearchX } from 'lucide-react'

export default function ProductsEmptyState({
 title = 'No encontramos productos',
 description = 'Probá con otra búsqueda, categoría o estado.',
 actionLabel,
 onAction,
}) {
 return (
  <div className="flex flex-col items-center justify-center rounded-lg bg-white px-6 py-16 text-center">
   <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-200 text-brown-500">
    <SearchX size={22} />
   </div>
   <h2 className="mt-4 text-base font-semibold text-brown-900">{title}</h2>
   <p className="mt-1 max-w-sm text-sm text-brown-600">{description}</p>
   {actionLabel && onAction && (
    <button
     type="button"
     onClick={onAction}
     className="mt-5 rounded bg-rust-600 px-4 py-2 text-sm font-semibold text-cream-50 transition-colors hover:bg-rust-700"
    >
     {actionLabel}
    </button>
   )}
  </div>
 )
}
