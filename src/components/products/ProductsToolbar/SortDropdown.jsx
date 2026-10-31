import { ArrowUpDown, ChevronDown } from 'lucide-react'
import { selectClassName } from './selectStyles'

export default function SortDropdown({ value, onChange, className = '' }) {
 return (
  <div className={`relative ${className}`}>
   <ArrowUpDown
    size={15}
    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brown-500"
   />
   <select
    aria-label="Ordenar productos"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className={`${selectClassName} pl-9 pr-9`}
   >
    <option value="recent">Ordenar: recientes</option>
    <option value="name">Nombre A–Z</option>
    <option value="stock-desc">Stock: mayor a menor</option>
    <option value="stock-asc">Stock: menor a mayor</option>
    <option value="price-desc">Precio: mayor a menor</option>
   </select>
   <ChevronDown
    size={15}
    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brown-500"
   />
  </div>
 )
}
