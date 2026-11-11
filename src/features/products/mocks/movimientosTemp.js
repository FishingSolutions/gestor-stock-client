// ⚠️ TEMPORAL — capa de movimientos de stock mientras Supabase no soporta
// escribir en `movimiento_stock` (falta GRANT + RPC `ajustar_stock`).
// - El UPDATE del stock en `producto` es REAL (lo permite Supabase).
// - El REGISTRO del movimiento se persiste acá (localStorage) para no perderlo.
// Cuando exista la RPC: borrar este archivo y leer `v_movimiento` directo.

const STORAGE_KEY = 'stockfx-movimientos-temp'

// Datos de semilla (producto #1, Aceite de girasol) para que la vista no
// nazca vacía. Una vez persistido el storage, esto ya no se usa.
const SEED = [
  {
    id: 4,
    idProducto: 1,
    tipo: 'EGRESO',
    cantidad: 6,
    stockAnterior: 36,
    stockResultante: 30,
    motivo: 'Venta mayorista',
    fecha: '2026-11-07T10:42:00',
  },
  {
    id: 3,
    idProducto: 1,
    tipo: 'INGRESO',
    cantidad: 20,
    stockAnterior: 16,
    stockResultante: 36,
    motivo: 'Compra proveedor',
    fecha: '2026-11-05T09:15:00',
  },
  {
    id: 2,
    idProducto: 1,
    tipo: 'AJUSTE',
    cantidad: 4,
    stockAnterior: 20,
    stockResultante: 16,
    motivo: 'Rotura de 2 unidades',
    fecha: '2026-10-28T17:03:00',
  },
  {
    id: 1,
    idProducto: 1,
    tipo: 'INGRESO',
    cantidad: 20,
    stockAnterior: 0,
    stockResultante: 20,
    motivo: 'Alta del producto',
    fecha: '2026-10-21T08:30:00',
  },
]

function load() {
  if (typeof window === 'undefined') return SEED

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // Storage corrupto o bloqueado: arrancamos de nuevo con la semilla.
  }

  save(SEED)
  return SEED
}

function save(movimientos) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(movimientos))
  } catch {
    // Sin persistencia disponible: los movimientos viven solo en memoria.
  }
}

/**
 * Registra un movimiento (típicamente un AJUSTE hecho desde el drawer) y lo
 * persiste. Devuelve el movimiento creado.
 */
export function registrarMovimientoTemp({
  idProducto,
  tipo,
  cantidad,
  stockAnterior,
  stockResultante,
  motivo,
}) {
  const movimientos = load()
  const movimiento = {
    id: Date.now(),
    idProducto,
    tipo,
    cantidad,
    stockAnterior,
    stockResultante,
    motivo: motivo.trim(),
    fecha: new Date().toISOString(),
  }

  save([movimiento, ...movimientos])
  return movimiento
}
