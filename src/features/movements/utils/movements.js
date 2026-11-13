import { TIPO_LABEL } from '../services/movementsService'

const dayFormat = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })

/* ── Formatos de fecha para la pantalla de movimientos ──────────────────── */

const fullDateFormat = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dayLabelFormat = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const timeFormat = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function localDayKey(iso) {
  const date = new Date(iso)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function todayKey() {
  return localDayKey(new Date().toISOString())
}

function yesterdayKey() {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return localDayKey(date.toISOString())
}

/** Etiqueta del día: "Hoy · 30 oct 2024" / "Ayer · ..." / "28 oct 2024". */
export function formatDayLabel(iso) {
  const key = localDayKey(iso)
  const base = dayLabelFormat.format(new Date(iso))
  if (key === todayKey()) return `Hoy · ${base}`
  if (key === yesterdayKey()) return `Ayer · ${base}`
  return base
}

/** Hora del movimiento: "15:42". */
export function formatTime(iso) {
  return timeFormat.format(new Date(iso))
}

/** Fecha y hora completa: "30/10/2024 · 15:42:10". */
export function formatFullDateTime(iso) {
  const date = new Date(iso)
  return `${fullDateFormat.format(date)} · ${timeFormat.format(date)}:${String(date.getSeconds()).padStart(2, '0')}`
}

/**
 * Agrupa los movimientos por día para el gráfico de actividad:
 * ENTRADA suma a entradas, SALIDA a salidas (los AJUSTE no se grafican).
 * Devuelve un bucket por día, del más viejo al más reciente.
 */
export function buildDailyActivity(movements, days = 30) {
  const buckets = []
  const byKey = new Map()

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date()
    date.setDate(date.getDate() - offset)
    const key = date.toISOString().slice(0, 10)
    const bucket = { key, label: dayFormat.format(date), entradas: 0, salidas: 0 }
    buckets.push(bucket)
    byKey.set(key, bucket)
  }

  movements.forEach((movement) => {
    const bucket = byKey.get(new Date(movement.fecha).toISOString().slice(0, 10))
    if (!bucket) return
    if (movement.tipoRaw === 'ENTRADA') bucket.entradas += movement.cantidad
    if (movement.tipoRaw === 'SALIDA') bucket.salidas += movement.cantidad
  })

  return buckets
}

/**
 * Productos ordenados por unidades vendidas (SALIDAS) en el período:
 * el primero es lo más vendido, el último lo menos vendido con salidas.
 */
export function buildSalesRanking(movements) {
  const byProduct = new Map()

  movements
    .filter((movement) => movement.tipoRaw === 'SALIDA')
    .forEach((movement) => {
      const current = byProduct.get(movement.idProducto)
      if (current) {
        current.sold += movement.cantidad
      } else {
        byProduct.set(movement.idProducto, {
          id: movement.idProducto,
          name: movement.productoNombre,
          sold: movement.cantidad,
        })
      }
    })

  return [...byProduct.values()].sort((a, b) => b.sold - a.sold)
}

export { TIPO_LABEL }

/** CSV del informe (separador ; y BOM para Excel). */
export function exportMovementsCsv(movements, days = 30, monthLabel = null) {
  const headers = [
    'id',
    'fecha',
    'tipo',
    'producto',
    'codigo',
    'cantidad',
    'stock anterior',
    'stock resultante',
    'motivo',
    'operador',
  ]

  const rows = movements.map((movement) => [
    movement.id,
    new Date(movement.fecha).toLocaleString('es-AR'),
    movement.tipo,
    movement.productoNombre,
    movement.productoCodigo,
    movement.cantidad,
    movement.stockAnterior,
    movement.stockResultante,
    movement.motivo,
    movement.operador,
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = monthLabel
    ? `movimientos-${monthLabel}.csv`
    : `movimientos-${days}dias.csv`
  link.click()
  URL.revokeObjectURL(url)
}
