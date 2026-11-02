import Dropdown from '../../ui/Dropdown/Dropdown'

export default function CategoryDropdown({
 value,
 onChange,
 categories,
 className = '',
}) {
 const options = [
  { value: 'all', label: 'Todas las categorías' },
  ...categories.map((category) => ({ value: category, label: category })),
 ]

 return (
  <Dropdown
   label="Filtrar por categoría"
   value={value}
   onChange={onChange}
   options={options}
   className={className}
  />
 )
}
