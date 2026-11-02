import Dropdown from '../../ui/Dropdown/Dropdown'

const OPTIONS = [
 { value: 'activos', label: 'Activos' },
 { value: 'inactivos', label: 'Inactivos' },
 { value: 'todos', label: 'Ambos' },
]

export default function ActiveFilterDropdown({ value, onChange, className = '' }) {
 return (
  <Dropdown
   label="Filtrar por estado"
   value={value}
   onChange={onChange}
   options={OPTIONS}
   className={className}
  />
 )
}
