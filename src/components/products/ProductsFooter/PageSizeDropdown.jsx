import { ChevronDown } from 'lucide-react'

export default function PageSizeDropdown({ value, onChange }) {
  return (
    <div className="relative">
      <select
        aria-label="Filas por página"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-7 appearance-none rounded bg-cream-100 pl-2 pr-6 text-[11px] text-brown-700 outline-none transition focus:bg-white focus:ring-2 focus:ring-rust-500/20"
      >
        {[10, 25, 50].map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-brown-500"
      />
    </div>
  )
}
