import { getStockLevel } from './stock'

const numberFormat = new Intl.NumberFormat('es-AR')

export function buildInventoryKpis(products = []) {
  const total = products.length
  const activeProducts = products.filter((product) => product.activo)
  const active = activeProducts.length
  const units = products.reduce(
    (sum, product) => sum + (Number(product.stockActual) || 0),
    0,
  )
  const low = activeProducts.filter((product) => {
    const { code } = getStockLevel(product)
    return code === 'low' || code === 'critical'
  }).length
  const out = activeProducts.filter(
    (product) => (Number(product.stockActual) || 0) <= 0,
  ).length
  const value = products.reduce(
    (sum, product) =>
      sum +
      (Number(product.stockActual) || 0) * (Number(product.precioCosto) || 0),
    0,
  )

  return [
    {
      key: 'total',
      title: 'Total de productos',
      value: numberFormat.format(total),
      unit: 'SKUs',
      badge: `${numberFormat.format(active)} activos`,
      tone: 'green',
    },
    {
      key: 'units',
      title: 'Unidades en stock',
      value: numberFormat.format(units),
      unit: 'unidades',
      badge: `Valorizado en $${numberFormat.format(Math.round(value))}`,
      tone: 'blue',
    },
    {
      key: 'low',
      title: 'Stock bajo',
      value: numberFormat.format(low),
      unit: 'productos',
      badge: 'Requieren reposición',
      tone: 'amber',
    },
    {
      key: 'out',
      title: 'Sin stock',
      value: numberFormat.format(out),
      unit: 'productos',
      badge: 'Atención urgente',
      tone: 'red',
    },
  ]
}
