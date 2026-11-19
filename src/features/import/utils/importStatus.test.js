// Pruebas de etiquetas y del resumen que se muestra antes de confirmar.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  claseEstado,
  etiquetaEstado,
  formatearMoneda,
  formatearNumero,
  mensajeIA,
  resumirSeleccion,
  stockPropuesto,
  tieneCambioDeStock,
} from './importStatus.js'

const fila = (numeroFila, estado, extra = {}) => ({
  fila: numeroFila,
  estado,
  errores: [],
  cambios: [],
  actual: null,
  stock: null,
  ...extra,
})

test('cada estado tiene etiqueta y color', () => {
  assert.equal(etiquetaEstado('nuevo'), 'Nuevo')
  assert.equal(etiquetaEstado('ambigua'), 'Revisar')
  assert.equal(etiquetaEstado('invalida'), 'Inválida')
  assert.match(claseEstado('nuevo'), /stock-green/)
  assert.match(claseEstado('ambigua'), /stock-red/)
})

test('solo se muestran mensajes de IA conocidos', () => {
  assert.match(mensajeIA('IA_NO_CONFIGURADA'), /IA no configurada/)
  assert.match(mensajeIA('IA_TIMEOUT'), /no respondió/)
  assert.equal(mensajeIA(null), null)
  assert.equal(mensajeIA('NO_HIZO_FALTA'), null)
})

test('formatea números y precios en formato argentino', () => {
  assert.equal(formatearNumero(1500), '1.500')
  assert.equal(formatearNumero(null), '—')
  assert.equal(formatearMoneda(1500.5), '$1.500,5')
})

test('el stock propuesto depende del modo elegido', () => {
  const datos = fila(2, 'existente', { stock: 10, actual: { stock: 25 } })

  assert.equal(stockPropuesto(datos, 'SUMAR'), 35)
  assert.equal(stockPropuesto(datos, 'REEMPLAZAR'), 10)
  assert.equal(tieneCambioDeStock(datos, 'SUMAR'), true)
  assert.equal(tieneCambioDeStock(datos, null), false)
})

test('reemplazar por el mismo stock no es un cambio', () => {
  const datos = fila(2, 'sin_cambios', { stock: 25, actual: { stock: 25 } })

  assert.equal(tieneCambioDeStock(datos, 'REEMPLAZAR'), false)
  assert.equal(tieneCambioDeStock(datos, 'SUMAR'), true)
})

test('el resumen cuenta crear, actualizar, excluir y pendientes', () => {
  const filas = [
    fila(2, 'nuevo'),
    fila(3, 'existente'),
    fila(4, 'sin_cambios'),
    fila(5, 'invalida'),
    fila(6, 'ambigua'),
  ]

  const resumen = resumirSeleccion(filas, { 5: false }, {})

  assert.equal(resumen.crear, 1)
  assert.equal(resumen.actualizar, 1)
  assert.equal(resumen.sinCambios, 1)
  assert.equal(resumen.excluir, 1) // la inválida siempre queda afuera
  assert.equal(resumen.pendientes, 1) // la ambigua sin decisión
})

test('resolver una ambigua la saca de pendientes', () => {
  const filas = [fila(2, 'ambigua')]

  assert.deepEqual(resumirSeleccion(filas, {}, { 2: 'crear' }), {
    crear: 1,
    actualizar: 0,
    sinCambios: 0,
    excluir: 0,
    pendientes: 0,
  })

  const vincular = resumirSeleccion(filas, {}, { 2: 'vincular:7' })
  assert.equal(vincular.actualizar, 1)
  assert.equal(vincular.pendientes, 0)
})

test('excluir a mano una fila válida se cuenta como excluida', () => {
  const resumen = resumirSeleccion([fila(2, 'nuevo')], { 2: false }, {})
  assert.equal(resumen.excluir, 1)
  assert.equal(resumen.crear, 0)
})
