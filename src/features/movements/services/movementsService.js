import { api } from '../../../lib/api'

/**
 * Historial paginado de movimientos (`v_movimiento`).
 *
 * @param {object}  params
 * @param {'all'|'ENTRADA'|'SALIDA'|'AJUSTE'} [params.tipo]
 * @param {string}  [params.idProducto]
 * @param {number}  [params.limit=20]
 * @param {number}  [params.offset=0]
 * @returns {Promise<{ items: Array, total: number, limit: number, offset: number }>}
 */
export async function fetchMovements({
  tipo = 'all',
  idProducto = null,
  limit = 20,
  offset = 0,
  signal,
} = {}) {
  const params = new URLSearchParams()

  if (tipo && tipo !== 'all') params.set('tipo', tipo)
  if (idProducto) params.set('idProducto', idProducto)
  params.set('limit', String(limit))
  params.set('offset', String(offset))

  return api.get(`/api/movimientos?${params.toString()}`, { signal })
}

/**
 * Registra un movimiento. Para AJUSTE, `cantidad` es el stock contado
 * (no la diferencia); la base calcula la variación y actualiza el stock.
 */
export async function createMovement({ idProducto, tipo, cantidad, motivo }) {
  return api.post('/api/movimientos', {
    idProducto,
    tipo,
    cantidad,
    motivo,
  })
}
