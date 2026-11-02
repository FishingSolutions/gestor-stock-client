import { ChevronDown } from 'lucide-react'
import { selectClassName } from './selectStyles'

export default function CategoryDropdown({
 value,
 onChange,
 categories,
 className = '',
}) {
 return (
  <div className={`relative ${className}`}>
   <select
    aria-label="Filtrar por categoría"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className={`${selectClassName} pr-9`}
   >
    <option value="all">Todas las categorías</option>
    {categories.map((category) => (
     <option key={category} value={category}>
      {category}
     </option>
    ))}
   </select>
   <ChevronDown
    size={15}
    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brown-500"
   />
  </div>
 )
}
