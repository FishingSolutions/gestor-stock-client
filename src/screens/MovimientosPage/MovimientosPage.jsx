import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeftRight, X } from 'lucide-react'
import Dropdown from '../../components/ui/Dropdown/Dropdown'
import ErrorState from '../../components/ui/ErrorState/ErrorState'
import ProductsPagination from '../../components/products/ProductsFooter/ProductsPagination'
import { useMovements } from '../../features/movements/hooks/useMovements'

const PAGE_SIZE = 20

const TIPO_OPTIONS = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'ENTRADA', label: 'Entradas' },
  { value: 'SALIDA', label: 'Salidas' },
  { value: 'AJUSTE', label: 'Ajustes' },
]

const TIPO_LABEL = {
  ENTRADA: 'Entrada',
  SALIDA: 'Salida',
  AJUSTE: 'Ajuste',
}

const TIPO_BADGE = {
  ENTRADA: 'bg-stock-green-bg text-stock-green',
  SALIDA: 'bg-stock-red-bg text-stock-red',
  AJUSTE: 'bg-stock-amber-bg text-stock-amber',
}

const COLUMNS = [
  { label: 'Fecha', width: '14%' },
  { label: 'Producto', width: '25%' },
  { label: 'Tipo', width: '10%' },
  { label: 'Variación', width: '9%', align: 'right' },
  { label: 'Stock', width: '13%' },
  { label: 'Motivo', width: '19%' },
  { label: 'Usuario', width: '10%' },
]

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

const numberFormatter = new Intl.NumberFormat('es-AR')

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date)
}

