// Pruebas del generador de .xlsx: formato real, códigos como texto y sin fórmulas.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { unzipSync, strFromU8 } from 'fflate'
import {
  crearXlsx,
  escaparXml,
  letraColumna,
  TIPO_NUMERO,
  TIPO_TEXTO,
} from './xlsx.js'

async function contenidoHoja(blob) {
  const zip = unzipSync(new Uint8Array(await blob.arrayBuffer()))
  return strFromU8(zip['xl/worksheets/sheet1.xml'])
}

test('letraColumna convierte índices a letras de Excel', () => {
  assert.equal(letraColumna(0), 'A')
  assert.equal(letraColumna(25), 'Z')
  assert.equal(letraColumna(26), 'AA')
  assert.equal(letraColumna(27), 'AB')
  assert.equal(letraColumna(701), 'ZZ')
})

test('escaparXml neutraliza los caracteres peligrosos', () => {
  assert.equal(escaparXml('a & b < c > "d" \'e\''), 'a &amp; b &lt; c &gt; &quot;d&quot; &apos;e&apos;')
})

test('el archivo generado es un ZIP válido con la hoja esperada', async () => {
  const blob = crearXlsx({
    hoja: 'Productos',
    columnas: [
      { titulo: 'Codigo', tipo: TIPO_TEXTO },
      { titulo: 'Stock', tipo: TIPO_NUMERO },
    ],
    filas: [['P001', 15]],
  })

  const zip = unzipSync(new Uint8Array(await blob.arrayBuffer()))
  assert.ok(zip['[Content_Types].xml'])
  assert.ok(zip['xl/workbook.xml'])
  assert.ok(zip['xl/worksheets/sheet1.xml'])

  const hoja = strFromU8(zip['xl/worksheets/sheet1.xml'])
  assert.match(hoja, /<t xml:space="preserve">Codigo<\/t>/)
  assert.match(hoja, /<c r="B2"><v>15<\/v><\/c>/)
})

test('los códigos se escriben como texto, no como número', async () => {
  const blob = crearXlsx({
    columnas: [{ titulo: 'Codigo', tipo: TIPO_TEXTO }],
    filas: [['0001']],
  })

  const hoja = await contenidoHoja(blob)
  assert.match(hoja, /<c r="A2" t="inlineStr"><is><t xml:space="preserve">0001<\/t><\/is><\/c>/)
  assert.doesNotMatch(hoja, /<v>0001<\/v>/)
})

test('un valor con "=" queda como texto y no como fórmula', async () => {
  const blob = crearXlsx({
    columnas: [{ titulo: 'Codigo', tipo: TIPO_TEXTO }],
    filas: [['=SUM(A1:A9)']],
  })

  const hoja = await contenidoHoja(blob)
  assert.doesNotMatch(hoja, /<f>/)
  assert.match(hoja, /t="inlineStr"/)
})

test('un número inválido en una columna numérica cae a texto', async () => {
  const blob = crearXlsx({
    columnas: [{ titulo: 'Stock', tipo: TIPO_NUMERO }],
    filas: [['sin dato']],
  })

  const hoja = await contenidoHoja(blob)
  assert.match(hoja, /t="inlineStr"/)
  assert.doesNotMatch(hoja, /<v>NaN<\/v>/)
})

test('las celdas vacías no se escriben', async () => {
  const blob = crearXlsx({
    columnas: [{ titulo: 'A', tipo: TIPO_TEXTO }, { titulo: 'B', tipo: TIPO_TEXTO }],
    filas: [['', 'x']],
  })

  const hoja = await contenidoHoja(blob)
  assert.doesNotMatch(hoja, /<c r="A2"/)
  assert.match(hoja, /<c r="B2" t="inlineStr">/)
})
