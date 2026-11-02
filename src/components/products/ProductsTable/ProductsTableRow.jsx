import { getStockLevel } from '../../../features/products/utils/stock'
import { formatPrice } from '../../../features/products/utils/format'
import ActiveBadge from '../ActiveBadge/ActiveBadge'
import ProductActions from '../ProductActions/ProductActions'
import StockMeter from '../StockMeter/StockMeter'
import StockTag from '../StockTag/StockTag'

export default function ProductsTableRow({ product }) {
  const level = getStockLevel(product)

  return (
    <tr className="transition-colors odd:bg-white even:bg-alabaster hover:bg-[#f2eae1]">
      <td className="px-3 py-2.5">
        <input
          type="checkbox"
          aria-label={`Seleccionar ${product.nombre}`}
          className="h-4 w-4 rounded accent-rust-600"
        />
      </td>
      <td className="px-3 py-2.5">
        <div className="min-w-0">
          <p
            className="truncate text-[12.5px] font-semibold text-brown-900"
            title={product.nombre}
          >
            {product.nombre}
          </p>
          {product.descripcion && (
            <p className="mt-0.5 truncate text-[10.5px] text-brown-500">
              {product.descripcion}
            </p>
          )}
        </div>
      </td>
      <td className="px-3 py-2.5">
        <span className="text-[11px] tracking-wide text-brown-500">
          {product.codigo}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <span
          className="block truncate text-[11px] text-brown-600"
          title={product.categoria || 'Sin categoría'}
        >
          {product.categoria || 'Sin categoría'}
        </span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="text-[12px] font-medium tabular-nums text-brown-500">
          {formatPrice(product.precioCosto)}
        </span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="text-[12px] font-semibold tabular-nums text-brown-900">
          {formatPrice(product.precioVenta)}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <div className="max-w-[170px]">
          <p className="text-[12px] font-semibold tabular-nums text-brown-900">
            {product.stockActual} un.{' '}
            <span className="text-[10px] font-medium text-brown-400">
              / {product.stockMaximo}
            </span>
          </p>
          <StockMeter product={product} level={level} className="mt-1" />
          <div className="mt-1 flex items-center gap-1 text-[10px] text-brown-500">
            <span>mín. {product.stockMinimo}</span>
            <span className="text-cream-400">·</span>
            <StockTag level={level} />
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <ActiveBadge activo={product.activo} />
      </td>
      <td className="px-3 py-2.5">
        <ProductActions productName={product.nombre} />
      </td>
    </tr>
  )
}
