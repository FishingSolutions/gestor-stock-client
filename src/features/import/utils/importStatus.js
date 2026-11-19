// =====================================================================
// Etiquetas y cálculos de la vista previa de importación.
//
// Se separa de los componentes para poder probarlo sin React.
// =====================================================================

export const ESTADOS = {
  nuevo: {
    label: 'Nuevo',
    descripcion: 'Se va a crear el producto.',
    clase: 'bg-stock-green-bg text-stock-green',
  },
  existente: {
    label: 'Existente',
    descripcion: 'Se va a actualizar el producto.',
    clase: 'bg-stock-amber-bg text-stock-amber',
  },
  sin_cambios: {
    label: 'Sin cambios',
    descripcion: 'No hay nada para modificar.',
    clase: 'bg-cream-200 text-brown-700',
  },
  ambigua: {
    label: 'Revisar',
    descripcion: 'El nombre se parece a un producto existente.',
    clase: 'bg-stock-red-bg text-stock-red',
  },
  invalida: {
    label: 'Inválida',
    descripcion: 'Tiene un error y no se puede importar.',
    clase: 'bg-stock-red-bg text-stock-red',
  },
}

export function etiquetaEstado(estado) {
  return ESTADOS[estado]?.label ?? estado
}

export function claseEstado(estado) {
  return ESTADOS[estado]?.clase ?? 'bg-cream-200 text-brown-700'
}

/** Motivos por los que la IA no se usó: se muestran como aviso, no como error. */
export const MENSAJES_IA = {
  IA_NO_CONFIGURADA: 'IA no configurada: las columnas se interpretaron por sus encabezados.',
  IA_SIN_CUOTA: 'La IA alcanzó su límite de uso gratuito: se usó el mapeo por encabezados.',
  IA_LIMITE_DIARIO: 'Se alcanzó el límite diario de IA configurado: se usó el mapeo por encabezados.',
  IA_TIMEOUT: 'La IA no respondió a tiempo: se usó el mapeo por encabezados.',
  IA_RESPUESTA_INVALIDA: 'La IA devolvió una respuesta inválida: se usó el mapeo por encabezados.',
  IA_RESPUESTA_VACIA: 'La IA no devolvió nada: se usó el mapeo por encabezados.',
  IA_NO_DISPONIBLE: 'No se pudo contactar a la IA: se usó el mapeo por encabezados.',
  IA_SIN_APORTES: 'La IA no aportó columnas nuevas: se usó el mapeo por encabezados.',
}

export function mensajeIA(motivo) {
  if (!motivo) return null
  return MENSAJES_IA[motivo] ?? null
}

const numero = new Intl.NumberFormat('es-AR')

export function formatearNumero(valor) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return '—'
  return numero.format(Number(valor))
}

export function formatearMoneda(valor) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return '—'
  return `$${numero.format(Number(valor))}`
}

/** Stock que quedará si se importa con el modo elegido. */
export function stockPropuesto(fila, modo) {
  if (!fila) return null
  if (modo === 'SUMAR') {
    const actual = fila.actual?.stock ?? 0
    return (fila.stock ?? 0) + actual
  }
  if (modo === 'REEMPLAZAR') return fila.stock
  return fila.stock
}

/** Cambios reales de la fila (sin contar el stock, que depende del modo). */
export function cambiosSinStock(fila) {
  return (fila?.cambios ?? []).filter((cambio) => cambio.campo !== 'stock')
}

export function tieneCambioDeStock(fila, modo) {
  if (!fila || !modo || fila.stock === null || fila.stock === undefined) return false
  const actual = fila.actual?.stock ?? 0
  return stockPropuesto(fila, modo) !== actual
}

/**
 * Cuenta qué va a pasar con las filas tal como están elegidas.
 * Se usa para mostrar el resumen antes de confirmar.
 */
export function resumirSeleccion(filas, incluidas, resoluciones = {}) {
  const resumen = {
    crear: 0,
    actualizar: 0,
    sinCambios: 0,
    excluir: 0,
    pendientes: 0,
  }

  for (const fila of filas) {
    const incluir = incluidas[String(fila.fila)] ?? true

    if (!incluir) {
      resumen.excluir++
      continue
    }
    if (fila.estado === 'invalida') {
      resumen.excluir++
      continue
    }
    if (fila.estado === 'ambigua') {
      const resolucion = resoluciones[String(fila.fila)]
      if (!resolucion || resolucion === 'excluir') {
        resumen.pendientes++
        continue
      }
      if (resolucion === 'crear') resumen.crear++
      else resumen.actualizar++
      continue
    }
    if (fila.estado === 'nuevo') resumen.crear++
    else if (fila.estado === 'sin_cambios') resumen.sinCambios++
    else resumen.actualizar++
  }

  return resumen
}

/** Compara dos textos para resaltar cambios de nombre. */
export function textoCambio(antes, despues) {
  if (antes === despues) return { antes, despues, iguales: true }
  return { antes, despues, iguales: false }
}
