import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeftRight, Download, Eye, Search } from 'lucide-react'
import Dropdown from '../../components/ui/Dropdown/Dropdown'
import ErrorState from '../../components/ui/ErrorState/ErrorState'
import MonthPicker from '../../components/movements/MonthPicker/MonthPicker'
import ProductsPagination from '../../components/products/ProductsFooter/ProductsPagination'
import PageSizeDropdown from '../../components/products/ProductsFooter/PageSizeDropdown'
import MovementDetailDrawer from '../../components/movements/MovementDetailDrawer/MovementDetailDrawer'
import {
  useMovementStats,
  useMovementsPage,
} from '../../features/movements/hooks/useMovementsPage'
import { fetchMovementById, fetchMovementsPage } from '../../features/movements/services/movementsService'
import {
  exportMovementsCsv,
  formatDayLabel,
  formatTime,
} from '../../features/movements/utils/movements'

const PAGE_SIZE = 10

const TIPO_OPTIONS = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'ENTRADA', label: 'Entradas' },
  { value: 'SALIDA', label: 'Salidas' },
  { value: 'AJUSTE', label: 'Ajustes' },
]

const TIPO_BADGE = {
  ENTRADA: { className: 'mov-badge entrada', label: '↑ Entrada' },
  SALIDA: { className: 'mov-badge salida', label: '↓ Salida' },
  AJUSTE: { className: 'mov-badge ajuste', label: '⚖ Ajuste' },
}

const PERIOD_OPTIONS = [
  { value: '7', label: 'Últimos 7 días' },
  { value: '14', label: 'Últimos 14 días' },
  { value: '30', label: 'Últimos 30 días' },
  { value: '90', label: 'Últimos 90 días' },
]

const numberFormat = new Intl.NumberFormat('es-AR')

function formatVariacion(value) {
  if (value === 0) return <span>0</span>
  return `${value > 0 ? '+' : '−'}${numberFormat.format(Math.abs(value))}`
}

function groupByDay(items) {
  const sections = []
  let currentDay = null

  items.forEach((movement) => {
    const label = formatDayLabel(movement.fecha)
    if (label !== currentDay) {
      currentDay = label
      sections.push({ type: 'day', key: `day-${label}`, label })
    }
    sections.push({ type: 'mov', key: `mov-${movement.id}`, movement })
  })

  return sections
}

function MovementKpis({ stats, pending, days }) {
  const perDay = pending || !stats ? '—' : (stats.total / days).toFixed(1).replace('.', ',')

  return (
    <div className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
      {[
        { label: 'Total operaciones', value: pending ? '—' : numberFormat.format(stats.total), foot: `promedio ${perDay}/día`, valueClass: '' },
        { label: 'Entradas registradas', value: pending ? '—' : `+${numberFormat.format(stats.entradasUnidades)}`, foot: 'unidades del período', valueClass: 'text-stock-green' },
        { label: 'Salidas / despachos', value: pending ? '—' : `−${numberFormat.format(stats.salidasUnidades)}`, foot: 'unidades del período', valueClass: 'text-stock-red' },
        { label: 'Ajustes de inventario', value: pending ? '—' : numberFormat.format(stats.ajustes), foot: 'correcciones de conteo', valueClass: 'text-stock-amber' },
      ].map((kpi) => (
        <div key={kpi.label} className="min-w-0 rounded-lg bg-white p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10.5px] font-semibold uppercase tracking-wide text-brown-500 sm:text-[11px]">
              {kpi.label}
            </span>
          </div>
          {pending ? (
            <span className="mt-2 block h-6 w-20 animate-pulse rounded bg-cream-200 sm:h-7" />
          ) : (
            <p className={`mt-1.5 text-[22px] font-bold leading-tight tabular-nums sm:text-2xl ${kpi.valueClass}`}>
              {kpi.value}
            </p>
          )}
          <p className="mt-0.5 text-[10.5px] text-brown-500">{kpi.foot}</p>
        </div>
      ))}
    </div>
  )
}

function MovementsSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="h-9 animate-pulse rounded bg-cream-100" />
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
        acá. Probá ampliar el período o limpiar los filtros.
      </p>
    </div>
  )
}

/**
 * Historial de movimientos (modelo H).
 */
