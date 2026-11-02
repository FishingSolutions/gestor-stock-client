import { Eye, MoreVertical, Pencil } from 'lucide-react'

const buttonClassName =
 'inline-flex h-7 w-7 items-center justify-center rounded text-brown-500 transition-colors hover:bg-cream-200 hover:text-brown-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-rust-500/30'

export default function ProductActions({ productName, className = '' }) {
 return (
  <div className={`flex items-center justify-end gap-0.5 ${className}`}>
   <button type="button" aria-label={`Ver ${productName}`} className={buttonClassName}>
    <Eye size={15} />
   </button>
   <button type="button" aria-label={`Editar ${productName}`} className={buttonClassName}>
    <Pencil size={15} />
   </button>
   <button
    type="button"
    aria-label={`Más acciones de ${productName}`}
    className={buttonClassName}
   >
    <MoreVertical size={15} />
   </button>
  </div>
 )
}
