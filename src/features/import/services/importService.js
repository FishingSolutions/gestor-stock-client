// =====================================================================
// Cliente de la Edge Function `importar-productos-ia`.
//
// Toda la lógica vive en el servidor (Supabase): acá solo se manda el
// archivo con la sesión del usuario. Nunca se usan claves secretas.
// =====================================================================
import { supabase } from '../../../lib/supabase'

const FUNCION = 'importar-productos-ia'

export class ImportError extends Error {
  constructor(mensaje, { codigo = null, estado = 0, detalles = null, cuerpo = null } = {}) {
    super(mensaje)
    this.name = 'ImportError'
    this.codigo = codigo
    this.estado = estado
    this.detalles = detalles
    this.cuerpo = cuerpo
  }
}

async function invocar(datos) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new ImportError('Tenés que iniciar sesión para importar productos.', {
      codigo: 'SIN_SESION',
      estado: 401,
    })
  }

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FUNCION}`

  let respuesta
  try {
    respuesta = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: datos,
    })
  } catch {
    throw new ImportError(
      'No pudimos conectarnos con el servidor de importación. Revisá tu conexión e intentá de nuevo.',
      { codigo: 'SIN_CONEXION' },
    )
  }

  let cuerpo = null
  try {
    cuerpo = await respuesta.json()
  } catch {
    // El servidor respondió algo que no es JSON (proxy, timeout, etc.)
  }

  if (!respuesta.ok || cuerpo?.ok === false) {
    const error = cuerpo?.error ?? {}
    throw new ImportError(
      error.mensaje || 'No se pudo completar la importación. Intentá de nuevo.',
      {
        codigo: error.codigo ?? `HTTP_${respuesta.status}`,
        estado: respuesta.status,
        detalles: error.detalles ?? null,
        cuerpo,
      },
    )
  }

  return cuerpo
}

/**
 * Paso 1: analiza el archivo sin escribir nada.
 * @param {{archivo: File, hoja?: string|null, modoStock?: 'REEMPLAZAR'|'SUMAR'|null, mapeo?: object|null}} opciones
 */
export async function analizarImportacion({ archivo, hoja = null, modoStock = null, mapeo = null }) {
  const datos = new FormData()
  datos.append('accion', 'analizar')
  datos.append('archivo', archivo)
  if (hoja) datos.append('hoja', hoja)
  if (modoStock) datos.append('modoStock', modoStock)
  if (mapeo) datos.append('mapeo', JSON.stringify(mapeo))

  return invocar(datos)
}

/**
 * Paso 2: aplica el lote ya revisado, en una transacción.
 */
export async function confirmarImportacion({
  archivo,
  hoja = null,
  modoStock = null,
  mapeo = null,
  decisiones = {},
  crearCategorias = false,
  idempotencyKey,
  ia = null,
}) {
  const datos = new FormData()
  datos.append('accion', 'confirmar')
  datos.append('archivo', archivo)
  datos.append('idempotencyKey', idempotencyKey)
  datos.append('crearCategorias', String(Boolean(crearCategorias)))
  datos.append('decisiones', JSON.stringify(decisiones ?? {}))
  if (hoja) datos.append('hoja', hoja)
  if (modoStock) datos.append('modoStock', modoStock)
  if (mapeo) datos.append('mapeo', JSON.stringify(mapeo))
  if (ia) datos.append('ia', JSON.stringify(ia))

  return invocar(datos)
}

/** Clave para que reintentar la misma confirmación no duplique nada. */
export function crearClaveIdempotencia() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()

  // Respaldo para navegadores viejos
  const bytes = new Uint8Array(16)
  globalThis.crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
