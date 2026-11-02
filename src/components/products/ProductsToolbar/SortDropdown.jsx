import { ArrowUpDown } from 'lucide-react'
import Dropdown from '../../ui/Dropdown/Dropdown'

const OPTIONS = [
 { value: 'recent', label: 'Recientes' },
 { value: 'name', label: 'Nombre A–Z' },
 { value: 'stock-desc', label: 'Stock: mayor a menor' },
 { value: 'stock-asc', label: 'Stock: menor a mayor' },
 { value: 'price-desc', label: 'Precio: mayor a menor' },
]

export default function SortDropdown({ value, onChange, className = '' }) {
 return (
  <Dropdown
   label="Ordenar productos"
   value={value}
   onChange={onChange}
   options={OPTIONS}
   icon={<ArrowUpDown size={15} />}
   className={className}
  />
 )
}
