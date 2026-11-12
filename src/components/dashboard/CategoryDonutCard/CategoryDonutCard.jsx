import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import Card, { CardHeader } from '../../ui/Card/Card'
import { formatCompactMoney } from '../../../features/products/utils/dashboard'

const numberFormat = new Intl.NumberFormat('es-AR')

// Geometría por estado, igual que el mockup: compacta (modelo 2, rueda a la
// izquierda) y apilada (card extendida del modelo E: rueda grande centrada
// arriba con % alrededor y leyenda a lo ancho abajo).
// El GROSOR del anillo escala proporcional al diámetro (20/130 = 26/170,
// ~15.4% en ambos): si no, la rueda agrandada se ve más gruesa y el cambio
// queda brusco.
const GEO = {
  // Compacta: el svg abraza al anillo (130px de diámetro, 5px de aire por
  // lado) — si el lienzo fuera más grande, ese aire invisible a la izquierda
  // desalineaba el conjunto (más espacio de un lado que del otro)
  compact: { w: 140, h: 140, cx: 70, cy: 70, inner: 45, outer: 65, holeWidth: 80 },
  stacked: { w: 210, h: 210, cx: 105, cy: 105, inner: 59, outer: 85, labelRadius: 96, holeWidth: 110 },
}

const RAD = Math.PI / 180

// Camino de sector de anillo. Mismo sistema de ángulos que Recharts
// (verificado en su fuente: polarToCartesian usa cos(-a)/sin(-a) con
// startAngle 0 → arranca en las 3 en punto y avanza ANTIhorario:
// x = cx + r·cos(a), y = cy − r·sin(a)).
function annulusPath(geo, a0, a1) {
  const point = (radius, angle) =>
    `${(geo.cx + radius * Math.cos(angle * RAD)).toFixed(2)} ${(geo.cy - radius * Math.sin(angle * RAD)).toFixed(2)}`
  const large = a1 - a0 > 180 ? 1 : 0
  // Arco exterior antihorario (sweep 0) y vuelta interior horaria (sweep 1)
  return [
    `M ${point(geo.outer, a0)}`,
    `A ${geo.outer} ${geo.outer} 0 ${large} 0 ${point(geo.outer, a1)}`,
    `L ${point(geo.inner, a1)}`,
    `A ${geo.inner} ${geo.inner} 0 ${large} 1 ${point(geo.inner, a0)}`,
    'Z',
  ].join(' ')
}

/**
 * El anillo de Recharts, congelado: props estáticas y memo. Si nunca se
 * re-renderiza al hacer hover, Recharts no vuelve a disparar su animación
 * (ese era el parpadeo del hover) y ningún texto custom desaparece.
 *
 * El barrido de entrada (el anillo completándose) corre UNA sola vez al
 * montar: onAnimationEnd apaga la animación vía ref (sin re-render), así
 * el toggle apilado/compacto nunca la re-dispara y no compite con el FLIP.
 */
