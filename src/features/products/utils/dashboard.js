import { getStockLevel } from './stock'

const numberFormat = new Intl.NumberFormat('es-AR')

/**
 * Paleta del mockup, asignada por RANKING de valor: el más valioso rust,
 * segundo ocre, tercero verde, cuarto marrón, quinto tan. Así la rueda
 * queda con la secuencia del mockup sin importar cómo se llamen las
 * categorías reales (con más de 5 entran tonos de la misma paleta).
 */
const PALETTE = [
  '#8d3f1b',
  '#b3743a',
  '#2d6a4f',
  '#55433c',
  '#9c8e82',
  '#723214',
  '#840019',
  '#3e302a',
]

export function formatMoney(value) {
  return `$${numberFormat.format(Math.round(Number(value) || 0))}`
}

export function formatCompactMoney(value) {
  const amount = Number(value) || 0
  // Estilo del mockup: millones abreviados con M ($1.08M); debajo de 1M,
  // número completo
  if (Math.abs(amount) >= 1e6) {
    return `$${(amount / 1e6).toFixed(2)}M`
  }
  return `$${numberFormat.format(Math.round(amount))}`
}

/**
 * Valor del inventario por categoría (a precio de venta), para el donut.
 * Devuelve { items: [{ name, value, color }], total } ordenado de mayor a menor.
 */
export function buildCategoryValue(products = []) {
  const byCategory = new Map()
  let total = 0

  products.forEach((product) => {
    const name = product.categoria || 'Sin categoría'
    const value =
      (Number(product.stockActual) || 0) * (Number(product.precioVenta) || 0)
    total += value
    byCategory.set(name, (byCategory.get(name) || 0) + value)
  })

  const items = [...byCategory.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({ ...item, color: PALETTE[index % PALETTE.length] }))

  return { items, total: Math.round(total) }
}

/**
 * Productos activos con stock bajo / crítico / sin stock, ordenados por
 * gravedad: primero los que no tienen nada, después los más por debajo
 * de su mínimo.
 */
export function buildLowStockProducts(products = []) {
  const severity = (product) => {
    const stock = Number(product.stockActual) || 0
    const min = Number(product.stockMinimo) || 0
    if (stock <= 0) return -1
    if (min <= 0) return Number.POSITIVE_INFINITY
    return stock / min
  }

  return products
    .filter((product) => product.activo)
    .map((product) => ({ ...product, level: getStockLevel(product) }))
    .filter(({ level }) => level.code !== 'ok')
    .sort((a, b) => severity(a) - severity(b))
}
