// =====================================================================
// Generador mínimo de archivos .xlsx (sin dependencias pesadas).
//
// Un .xlsx es un ZIP con unos pocos XML adentro. Se arma a mano para:
//   * controlar que los códigos y textos queden SIEMPRE como texto
//     (así "0001" no pierde los ceros y "=SUM(A1)" no se ejecuta);
//   * no cargar una librería de Excel entera en el navegador;
//   * poder probarlo con tests sin navegador.
//
// Los textos se escriben como `inlineStr`, que Excel interpreta como texto
// literal: nunca como fórmula.
// =====================================================================
import { zipSync, strToU8 } from 'fflate'

export const TIPO_TEXTO = 'texto'
export const TIPO_NUMERO = 'numero'

const CONTENIDO_XLSX =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/** 0 -> A, 25 -> Z, 26 -> AA */
export function letraColumna(indice) {
  let letra = ''
  let n = indice

  while (n >= 0) {
    letra = String.fromCharCode((n % 26) + 65) + letra
    n = Math.floor(n / 26) - 1
  }

  return letra
}

export function escaparXml(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function celdaDeTexto(ref, valor) {
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escaparXml(valor)}</t></is></c>`
}

function celdaDeNumero(ref, valor) {
  return `<c r="${ref}"><v>${valor}</v></c>`
}

/**
 * Convierte un valor a XML de celda.
 * - Los números solo se escriben como número si la columna es numérica y el
 *   valor es un número finito. Cualquier otra cosa va como texto.
 */
function celdaXml(ref, valor, tipo) {
  if (valor === null || valor === undefined || valor === '') return ''

  if (tipo === TIPO_NUMERO) {
    const numero = typeof valor === 'number' ? valor : Number(valor)
    if (Number.isFinite(numero)) return celdaDeNumero(ref, numero)
  }

  return celdaDeTexto(ref, valor)
}

function hojaXml(columnas, filas) {
  const refs = columnas.map((_, indice) => letraColumna(indice))
  const ultimaColumna = refs[refs.length - 1] ?? 'A'
  const ultimaFila = filas.length + 1

  const cols = columnas
    .map((columna, indice) => {
      const ancho = Number(columna.ancho) || Math.max(12, Math.min(40, String(columna.titulo).length + 6))
      return `<col min="${indice + 1}" max="${indice + 1}" width="${ancho}" customWidth="1"/>`
    })
    .join('')

  const filaEncabezado =
    '<row r="1">' +
    columnas
      .map((columna, indice) => celdaDeTexto(`${refs[indice]}1`, columna.titulo))
      .join('') +
    '</row>'

  const filasDatos = filas
    .map((fila, indiceFila) => {
      const numeroFila = indiceFila + 2
      const celdas = columnas
        .map((columna, indiceColumna) =>
          celdaXml(`${refs[indiceColumna]}${numeroFila}`, fila[indiceColumna], columna.tipo),
        )
        .join('')
      return `<row r="${numeroFila}">${celdas}</row>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<dimension ref="A1:${ultimaColumna}${ultimaFila}"/>
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/>
<cols>${cols}</cols>
<sheetData>${filaEncabezado}${filasDatos}</sheetData>
</worksheet>`
}

function libroXml(nombreHoja) {
  const nombre = escaparXml(String(nombreHoja).slice(0, 31) || 'Productos')
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${nombre}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`
}

/**
 * Arma el archivo .xlsx y devuelve un Blob listo para descargar.
 *
 * @param {object}   opciones
 * @param {string}   [opciones.hoja='Productos']
 * @param {{titulo:string, tipo?:string, ancho?:number}[]} opciones.columnas
 * @param {(string|number|null)[][]} opciones.filas
 * @returns {Blob}
 */
export function crearXlsx({ hoja = 'Productos', columnas, filas }) {
  if (!Array.isArray(columnas) || columnas.length === 0) {
    throw new Error('El archivo necesita al menos una columna.')
  }

  const archivos = {
    '[Content_Types].xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`),
    '_rels/.rels': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`),
    'xl/workbook.xml': strToU8(libroXml(hoja)),
    'xl/_rels/workbook.xml.rels': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`),
    'xl/worksheets/sheet1.xml': strToU8(hojaXml(columnas, filas)),
  }

  const zip = zipSync(archivos, { level: 6 })
  return new Blob([zip], { type: CONTENIDO_XLSX })
}

/** Dispara la descarga de un Blob en el navegador. */
export function descargarBlob(blob, nombreArchivo) {
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  // Se libera en el próximo ciclo para no cortar la descarga.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Fecha para el nombre del archivo: 2026-11-18 */
export function fechaArchivo(fecha = new Date()) {
  return fecha.toISOString().slice(0, 10)
}
