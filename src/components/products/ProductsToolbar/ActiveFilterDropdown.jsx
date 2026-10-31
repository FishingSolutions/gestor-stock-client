import { ChevronDown } from 'lucide-react'
import { selectClassName } from './selectStyles'

export default function ActiveFilterDropdown({ value, onChange, className = '' }) {
 return (
  <div className={`relative ${className}`}>
   <select
    aria-label="Filtrar por estado"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className={`${selectClassName} pr-9`}
   >
    <option value="activos">Activos</option>
    <option value="inactivos">Inactivos</option>
    <option value="todos">Ambos</option>
   </select>
   <ChevronDown
    size={15}
    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brown-500"
   />
  </div>
 )
}
