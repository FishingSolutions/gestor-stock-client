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
