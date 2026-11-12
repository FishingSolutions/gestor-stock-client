import { useMemo, useRef, useState } from 'react'
import { Activity, ChevronDown } from 'lucide-react'
import Card, { CardHeader } from '../../ui/Card/Card'
import ChartEmptyState from '../ChartEmptyState/ChartEmptyState'
import {
  buildDailyActivity,
  buildSalesRanking,
} from '../../../features/movements/utils/movements'

// Misma geometría del mockup (renderLine): lienzo 940×185. El padding
// izquierdo deja lugar a la escala del borde (valores de las líneas) y el
// inferior es mínimo: si no, el SVG deja un bloque vacío entre el gráfico
// y la franja de totales.
const W = 940
const H = 185
const P = 32
const BOTTOM = 12

const COLORS = {
  green: '#2d6a4f',
  greenBg: '#e8f3ed',
  wine: '#a30021',
  grid: '#f0e7de',
}

// Ticks "redondos": escalona el máximo a un múltiplo lindo (1/2/2.5/5 × 10ⁿ)
// para que la escala del borde muestre números limpios
function niceCeil(value) {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const step = [1, 2, 2.5, 5].find((candidate) => normalized <= candidate) ?? 10
  return step * magnitude
}

function DailyActivityChart({ daily }) {
  const svgRef = useRef(null)
  const [guideIndex, setGuideIndex] = useState(null)

  const { inPath, outPath, areaPath, dots, step, scaleLines } = useMemo(() => {
    const realMax = Math.max(...daily.map((day) => Math.max(day.entradas, day.salidas)), 1)
    const stepValue = niceCeil(realMax / 4)
    const niceMax = stepValue * 4
    const y = (value) => H - BOTTOM - (value / niceMax) * (H - P - BOTTOM)
    const stepX = (W - P * 2) / Math.max(1, daily.length - 1)
    const point = (value, index) => `${(P + index * stepX).toFixed(1)} ${y(value).toFixed(1)}`

    const inPath = daily.map((day, index) => `${index ? 'L' : 'M'}${point(day.entradas, index)}`).join(' ')
    const outPath = daily.map((day, index) => `${index ? 'L' : 'M'}${point(day.salidas, index)}`).join(' ')
    const areaPath = `${inPath} L${(W - P).toFixed(1)} ${(H - BOTTOM).toFixed(1)} L${P} ${(H - BOTTOM).toFixed(1)} Z`

    const dots = daily.flatMap((day, index) => [
      { cx: P + index * stepX, cy: y(day.entradas), fill: COLORS.green },
      { cx: P + index * stepX, cy: y(day.salidas), fill: COLORS.wine },
    ])

    const scaleLines = [0, 1, 2, 3, 4].map((tick) => ({
      value: stepValue * tick,
      y: y(stepValue * tick),
    }))

    return { inPath, outPath, areaPath, dots, step: stepX, scaleLines }
  }, [daily])

  // El mouse elige el día más cercano y la guía se posiciona en porcentaje
  // del ancho (así escala con el gráfico como en el mockup)
  const handleMove = (event) => {
    const rect = svgRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * W
    const index = Math.min(daily.length - 1, Math.max(0, Math.round((x - P) / step)))
    setGuideIndex(index)
  }

  const guide = guideIndex === null ? null : daily[guideIndex]
  const guideLeftPct = guideIndex === null ? 0 : (((P + guideIndex * step) / W) * 100).toFixed(2)

  return (
    <div className="relative">
      {guide && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-0 w-px bg-brown-400/50"
            style={{ left: `${guideLeftPct}%` }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-espresso px-2.5 py-1.5 text-[10.5px] font-semibold leading-[1.5] text-cream-50 shadow-md"
            style={{ left: `${guideLeftPct}%` }}
          >
            <b>{guide.label}</b>
            <span className="block text-[#8fd6b4]">+{guide.entradas} entradas</span>
            <span className="block text-[#f3b9b9]">−{guide.salidas} salidas</span>
          </div>
        </>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        onMouseMove={handleMove}
        onMouseLeave={() => setGuideIndex(null)}
      >
        {scaleLines.map((line, index) => (
          <line
            key={index}
            x1={P}
            x2={W - P}
            y1={line.y}
            y2={line.y}
            stroke={COLORS.grid}
            strokeDasharray="3 4"
          />
        ))}

        {/* Escala del borde izquierdo: el valor de cada línea punteada */}
        {scaleLines.map((line, index) => (
          <text
            key={`scale-${index}`}
            x={P - 6}
            y={line.y}
            textAnchor="end"
            dominantBaseline="middle"
            fill="#9c8e82"
            style={{ fontSize: 9.5, fontWeight: 600 }}
          >
            {line.value.toLocaleString('es-AR')}
          </text>
        ))}

        <path className="chart-area" d={areaPath} fill={COLORS.greenBg} />
        <path
          className="line-path chart-line-draw"
          pathLength="1"
          d={inPath}
          stroke={COLORS.green}
        />
        <path
          className="line-path chart-line-draw"
          pathLength="1"
          d={outPath}
          stroke={COLORS.wine}
        />
        {dots.map((dot, index) => (
          <circle
            key={index}
            className="chart-dot"
            cx={dot.cx}
            cy={dot.cy}
            r="2.4"
            fill={dot.fill}
          />
        ))}
      </svg>
    </div>
  )
}

function DetailPanel({ title, chip, chipClass, rows, tone }) {
  if (rows.length === 0) return null
  const max = Math.max(...rows.map((row) => row.sold))

  return (
    <div className="rounded-lg border border-cream-200 bg-alabaster p-3">
      <div className="mb-1 flex items-baseline gap-2.5">
        <h3 className="text-[12.5px] font-bold text-brown-900">{title}</h3>
        <span
          className={`rounded px-2 py-0.5 text-[10.5px] font-medium ${chipClass}`}
        >
          {chip}
        </span>
        <span className="ml-auto text-[10.5px] text-brown-500">un. salidas · 30d</span>
      </div>
      {/* Filas como el mockup: grid con la barra como segunda fila a todo el ancho */}
      {rows.map((row, index) => (
        <div
          key={row.id}
          className="grid grid-cols-[1fr_auto] gap-x-2.5 gap-y-[3px] py-[7px]"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-cream-200 text-[10px] font-bold text-brown-600">
              {index + 1}
            </span>
            <span
              title={row.name}
              className="truncate text-[12px] font-semibold text-brown-900"
            >
              {row.name}
            </span>
          </div>
          <span className="text-right text-[12px] font-bold tabular-nums text-brown-900">
            {row.sold} <small className="font-medium text-brown-500">un.</small>
          </span>
          <span className="rank-bar col-span-full h-[7px] overflow-hidden rounded-full bg-cream-100">
            <i
              className="block h-full rounded-full"
              style={{
                '--w': `${max ? Math.round((row.sold / max) * 100) : 0}%`,
                backgroundColor: tone,
                transitionDelay: `${index * 80}ms`,
              }}
            />
          </span>
        </div>
      ))}
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="flex-1 pt-2">
      <span className="sr-only">Cargando actividad de stock...</span>
      <span className="block h-[185px] animate-pulse rounded-lg bg-cream-100" />
    </div>
  )
}

/**
 * Card "Entradas y salidas por día" (modelo E): gráfico de líneas custom
 * (igual al mockup: área verde, puntos por día y guía de hover) sobre los
 * movimientos reales de los últimos 30 días, y el botón "Más detalles"
 * que despliega los rankings de más y menos vendidos.
 */
export default function StockActivityCard({
  movements = [],
  pending = false,
  days = 30,
  detailsOpen = false,
  onToggleDetails,
  className = '',
}) {
  const daily = useMemo(() => buildDailyActivity(movements, days), [movements, days])
  const ranking = useMemo(() => buildSalesRanking(movements), [movements])
  const totals = useMemo(() => {
    let entradas = 0
    let salidas = 0
    movements.forEach((movement) => {
      if (movement.tipoRaw === 'ENTRADA') entradas += movement.cantidad
      if (movement.tipoRaw === 'SALIDA') salidas += movement.cantidad
    })
    return { entradas, salidas, neto: entradas - salidas }
  }, [movements])

  // Top 5 más vendidos; los menos vendidos arrancan después del top para
  // no repetir productos en datasets chicos
  const topSold = ranking.slice(0, 5)
  const bottomStart = Math.max(5, ranking.length - 5)
  const bottomSold = ranking.slice(bottomStart).reverse()

  return (
    <Card busy={pending} className={className}>
      <CardHeader title="Entradas y salidas por día" sub="pasá el mouse por el gráfico">
        <span className="ml-auto hidden shrink-0 items-center gap-3 self-center text-[11px] text-brown-600 min-[900px]:flex">
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-sm bg-stock-green" /> Entradas
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-sm bg-wine-600" /> Salidas
          </span>
        </span>
        {ranking.length > 0 && (
          <button
            type="button"
            aria-expanded={detailsOpen}
            onClick={onToggleDetails}
            className="flex h-8 shrink-0 items-center gap-1 self-center rounded-lg bg-cream-200 px-3 text-[12px] font-bold text-brown-700 transition-colors hover:bg-cream-100"
          >
            <span>{detailsOpen ? 'Menos detalles' : 'Más detalles'}</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${detailsOpen ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </CardHeader>

      {pending ? (
        <ActivitySkeleton />
      ) : daily.length === 0 ? (
        <ChartEmptyState
          className="min-h-[185px]"
          icon={<Activity size={17} />}
          title="Todavía no hay movimientos registrados"
          hint="Cuando se empiecen a registrar entradas y salidas, acá vas a ver la actividad del inventario día por día."
        />
      ) : (
        <div className="mt-1">
          <DailyActivityChart daily={daily} />

          {/* Totales del período (franja del mockup A) */}
          <div className="mt-2 grid grid-cols-3 gap-2 border-t border-dashed border-cream-200 pt-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-brown-500">
                Total entradas
              </p>
              <p className="mt-0.5 text-[15px] font-bold tabular-nums text-stock-green">
                +{totals.entradas.toLocaleString('es-AR')} un.
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-brown-500">
                Total salidas
              </p>
              <p className="mt-0.5 text-[15px] font-bold tabular-nums text-wine-600">
                −{totals.salidas.toLocaleString('es-AR')} un.
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-brown-500">
                Neto
              </p>
              <p
                className={`mt-0.5 text-[15px] font-bold tabular-nums ${
                  totals.neto >= 0 ? 'text-stock-green' : 'text-wine-600'
                }`}
              >
                {totals.neto >= 0 ? '+' : '−'}
                {Math.abs(totals.neto).toLocaleString('es-AR')} un.
              </p>
            </div>
          </div>

          {ranking.length > 0 && (
            <div className={`dash-details ${detailsOpen ? 'open' : ''}`}>
              <div className="dash-details-inner">
                <div className="dash-details-grid min-[900px]:grid-cols-2 pb-1 pt-3">
                  <DetailPanel
                    title="Lo más vendido"
                    chip="girando"
                    chipClass="bg-stock-green-bg text-stock-green"
                    rows={topSold}
                    tone="#2d6a4f"
                  />
                  <DetailPanel
                    title="Lo menos vendido"
                    chip="quieto"
                    chipClass="bg-cream-200 text-brown-600"
                    rows={bottomSold}
                    tone="#9c8e82"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