function TipoBadge({ tipo }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${
        TIPO_BADGE[tipo] || 'bg-cream-200 text-brown-600'
      }`}
    >
      {TIPO_LABEL[tipo] || tipo}
    </span>
  )
}

function Variacion({ value }) {
  if (!value) {
    return <span className="tabular-nums text-brown-400">0</span>
  }

  return (
    <span
      className={`font-semibold tabular-nums ${
        value > 0 ? 'text-stock-green' : 'text-stock-red'
      }`}
    >
      {value > 0 ? '+' : '−'}
      {numberFormatter.format(Math.abs(value))}
    </span>
  )
}

function MovementsLoading() {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-white p-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="h-9 animate-pulse rounded bg-cream-100"
        />
      ))}
    </div>
  )
}

function MovementsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-white px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-200 text-brown-500">
        <ArrowLeftRight size={20} />
      </span>
      <h2 className="mt-4 text-base font-semibold text-brown-900">
        No hay movimientos para mostrar
      </h2>
      <p className="mt-1 max-w-md text-sm text-brown-600">
        Los ingresos, salidas y ajustes de stock que se registren van a aparecer
        acá.
      </p>
    </div>
  )
}

/**
 * Historial real de movimientos de stock (backend Express + v_movimiento).
 * Se llega desde el sidebar o desde "Ver movimientos" de un producto, en cuyo
 * caso se filtra por ese producto.
 */
export default function MovimientosPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const [tipo, setTipo] = useState('all')
  const [page, setPage] = useState(1)

  const idProducto = location.state?.idProducto
    ? String(location.state.idProducto)
    : null
  const productoNombre = location.state?.productoNombre ?? null

  const { items, total, loading, error, reload } = useMovements({
    tipo,
    idProducto,
    page,
    pageSize: PAGE_SIZE,
  })

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, total)

  const clearProductFilter = () => {
    navigate('/movimientos', { replace: true })
    setPage(1)
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1460px] flex-col px-4 py-4 min-[900px]:px-7 min-[900px]:py-6">
      <header className="shrink-0">
        <p className="text-[11px] font-semibold text-rust-600 dark:text-rust-500">
          Inventario / Movimientos
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-rust-600 dark:text-rust-500">
          Movimientos
        </h1>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Dropdown
          label="Tipo de movimiento"
          value={tipo}
          onChange={(value) => {
            setTipo(value)
            setPage(1)
          }}
          options={TIPO_OPTIONS}
          className="w-full max-w-[190px]"
        />

        {idProducto && (
          <button
            type="button"
            onClick={clearProductFilter}
            className="inline-flex items-center gap-1.5 rounded-full bg-cream-200 px-3 py-1 text-[11.5px] font-semibold text-brown-700 transition-colors hover:bg-cream-300"
          >
            Producto: {productoNombre || `#${idProducto}`}
            <X size={12} />
          </button>
        )}

        <span className="ml-auto text-[11.5px] text-brown-500">
          {total === 1 ? '1 movimiento' : `${total} movimientos`}
        </span>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        {loading ? (
          <MovementsLoading />
        ) : error ? (
          <ErrorState
            title="No pudimos cargar los movimientos"
            error={error}
            onRetry={reload}
          />
        ) : items.length === 0 ? (
          <MovementsEmpty />
        ) : (
          <>
            <div className="hidden min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-white min-[900px]:flex">
              <div className="min-h-0 flex-1 overflow-auto scrollbar-custom">
                <table className="w-full table-fixed border-collapse">
                  <colgroup>
                    {COLUMNS.map((column) => (
                      <col key={column.label} style={{ width: column.width }} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr>
                      {COLUMNS.map((column) => (
                        <th
                          key={column.label}
                          className={`sticky top-0 z-10 h-10 bg-espresso px-3 text-[14px] font-bold text-cream-50 ${
                            column.align === 'right' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((movement) => (
                      <tr
                        key={movement.id}
                        className="border-b border-cream-200 last:border-b-0"
                      >
                        <td className="px-3 py-2.5 text-[12px] tabular-nums text-brown-600">
                          {formatDate(movement.fecha)}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="min-w-0">
                            <p className="truncate text-[12.5px] font-semibold text-brown-900">
                              {movement.producto || `Producto #${movement.idProducto}`}
                            </p>
                            <p className="truncate text-[10.5px] text-brown-500">
                              {movement.codigo || '—'}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <TipoBadge tipo={movement.tipo} />
                        </td>
                        <td className="px-3 py-2.5 text-right text-[12.5px]">
                          <Variacion value={movement.variacion} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-[12px] tabular-nums text-brown-600">
                          {movement.stockAnterior} →{' '}
                          <strong className="font-semibold text-brown-900">
                            {movement.stockResultante}
                          </strong>
                        </td>
                        <td
                          className="truncate px-3 py-2.5 text-[12px] text-brown-600"
                          title={movement.motivo}
                        >
                          {movement.motivo || '—'}
                        </td>
                        <td
                          className="truncate px-3 py-2.5 text-[12px] text-brown-600"
                          title={movement.usuario?.nombreCompleto || ''}
                        >
                          {movement.usuario?.nombreCompleto || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-2 min-[900px]:hidden">
              {items.map((movement) => (
                <article
                  key={movement.id}
                  className="rounded-lg bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-semibold text-brown-900">
                        {movement.producto || `Producto #${movement.idProducto}`}
                      </p>
                      <p className="text-[10.5px] text-brown-500">
                        {movement.codigo || '—'} · {formatDate(movement.fecha)}
                      </p>
                    </div>
                    <TipoBadge tipo={movement.tipo} />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-brown-600">
                    <span>
                      Variación: <Variacion value={movement.variacion} />
                    </span>
                    <span className="tabular-nums">
                      {movement.stockAnterior} →{' '}
                      <strong className="font-semibold text-brown-900">
                        {movement.stockResultante}
                      </strong>
                    </span>
                    <span className="truncate">
                      {movement.usuario?.nombreCompleto || '—'}
                    </span>
                  </div>

                  {movement.motivo && (
                    <p className="mt-1.5 text-[11.5px] text-brown-500">
                      {movement.motivo}
                    </p>
                  )}
                </article>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-alabaster px-3 py-2.5 text-[11.5px] text-brown-500">
              <p>
                Mostrando{' '}
                <strong className="font-semibold text-brown-600">
                  {rangeStart}–{rangeEnd}
                </strong>{' '}
                de <strong className="font-semibold text-brown-600">{total}</strong>{' '}
                movimientos
              </p>
              <ProductsPagination
                page={page}
                pageCount={pageCount}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
