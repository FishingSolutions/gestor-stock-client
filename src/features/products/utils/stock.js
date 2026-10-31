export const STOCK_CRITICAL_RATIO = 0.5
export const STOCK_OK_RATIO = 1

const TONES = {
  green: {
    barClassName: 'bg-stock-green',
    textClassName: 'text-stock-green',
    dotClassName: 'bg-stock-green',
    chipClassName: 'bg-stock-green-bg',
  },
  amber: {
    barClassName: 'bg-stock-amber',
    textClassName: 'text-stock-amber',
    dotClassName: 'bg-stock-amber',
    chipClassName: 'bg-stock-amber-bg',
  },
  red: {
    barClassName: 'bg-stock-red',
    textClassName: 'text-stock-red',
    dotClassName: 'bg-stock-red',
    chipClassName: 'bg-stock-red-bg',
  },
}

export function getStockLevel(product) {
  const stock = Number(product.stockActual) || 0
  const min = Number(product.stockMinimo) || 0

  if (stock <= 0) {
    return { code: 'empty', key: 'out', label: 'Sin stock', ...TONES.red }
  }

  const ratio = min > 0 ? stock / min : Number.POSITIVE_INFINITY

  if (ratio < STOCK_CRITICAL_RATIO) {
    return { code: 'critical', key: 'out', label: 'Crítico', ...TONES.red }
  }

  if (ratio <= STOCK_OK_RATIO) {
    return { code: 'low', key: 'low', label: 'Reponer', ...TONES.amber }
  }

  return { code: 'ok', key: 'ok', label: 'OK', ...TONES.green }
}