const StaticDonut = memo(function StaticDonut({ items, geo }) {
  const [sweepDone, setSweepDone] = useState(false)

  return (
    <ResponsiveContainer width="100%" height="100%">
      {/* margin en 0: Recharts aplica 5px por defecto en los PolarCharts,
          lo que desplazaba el centro del pie y desalineaba nuestra capa. */}
      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Pie
          data={items}
          dataKey="value"
          nameKey="name"
          cx={geo.cx}
          cy={geo.cy}
          innerRadius={geo.inner}
          outerRadius={geo.outer}
          strokeWidth={0}
          isAnimationActive={!sweepDone}
          onAnimationEnd={() => {
            setSweepDone(true)
          }}
        >
          {items.map((item) => (
            <Cell key={item.name} fill={item.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
})

function DonutSkeleton({ stacked }) {
  const size = stacked ? 170 : 130
  return (
    <div className="flex items-center gap-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando valor por categoría...</span>
      <span
        className="mt-1 shrink-0 animate-pulse rounded-full bg-cream-200"
        style={{ height: size, width: size }}
      />
      <div className="flex w-full min-w-0 flex-col gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index} className="h-7 animate-pulse rounded bg-cream-100" />
        ))}
      </div>
    </div>
  )
}

/**
 * Card "Valor por categoría" del modelo E. Compacta: total en la esquina,
 * rueda a la izquierda, leyenda a la derecha, hueco limpio. Apilada (se
 * activa al abrir "Más detalles" de la card de actividad, como en el
 * mockup): rueda grande centrada arriba con % alrededor, nombre en el
 * hueco al hover y leyenda a lo ancho debajo. La rueda viaja entre estados
 * con FLIP (sin saltos).
 */
export default function CategoryDonutCard({
  items = [],
  total = 0,
  pending = false,
  stacked = false,
  className = '',
}) {
  const [hotIndex, setHotIndex] = useState(-1)
  const hasData = items.length > 0
  const totalValue = items.reduce((sum, item) => sum + item.value, 0)
  const geo = stacked ? GEO.stacked : GEO.compact

  const donutRef = useRef(null)
  const prevCenterRef = useRef(null)

  // Posición de la rueda relativa a la card, vía offsets de layout:
  // no incluyen transforms en curso (el FLIP anima con transform, y
  // getBoundingClientRect lo incluiría y envenenaría la medición).
  const measureCenter = () => {
    const element = donutRef.current
    if (!element) return null
    return {
      x: element.offsetLeft + element.offsetWidth / 2,
      y: element.offsetTop + element.offsetHeight / 2,
      w: element.offsetWidth,
    }
  }

  // La posición guardada tiene que reflejar el layout ESTABLE. Si no,
  // al colapsar los detalles la fila achica con una transición de 0.5s:
  // la rueda compacta queda centrada en la card todavía alta, esa posición
  // fantasma se guarda, y la próxima expansión entra desde abajo.
  // El ResizeObserver re-mide cada vez que la card cambia de tamaño y
  // termina guardando la posición del layout ya asentado.
  useEffect(() => {
    const element = donutRef.current
    const card = element?.closest('section')
    if (!element || !card) return undefined
    const store = () => {
      prevCenterRef.current = measureCenter()
    }
    store()
    const observer = new ResizeObserver(store)
    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  // FLIP: al alternar apilada/compacta, la rueda viaja de su posición
  // previa a la nueva (nada de saltos bruscos)
  useLayoutEffect(() => {
    const element = donutRef.current
    if (!element) return undefined
    const center = measureCenter()
    const prev = prevCenterRef.current
    prevCenterRef.current = center
    if (!prev) return undefined

    const dx = prev.x - center.x
    const dy = prev.y - center.y
    // La escala va por el diámetro del ANILLO (compacta 130 → apilada 170):
    // las cajas cambiaron de tamaño (el svg abraza al anillo), medir por
    // caja haría saltar el tamaño del anillo durante el viaje
    const prevRing = stacked ? 130 : 170
    const newRing = stacked ? 170 : 130
    const scale = prevRing / newRing
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
      return undefined
    }

    element.animate(
      [{ transform: `translate(${dx}px, ${dy}px) scale(${scale})` }, { transform: 'none' }],
      { duration: 500, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    )
    return undefined
  }, [stacked])

  // Ángulos de cada sector (Recharts arranca a las 3 en punto, horario)
  const sectors = useMemo(
    () =>
      items
        .reduce(
          (acc, item) => {
            const sweep = totalValue > 0 ? (item.value / totalValue) * 360 : 0
            acc.sectors.push({
              ...item,
              a0: acc.start,
              a1: acc.start + sweep,
              mid: acc.start + sweep / 2,
            })
            acc.start += sweep
            return acc
          },
          { start: 0, sectors: [] },
        )
        .sectors.flat(),
    [items, totalValue],
  )

  return (
    <Card busy={pending} className={className}>
      <CardHeader title="Valor por categoría" sub="a precio de venta">
        <span className="ml-auto hidden text-right leading-tight min-[900px]:block">
          {pending ? (
            <span className="mt-0.5 block h-5 w-24 animate-pulse rounded bg-cream-200" />
          ) : (
            <>
              <b className="block text-lg font-bold leading-none tabular-nums text-brown-900">
                {formatCompactMoney(total)}
              </b>
              <small className="mt-0.5 block text-[10.5px] font-semibold leading-none text-brown-500">
                total venta
              </small>
            </>
          )}
        </span>
      </CardHeader>

      {pending ? (
        <div className="mt-2 flex flex-1 items-center">
          <DonutSkeleton stacked={stacked} />
        </div>
      ) : hasData ? (
        <div
          className={`mt-1 flex ${
            // Compacta: centrada en la card en ambos ejes (flex-1 + justify-center;
            // la leyenda topa su ancho para que el par rueda+leyenda quede al medio).
            // Apilada: rueda arriba y leyenda debajo, ancladas al top como el mockup.
            stacked
              ? 'flex-col items-center gap-2'
              : 'flex-1 items-center justify-center gap-5'
          }`}
        >
          <div
            ref={donutRef}
            className="relative shrink-0"
            style={{ width: geo.w, height: geo.h }}
          >
            <StaticDonut items={items} geo={geo} />

            {/* Capa de hover + % (nuestra): los % solo en la card apilada,
                siempre con el color de su categoría; el velo blanco atenúa
                los segmentos que no están en hover (idéntico al mockup). */}
            <svg
              aria-hidden="true"
              className="absolute inset-0"
              width={geo.w}
              height={geo.h}
              viewBox={`0 0 ${geo.w} ${geo.h}`}
            >
              {stacked &&
                sectors.map((sector) => {
                  const angle = sector.mid * RAD
                  const x = geo.cx + geo.labelRadius * Math.cos(angle)
                  const y = geo.cy - geo.labelRadius * Math.sin(angle)
                  const anchor =
                    Math.abs(Math.cos(angle)) < 0.35
                      ? 'middle'
                      : x > geo.cx
                        ? 'start'
                        : 'end'

                  return (
                    <text
                      key={`label-${sector.name}`}
                      className="donut-pct"
                      x={x}
                      y={y}
                      fill={sector.color}
                      textAnchor={anchor}
                      dominantBaseline="middle"
                      style={{ fontSize: 10, fontWeight: 700, pointerEvents: 'none' }}
                    >
                      {`${Math.round((sector.value / totalValue) * 100)}%`}
                    </text>
                  )
                })}
              {hotIndex >= 0 &&
                sectors.map((sector, index) =>
                  index === hotIndex ? null : (
                    <path
                      key={`dim-${sector.name}`}
                      d={annulusPath(geo, sector.a0, sector.a1)}
                      fill="#ffffff"
                      fillOpacity={0.78}
                      pointerEvents="none"
                    />
                  ),
                )}
              {sectors.map((sector, index) => {
                // Un sector de ~360° no puede ser un único arco: lo parto en mitades
                const arcs =
                  sector.a1 - sector.a0 >= 359.9
                    ? [
                        [sector.a0, sector.a0 + 180],
                        [sector.a0 + 180, sector.a1],
                      ]
                    : [[sector.a0, sector.a1]]

                return arcs.map(([a0, a1]) => (
                  <path
                    key={`hit-${sector.name}-${a0}`}
                    d={annulusPath(geo, a0, a1)}
                    fill="none"
                    pointerEvents="all"
                    className="cursor-pointer"
                    onMouseEnter={() => setHotIndex(index)}
                    onMouseLeave={() => setHotIndex(-1)}
                  />
                ))
              })}
            </svg>

            {/* Nombre de la categoría en el hueco al hover (con su color) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 grid place-items-center text-center transition-opacity duration-200"
              style={{ opacity: hotIndex === -1 ? 0 : 1 }}
            >
              {hotIndex >= 0 && items[hotIndex] && (
                <div style={{ maxWidth: geo.holeWidth }}>
                  <p
                    className="truncate text-[12.5px] font-bold leading-tight"
                    style={{ color: items[hotIndex].color }}
                  >
                    {items[hotIndex].name}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-brown-500">
                    {numberFormat.format(items[hotIndex].value)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <ul
            className={`flex flex-col gap-0.5 ${
              stacked ? 'w-full' : 'min-w-0 max-w-[230px] flex-1'
            }`}
          >
            {items.map((item, index) => (
              <li key={item.name}>
                <button
                  type="button"
                  onMouseEnter={() => setHotIndex(index)}
                  onMouseLeave={() => setHotIndex(-1)}
                  onFocus={() => setHotIndex(index)}
                  onBlur={() => setHotIndex(-1)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] transition-colors ${
                    hotIndex === index ? 'bg-alabaster' : 'hover:bg-alabaster'
                  }`}
                >
                  <i
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  <b className="shrink-0 text-[13px] font-bold tabular-nums text-brown-900">
                    {numberFormat.format(item.value)}
                  </b>
                  <small className="w-9 shrink-0 text-right text-[11px] text-brown-500 tabular-nums">
                    {Math.round((item.value / totalValue) * 100)}%
                  </small>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center py-10 text-center text-[11.5px] text-brown-400">
          Cargá productos con stock para ver el valor por categoría.
        </div>
      )}
    </Card>
  )
}
