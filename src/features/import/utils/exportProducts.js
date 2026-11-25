// =====================================================================
// Exportación real de productos y plantilla de importación.
//
// Las columnas son exactamente las que entiende el importador (alias en
// `_shared/importacion/mapeo.ts`), así que el archivo exportado se puede
// volver a importar sin tocar nada.
//
// Los códigos y textos van como TEXTO: "0001" conserva los ceros y un
// valor que empieza con "=" no se ejecuta como fórmula en Excel.
// =====================================================================
import { crearXlsx, descargarBlob, fechaArchivo, TIPO_NUMERO, TIPO_TEXTO } from './xlsx.js'

export const COLUMNAS_PRODUCTOS = [
  { titulo: 'Codigo', tipo: TIPO_TEXTO, ancho: 16 },
  { titulo: 'Descripcion', tipo: TIPO_TEXTO, ancho: 34 },
  { titulo: 'Categoria', tipo: TIPO_TEXTO, ancho: 18 },
  { titulo: 'Stock', tipo: TIPO_NUMERO, ancho: 10 },
  { titulo: 'Precio', tipo: TIPO_NUMERO, ancho: 12 },
  { titulo: 'Costo', tipo: TIPO_NUMERO, ancho: 12 },
  { titulo: 'Detalle', tipo: TIPO_TEXTO, ancho: 32 },
  { titulo: 'Stock minimo', tipo: TIPO_NUMERO, ancho: 14 },
  { titulo: 'Stock maximo', tipo: TIPO_NUMERO, ancho: 14 },
  { titulo: 'Activo', tipo: TIPO_TEXTO, ancho: 10 },
]

/** Producto del front -> fila de la planilla. */
export function productoAFila(producto) {
  return [
    producto.codigo ?? '',
    producto.nombre ?? '',
    producto.categoria && producto.categoria !== 'Sin categoría' ? producto.categoria : '',
    Number(producto.stockActual) || 0,
    Number(producto.precioVenta) || 0,
    Number(producto.precioCosto) || 0,
    producto.descripcion ?? '',
    Number(producto.stockMinimo) || 0,
    Number(producto.stockMaximo) || 0,
    producto.activo === false ? 'NO' : 'SI',
  ]
}

/** Filas de ejemplo para la plantilla (se pueden borrar y completar). */
export function filasPlantilla() {
  return [
    ['P001', 'Teclado Logitech', 'Perifericos', 25, 15000, 11000, 'Teclado USB en español', 5, 50, 'SI'],
    ['P002', 'Mouse Genius', 'Perifericos', 40, 8500, 6000, '', 10, 60, 'SI'],
  ]
}

export function crearArchivoProductos(productos) {
  return crearXlsx({
    hoja: 'Productos',
    columnas: COLUMNAS_PRODUCTOS,
    filas: productos.map(productoAFila),
  })
}

/**
 * Descarga el inventario en Excel.
 * @param {object[]} productos
 * @param {{sufijo?: string}} [opciones]
 */
export function exportarProductosExcel(productos, { sufijo = '' } = {}) {
  if (!Array.isArray(productos) || productos.length === 0) {
    throw new Error('No hay productos para exportar.')
  }

  const blob = crearArchivoProductos(productos)
  const nombre = `productos${sufijo ? `-${sufijo}` : ''}-${fechaArchivo()}.xlsx`
  descargarBlob(blob, nombre)
  return nombre
}

/** Descarga la plantilla vacía con las columnas del importador. */
export function descargarPlantillaProductos() {
  const blob = crearXlsx({
    hoja: 'Productos',
    columnas: COLUMNAS_PRODUCTOS,
    filas: filasPlantilla(),
  })
  descargarBlob(blob, 'plantilla-productos.xlsx')
}
