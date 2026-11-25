// Pruebas de la exportación de productos y de la plantilla.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { unzipSync, strFromU8 } from 'fflate'
import {
  COLUMNAS_PRODUCTOS,
  crearArchivoProductos,
  filasPlantilla,
  productoAFila,
} from './exportProducts.js'

const PRODUCTO = {
  id: 3,
  codigo: '0001',
  nombre: 'Teclado Logitech',
  descripcion: 'USB',
  categoria: 'Perifericos',
  precioCosto: 11000,
  precioVenta: 15000,
  stockActual: 25,
  stockMinimo: 5,
  stockMaximo: 50,
  activo: true,
}

async function hojaDe(blob) {
  const zip = unzipSync(new Uint8Array(await blob.arrayBuffer()))
  return strFromU8(zip['xl/worksheets/sheet1.xml'])
}

test('las columnas exportadas son las que entiende el importador', () => {
  assert.deepEqual(
    COLUMNAS_PRODUCTOS.map((columna) => columna.titulo),
    [
      'Codigo',
      'Descripcion',
      'Categoria',
      'Stock',
      'Precio',
      'Costo',
      'Detalle',
      'Stock minimo',
      'Stock maximo',
      'Activo',
    ],
  )
})

test('productoAFila respeta el orden y el estado activo', () => {
  assert.deepEqual(productoAFila(PRODUCTO), [
    '0001',
    'Teclado Logitech',
    'Perifericos',
    25,
    15000,
    11000,
    'USB',
    5,
    50,
    'SI',
  ])

  assert.equal(productoAFila({ ...PRODUCTO, activo: false })[9], 'NO')
})

test('"Sin categoría" no se exporta como categoría real', () => {
  assert.equal(productoAFila({ ...PRODUCTO, categoria: 'Sin categoría' })[2], '')
})

test('el archivo exportado conserva los ceros del código', async () => {
  const hoja = await hojaDe(crearArchivoProductos([PRODUCTO]))
  assert.match(hoja, /<t xml:space="preserve">0001<\/t>/)
  assert.match(hoja, /<t xml:space="preserve">Codigo<\/t>/)
})

test('la plantilla trae encabezados y filas de ejemplo', async () => {
  const hoja = await hojaDe(
    crearArchivoProductos(
      filasPlantilla().map((fila) => ({
        codigo: fila[0],
        nombre: fila[1],
        categoria: fila[2],
        stockActual: fila[3],
        precioVenta: fila[4],
        precioCosto: fila[5],
        descripcion: fila[6],
        stockMinimo: fila[7],
        stockMaximo: fila[8],
        activo: fila[9] === 'SI',
      })),
    ),
  )

  assert.match(hoja, /<t xml:space="preserve">P001<\/t>/)
  assert.match(hoja, /<t xml:space="preserve">Codigo<\/t>/)
})
