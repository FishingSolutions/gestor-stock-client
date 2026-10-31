export default function StockMeter({ product, level, className = '' }) {
 const max = Number(product.stockMaximo) || 0
 const min = Number(product.stockMinimo) || 0
 const current = Number(product.stockActual) || 0

 const fill = max > 0 ? Math.min(100, (current / max) * 100) : 0
 const minLeft = max > 0 ? Math.min(100, (min / max) * 100) : 0

 return (
  <div
   role="img"
   aria-label={`Nivel de stock: ${level.label}`}
   title={level.label}
   className={`relative h-1.5 rounded-full bg-cream-200 ${className}`}
  >
   <div
    className={`h-full rounded-full ${level.barClassName}`}
    style={{ width: `${fill}%` }}
   />
   <div
    className="absolute -top-0.5 -bottom-0.5 w-0.5 rounded bg-cream-400"
    style={{ left: `${minLeft}%` }}
   />
  </div>
 )
}
