import { formatPrice } from '../../../features/products/utils/format'
import { getStockLevel } from '../../../features/products/utils/stock'
import ActiveBadge from '../ActiveBadge/ActiveBadge'
import ProductActions from '../ProductActions/ProductActions'
import StockMeter from '../StockMeter/StockMeter'
import StockTag from '../StockTag/StockTag'

export default function ProductCard({ product }) {
  const level = getStockLevel(product)

  return (
    <article className="rounded-lg bg-white p-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-semibold leading-snug text-brown-900">
            {product.nombre}
          </h3>
          <p className="mt-0.5 text-[10.5px] text-brown-500">
            {product.codigo} · {product.categoria || 'Sin categoría'}
          </p>
        </div>
        <ActiveBadge activo={product.activo} />
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-[14px] font-bold tabular-nums text-brown-900">
            {formatPrice(product.precioVenta)}
          </p>
          <p className="mt-0.5 text-[10px] text-brown-500">
            Costo {formatPrice(product.precioCosto)}
          </p>
        </div>
        <span className="pb-0.5 text-[10.5px] tabular-nums text-brown-500">
          {product.stockActual} de {product.stockMaximo} un.
        </span>
      </div>

      <StockMeter product={product} level={level} className="mt-2" />

      <div className="mt-1 flex items-center gap-1 text-[10px] text-brown-500">
        <span>mín. {product.stockMinimo}</span>
        <span className="text-cream-400">·</span>
        <StockTag level={level} />
      </div>

      <div className="mt-3 pt-2">
        <ProductActions productName={product.nombre} />
      </div>
    </article>
  )
}
