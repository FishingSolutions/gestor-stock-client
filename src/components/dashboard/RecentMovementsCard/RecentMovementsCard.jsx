import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, ChevronRight } from 'lucide-react'
import Card, { CardHeader } from '../../ui/Card/Card'
import ChartEmptyState from '../ChartEmptyState/ChartEmptyState'

const TIPO_CHIP = {
  Entradas: 'bg-stock-green-bg text-stock-green',
  Salidas: 'bg-stock-red-bg text-wine-600',
  Ajustes: 'bg-stock-amber-bg text-stock-amber',
}

const dayFormat = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

// Cantidad definida en la card: se ven 4 y las otras 6 se scrollean
const MAX_ROWS = 10

function formatDate(iso) {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '—' : dayFormat.format(date)
}

function MovementsSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="mt-2 flex flex-col gap-2">
      <span className="sr-only">Cargando movimientos...</span>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className="h-9 animate-pulse rounded bg-cream-100" />
      ))}
    </div>
  )
}

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

/**
 * Card "Últimos movimientos de stock" (modelo E): tabla con los últimos
 * movimientos reales y el link a /movimientos como footer.
 */
export default function RecentMovementsCard({
  movements = [],
  pending = false,
  days = 30,
  className = '',
}) {
  const navigate = useNavigate()
  const visibleMovements = movements.slice(0, MAX_ROWS)
  const hasData = visibleMovements.length > 0

  return (
    <Card busy={pending} className={className}>
      <CardHeader
        title="Últimos movimientos de stock"
        sub="registro de entradas y salidas del inventario"
      />

      {pending ? (
        <MovementsSkeleton />
      ) : hasData ? (
        <div className="mt-1 max-h-[202px] overflow-auto scrollbar-custom">
          <table className="w-full border-collapse text-[12px]">
            <thead className="sticky top-0 z-10 bg-white">
              <tr>
                {['Producto', 'Tipo', 'Cant.', 'Fecha', 'Operador'].map((label) => (
                  <th
                    key={label}
                    className={`border-b border-cream-200 pb-1.5 text-[10px] font-bold uppercase tracking-wide text-brown-400 ${
                      label === 'Cant.' ? 'pr-3 text-right' : 'text-left'
                    } ${label === 'Fecha' ? 'whitespace-nowrap' : ''}`}
                  >
                    {label}
                  </th>
                ))}
                <th className="w-[74px] border-b border-cream-200" />
              </tr>
            </thead>
            <tbody>
              {visibleMovements.map((movement) => (
                <tr
                  key={movement.id}
                  tabIndex={0}
                  aria-label={`Ver detalle del movimiento de ${movement.productoNombre}`}
                  onClick={() =>
                    navigate('/movimientos', { state: { movementId: movement.id } })
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      navigate('/movimientos', { state: { movementId: movement.id } })
                    }
                  }}
                  className="group cursor-pointer border-b border-cream-100 transition-colors hover:bg-alabaster last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rust-500/40"
                >
                  <td className="max-w-[260px] py-2 pr-3">
                    <p className="truncate font-semibold text-brown-900">
                      {movement.productoNombre}
                    </p>
                    <p className="text-[10.5px] text-brown-400">{movement.productoCodigo}</p>
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10.5px] font-medium ${TIPO_CHIP[movement.tipo] ?? 'bg-cream-100 text-brown-600'}`}
                    >
                      <i className="h-1.5 w-1.5 rounded-full bg-current" />
                      {movement.tipo}
                    </span>
                  </td>
                  <td
                    className={`py-2 pr-3 text-right font-bold tabular-nums ${
                      movement.tipo === 'Entradas'
                        ? 'text-stock-green'
                        : movement.tipo === 'Salidas'
                          ? 'text-wine-600'
                          : 'text-brown-900'
                    }`}
                  >
                    {movement.tipo === 'Entradas' ? '+' : movement.tipo === 'Salidas' ? '−' : ''}
                    {movement.cantidad}
                  </td>
                  <td className="whitespace-nowrap py-2 pr-3 text-brown-500">
                    {formatDate(movement.fecha)}
                  </td>
                  <td className="py-2">
                    <span className="flex items-center gap-2">
                      <i className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cream-200 text-[9.5px] font-bold not-italic text-brown-600">
                        {initials(movement.operador)}
                      </i>
                      <span className="truncate">{movement.operador}</span>
                    </span>
                  </td>
                  {/* CTA de hover (mockup): columna propia, centrada como el
                      resto de los campos. El click a /movimientos con detalle
                      viene cuando armemos esa página */}
                  <td className="py-2">
                    <span className="flex items-center justify-end gap-1 opacity-0 text-[10.5px] font-bold whitespace-nowrap text-rust-600 transition-opacity duration-150 group-hover:opacity-100">
                      Ver detalle
                      <ChevronRight size={11} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ChartEmptyState
          className="min-h-[160px]"
          icon={<ArrowLeftRight size={17} />}
          title="Todavía no hay movimientos registrados"
          hint="Cuando se registren entradas, salidas y ajustes, acá vas a ver los últimos con su detalle."
        />
      )}

      <button
        type="button"
        onClick={() => navigate('/movimientos', { state: { days } })}
        className="mt-auto flex items-center gap-1.5 self-start pt-3 text-[11.5px] font-semibold text-rust-600 hover:text-rust-700 hover:underline"
      >
        Ver todos los movimientos
        <span aria-hidden="true">→</span>
      </button>
    </Card>
  )
}