export default function MovimientosPage() {
  const location = useLocation()
  const navigate = useNavigate()

  // Estado de llegada desde el dashboard.
  const [search, setSearch] = useState('')
  const [tipo, setTipo] = useState('all')
  const [days, setDays] = useState(
    typeof location.state?.days === 'number' ? location.state.days : 30,
  )
  const [month, setMonth] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [selected, setSelected] = useState(null)
  const [showKpis, setShowKpis] = useState(true)
  const [openingId, setOpeningId] = useState(() => location.state?.movementId ?? null)

  // Trae el movimiento pedido por id y abre su drawer.
  useEffect(() => {
    if (!openingId) return
    let active = true

    fetchMovementById(openingId)
      .then((movement) => {
        if (active && movement) setSelected(movement)
      })
      .finally(() => {
        if (active) setOpeningId(null)
      })

    return () => {
      active = false
    }
  }, [openingId])

  const openProduct = (productId) =>
    navigate('/productos', { state: { productId } })

  const { items, total, loading, error, reload } = useMovementsPage({
    tipo,
    search,
    days,
    month,
    page,
    pageSize,
  })
  const { stats, loading: statsLoading } = useMovementStats({ days, month })

  // Días del alcance activo (mes o período).
  const scopeDays = month
    ? new Date(Number(month.split('-')[0]), Number(month.split('-')[1]), 0).getDate()
    : days

  // Reset de página al cambiar filtros.
  const changeTipo = (value) => {
    setTipo(value)
    setPage(1)
  }

  const changeDays = (value) => {
    setDays(Number(value))
    setMonth(null)
    setPage(1)
  }

  const changeSearch = (value) => {
    setSearch(value)
    setPage(1)
  }

  const changeMonth = (value) => {
    setMonth(value)
    setPage(1)
  }

  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  const sections = useMemo(() => groupByDay(items), [items])

  const dayNetByLabel = useMemo(() => {
    const nets = new Map()
    items.forEach((movement) => {
      const label = formatDayLabel(movement.fecha)
      nets.set(label, (nets.get(label) ?? 0) + movement.variacion)
    })
    return nets
  }, [items])

  const handleExport = async () => {
    const all = []
    let exportPage = 1

    while (true) {
      const { items: batch } = await fetchMovementsPage({
        tipo,
        search,
        days,
        month,
        limit: 1000,
        page: exportPage,
      })
      all.push(...batch)
      if (batch.length < 1000) break
      exportPage += 1
    }

    exportMovementsCsv(all, days, month)
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1460px] flex-col px-4 py-4 min-[900px]:px-7 min-[900px]:py-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-rust-600">
            Inventario / Movimientos
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-rust-600">
            Historial de movimientos
          </h1>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={showKpis}
          onClick={() => setShowKpis((v) => !v)}
          title="Mostrar u ocultar indicadores"
          className="mb-1 flex self-end items-center gap-2 text-[11.5px] font-semibold text-brown-600"
        >
          Ver KPIs
          <span
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
              showKpis ? 'bg-rust-600' : 'bg-cream-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                showKpis ? 'translate-x-[18px]' : 'translate-x-0.5'
              }`}
            />
          </span>
        </button>
      </header>

      <div
        aria-hidden={!showKpis}
        className={`grid shrink-0 overflow-hidden transition-all duration-300 ease-out ${
          showKpis
            ? 'max-h-56 opacity-100 translate-y-0'
            : 'pointer-events-none max-h-0 -translate-y-2 opacity-0'
        }`}
      >
        <MovementKpis stats={stats} pending={statsLoading} days={scopeDays} />
      </div>

      <div className="mt-4 flex shrink-0 flex-wrap items-center gap-2 rounded-lg bg-white p-2">
        <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded bg-cream-100 px-3 text-brown-400 sm:max-w-[300px]">
          <Search size={14} />
          <input
            type="text"
            value={search}
            onChange={changeSearch}
            placeholder="Buscar producto…"
            aria-label="Buscar producto"
            className="h-full min-w-0 flex-1 bg-transparent text-[12.5px] text-brown-900 outline-none placeholder:text-brown-400"
          />
        </label>

        <Dropdown
          label="Tipo de movimiento"
          value={tipo}
          onChange={changeTipo}
          options={TIPO_OPTIONS}
          className="w-full max-w-[180px]"
        />

        <Dropdown
          label="Período"
          value={String(days)}
          onChange={changeDays}
          options={PERIOD_OPTIONS}
          className="w-full max-w-[170px]"
        />

        <MonthPicker value={month} onChange={changeMonth} />

        <button
          type="button"
          onClick={handleExport}
          className="ml-auto flex h-9 items-center gap-2 rounded bg-cream-200 px-3 text-[12.5px] font-bold text-brown-700 transition-colors hover:bg-cream-300"
        >
          <Download size={15} />
          Exportar CSV
        </button>
      </div>

      <div className="mov-card mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-white">
        <span className="mov-line" aria-hidden="true" />

        <div className="mov-head">
          <span />
          <span className="mov-c-prod">Producto</span>
          <span className="mov-c-tipo">Tipo</span>
          <span className="mov-c-cant">Cantidad</span>
          <span className="mov-c-stock">
            Stock<small>Resultante</small>
          </span>
          <span className="mov-c-motivo">Motivo</span>
          <span className="mov-c-oper">Operador</span>
          <span className="mov-c-act" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-custom">
          {loading && items.length === 0 ? (
            <MovementsSkeleton />
          ) : error ? (
            <div className="p-4">
              <ErrorState
                title="No pudimos cargar los movimientos"
                error={error}
                onRetry={reload}
              />
            </div>
          ) : items.length === 0 ? (
            <MovementsEmpty />
          ) : (
            sections.map((section) =>
              section.type === 'day' ? (
                <div className="mov-day" key={section.key}>
                  <span className="pill">{section.label}</span>
                  <span className="neto">
                    {numberFormat.format(dayNetByLabel.get(section.label) ?? 0)} un. netas
                  </span>
                </div>
              ) : (
                <MovementRow
                  key={section.key}
                  movement={section.movement}
                  onOpen={setSelected}
                />
              ),
            )
          )}
        </div>

        {!loading && !error && items.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-alabaster px-3 py-2.5 text-[11.5px] text-brown-500">
            <p>
              Mostrando{' '}
              <strong className="font-semibold text-brown-600">
                {rangeStart}–{rangeEnd}
              </strong>{' '}
              de{' '}
              <strong className="font-semibold text-brown-600">{total}</strong>{' '}
              movimientos
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.04em]">
                Filas por página
              </span>
              <PageSizeDropdown value={pageSize} onChange={setPageSize} />
              <ProductsPagination page={page} pageCount={pageCount} onChange={setPage} />
            </div>
          </div>
        )}
      </div>

      {selected && (
        <MovementDetailDrawer
          movement={selected}
          onClose={() => setSelected(null)}
          onOpenProduct={openProduct}
        />
      )}
    </div>
  )
}

function MovementRow({ movement, onOpen }) {
  const tipo = TIPO_BADGE[movement.tipoRaw] ?? {
    className: 'mov-badge ajuste',
    label: movement.tipoRaw,
  }
  const up = movement.variacion >= 0
  const railDot = { ENTRADA: 'entrada', SALIDA: 'salida', AJUSTE: 'ajuste' }[
    movement.tipoRaw
  ] ?? (up ? 'entrada' : 'salida')
  const cantColor =
    movement.tipoRaw === 'AJUSTE'
      ? 'var(--color-stock-amber)'
      : up
        ? 'var(--color-stock-green)'
        : 'var(--color-stock-red)'
  const initials = movement.operador
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')

  return (
    <div className="mov-row">
      <div className="mov-rail">
        <i className={`dot ${railDot}`} />
        <span className="hora">{formatTime(movement.fecha)}</span>
      </div>

      <div className="mov-c-prod mov-prod">
        <p className="name" title={movement.productoNombre}>
          {movement.productoNombre}
        </p>
        <p className="sku">
          {movement.productoCodigo}
          {movement.productoCategoria ? ` · ${movement.productoCategoria}` : ''}
        </p>
      </div>

      <div className="mov-c-tipo tcell">
        <span className={tipo.className}>{tipo.label}</span>
      </div>

      <div
        className="mov-c-cant mov-cant"
        style={{ color: cantColor }}
      >
        {formatVariacion(movement.variacion)}
      </div>

      <div className="mov-c-stock mov-stock">
        {movement.stockAnterior} →{' '}
        <strong>{movement.stockResultante}</strong>
      </div>

      <div className="mov-c-motivo mov-motivo" title={movement.motivo || undefined}>
        {movement.motivo || '—'}
      </div>

      <div className="mov-c-oper mov-oper">
        <span className="avatar">{initials || '—'}</span>
        <span>{movement.operador}</span>
      </div>

      <div className="mov-c-act mov-act">
        <button
          type="button"
          className="mov-row-btn"
          aria-label={`Ver detalle del movimiento #${movement.id}`}
          title="Ver detalle"
          onClick={() => onOpen(movement)}
        >
          <Eye size={14} />
        </button>
      </div>
    </div>
  )
}
