import { Search } from 'lucide-react'
import ActiveFilterDropdown from './ActiveFilterDropdown'
import CategoryDropdown from './CategoryDropdown'
import SortDropdown from './SortDropdown'

export default function ProductsToolbar({
  search,
  onSearchChange,
  category,
  categories,
  onCategoryChange,
  activeFilter,
  onActiveFilterChange,
  sort,
  onSortChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-2">
      <label className="relative w-full min-[900px]:max-w-[300px] min-[900px]:flex-1">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brown-500"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar nombre, código o categoría..."
          aria-label="Buscar productos"
          className="h-9 w-full rounded bg-cream-100 pl-9 pr-3 text-[12.5px] text-brown-900 placeholder:text-brown-500 outline-none transition focus:bg-white focus:ring-2 focus:ring-rust-500/20"
        />
      </label>

      <CategoryDropdown
        value={category}
        onChange={onCategoryChange}
        categories={categories}
        className="hidden min-[900px]:block"
      />

      <ActiveFilterDropdown
        value={activeFilter}
        onChange={onActiveFilterChange}
        className="w-full min-[900px]:w-auto"
      />

      <SortDropdown
        value={sort}
        onChange={onSortChange}
        className="w-full min-[900px]:w-auto"
      />
    </div>
  )
}
