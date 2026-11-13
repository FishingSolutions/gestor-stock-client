import { useEffect, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const START_YEAR = 2024

const monthShortFormat = new Intl.DateTimeFormat('es-AR', { month: 'short', year: 'numeric' })

/**
 * Filtro calendario: value = "YYYY-MM" filtra ese mes exacto.
 */
export default function MonthPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  const [year, setYear] = useState(() =>
    value ? Number(value.split('-')[0]) : new Date().getFullYear(),
  )

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  const openPanel = () => {
    setYear(value ? Number(value.split('-')[0]) : new Date().getFullYear())
    setOpen(true)
  }

  const selectMonth = (monthIndex) => {
    onChange(`${year}-${String(monthIndex + 1).padStart(2, '0')}`)
    setOpen(false)
  }

  const label = value
    ? monthShortFormat.format(new Date(Number(value.split('-')[0]), Number(value.split('-')[1]) - 1, 15))
    : 'Vista por mes'

  return (
    <div ref={rootRef} className={`relative w-full max-w-[170px] ${value ? 'is-active' : ''}`}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex h-9 w-full items-center gap-2 rounded px-3 text-[12.5px] font-semibold transition-colors ${
          value
            ? 'bg-rust-600 text-cream-50 hover:bg-rust-700'
            : 'bg-cream-100 text-brown-700 hover:bg-cream-200'
        }`}
      >
        <Calendar size={14} className="shrink-0" />
        <span className="truncate capitalize">{label}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Elegir mes y año"
          className="absolute right-0 z-[60] mt-1 w-[248px] rounded-lg border border-cream-200 bg-white p-3 shadow-xl"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setYear((y) => y - 1)}
              disabled={year <= START_YEAR}
              aria-label="Año anterior"
              className="inline-flex h-7 w-7 items-center justify-center rounded text-brown-500 transition-colors hover:bg-cream-200 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[12.5px] font-bold text-brown-900">{year}</span>
            <button
              type="button"
              onClick={() => setYear((y) => y + 1)}
              disabled={year >= new Date().getFullYear()}
              aria-label="Año siguiente"
              className="inline-flex h-7 w-7 items-center justify-center rounded text-brown-500 transition-colors hover:bg-cream-200 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((month, index) => {
              const monthValue = `${year}-${String(index + 1).padStart(2, '0')}`
              const active = value === monthValue
              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => selectMonth(index)}
                  aria-current={active ? 'true' : undefined}
                  className={`h-8 rounded text-[11.5px] font-semibold capitalize transition-colors ${
                    active
                      ? 'bg-rust-600 text-cream-50'
                      : 'text-brown-600 hover:bg-cream-100'
                  }`}
                >
                  {month}
                </button>
              )
            })}
          </div>

          {value && (
            <button
              type="button"
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
              className="mt-2 w-full rounded py-1.5 text-[11px] font-semibold text-rust-600 transition-colors hover:bg-cream-100"
            >
              Volver al período general
            </button>
          )}
        </div>
      )}
    </div>
  )
}
