import { supabase } from '../../../lib/supabase'

// Labels visibles para el CHECK de la base: ENTRADA / SALIDA / AJUSTE
export const TIPO_LABEL = {
  ENTRADA: 'Entradas',
  SALIDA: 'Salidas',
  AJUSTE: 'Ajustes',
}

const MOVEMENT_FIELDS = `
  id_movimiento,
  id_producto,
  tipo_movimiento,
  cantidad,
  motivo,
  fecha_movimiento,
  stock_anterior,
  stock_resultante,
  producto ( nombre, codigo ),
  usuario ( nombre, apellido )
`

function mapMovement(row) {
  return {
    id: row.id_movimiento,
    idProducto: row.id_producto,
    tipoRaw: row.tipo_movimiento,
    tipo: TIPO_LABEL[row.tipo_movimiento] ?? row.tipo_movimiento,
    cantidad: Number(row.cantidad) || 0,
    motivo: row.motivo || '—',
    fecha: row.fecha_movimiento,
    stockAnterior: Number(row.stock_anterior) || 0,
    stockResultante: Number(row.stock_resultante) || 0,
    productoNombre: row.producto?.nombre ?? 'Producto eliminado',
    productoCodigo: row.producto?.codigo ?? '—',
    operador:
      [row.usuario?.nombre, row.usuario?.apellido].filter(Boolean).join(' ') ||
      '—',
  }
}

export async function fetchRecentMovements(days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('movimiento_stock')
    .select(MOVEMENT_FIELDS)
    .gte('fecha_movimiento', since.toISOString())
    .order('fecha_movimiento', { ascending: false })

  if (error) throw error

  return (data ?? []).map(mapMovement)
}

/* ── Pantalla de movimientos: listado paginado y filtrable ──────────────── */

// Campos de página: suman mín/máx y categoría (los usa la regla del drawer).
const PAGE_FIELDS = `
  id_movimiento,
  id_producto,
  tipo_movimiento,
  cantidad,
  motivo,
  fecha_movimiento,
  stock_anterior,
  stock_resultante,
  producto ( nombre, codigo, stock_minimo, stock_maximo, categoria ( nombre ) ),
  usuario ( nombre, apellido )
`

function mapPageMovement(row) {
  const stockAnterior = Number(row.stock_anterior) || 0
  const stockResultante = Number(row.stock_resultante) || 0

  return {
    id: row.id_movimiento,
    idProducto: row.id_producto,
    tipoRaw: row.tipo_movimiento,
    tipo: TIPO_LABEL[row.tipo_movimiento] ?? row.tipo_movimiento,
    cantidad: Number(row.cantidad) || 0,
    variacion: stockResultante - stockAnterior,
    motivo: row.motivo || '',
    fecha: row.fecha_movimiento,
    stockAnterior,
    stockResultante,
    productoNombre: row.producto?.nombre ?? 'Producto eliminado',
    productoCodigo: row.producto?.codigo ?? '—',
    productoCategoria: row.producto?.categoria?.nombre ?? '',
    productoMin: Number(row.producto?.stock_minimo) || 0,
    productoMax: Number(row.producto?.stock_maximo) || 0,
    operador:
      [row.usuario?.nombre, row.usuario?.apellido].filter(Boolean).join(' ') ||
      '—',
  }
}

/**
 * Rango de fechas: un mes calendario (YYYY-MM) o los últimos N días.
 */
function withDateRange(query, { days = 30, month = null }) {
  if (month) {
    const [year, monthIndex] = month.split('-').map(Number)
    const start = new Date(year, monthIndex - 1, 1)
    const end = new Date(year, monthIndex, 1)
    return query
      .gte('fecha_movimiento', start.toISOString())
      .lt('fecha_movimiento', end.toISOString())
  }

  const since = new Date()
  since.setDate(since.getDate() - days)
  return query.gte('fecha_movimiento', since.toISOString())
}

/**
 * Listado paginado. month = "YYYY-MM" filtra ese mes; si no, últimos days días.
 */
export async function fetchMovementsPage({
  tipo = 'all',
  search = '',
  days = 30,
  month = null,
  limit = 10,
  page = 1,
} = {}) {
  let query = supabase
    .from('movimiento_stock')
    .select(PAGE_FIELDS, { count: 'exact' })

  query = withDateRange(query, { days, month })

  if (tipo && tipo !== 'all') {
    query = query.eq('tipo_movimiento', tipo)
  }

  const term = search.trim().replace(/[,()%]/g, ' ').trim()
  if (term) {
    query = query.or(
      `producto.nombre.ilike.%${term}%,producto.codigo.ilike.%${term}%`,
    )
  }

  const from = (page - 1) * limit

  const { data, error, count } = await query
    .order('fecha_movimiento', { ascending: false })
    .range(from, from + limit - 1)

  if (error) throw error

  return { items: (data ?? []).map(mapPageMovement), total: count ?? 0 }
}

/** Un movimiento por id (para abrir el drawer desde el dashboard). */
export async function fetchMovementById(id) {
  const { data, error } = await supabase
    .from('movimiento_stock')
    .select(PAGE_FIELDS)
    .eq('id_movimiento', id)
    .maybeSingle()

  if (error) throw error
  return data ? mapPageMovement(data) : null
}

/** Totales del período para los KPIs (solo campos mínimos, en tandas). */
export async function fetchMovementStats({ days = 30, month = null } = {}) {
  const rows = []
  let from = 0

  while (true) {
    const { data, error } = await withDateRange(
      supabase.from('movimiento_stock').select('tipo_movimiento, cantidad'),
      { days, month },
    )
      .order('id_movimiento', { ascending: false })
      .range(from, from + 999)

    if (error) throw error

    const batch = data ?? []
    rows.push(...batch)

    if (batch.length < 1000) break
    from += 1000
  }

  return rows.reduce(
    (acc, row) => {
      const qty = Number(row.cantidad) || 0

      if (row.tipo_movimiento === 'ENTRADA') {
        acc.entradasUnidades += qty
      } else if (row.tipo_movimiento === 'SALIDA') {
        acc.salidasUnidades += qty
      } else if (row.tipo_movimiento === 'AJUSTE') {
        acc.ajustes += 1
      }

      acc.total += 1
      return acc
    },
    {
      total: 0,
      entradasUnidades: 0,
      salidasUnidades: 0,
      ajustes: 0,
    },
  )
}
