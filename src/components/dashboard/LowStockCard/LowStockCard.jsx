import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import Card, { CardHeader } from '../../ui/Card/Card'
import StockMeter from '../../products/StockMeter/StockMeter'
import StockTag from '../../products/StockTag/StockTag'

function LowStockSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-2">
      <span className="sr-only">Cargando productos con stock bajo...</span>
      {Array.from({ length: 4 }, (_, index) => (
        <span key={index} className="h-10 animate-pulse rounded bg-cream-100" />
      ))}
    </div>
  )
}

/**
 * Card "Productos con stock bajo": productos arriba pegados al título
 * y el link como footer anclado al fondo de la card.
 */
export default function LowStockCard({ products = [], pending = false, className = '' }) {
  const navigate = useNavigate()

  return (
    <Card busy={pending} className={className}>
      <CardHeader title="Productos con stock bajo">
        <span className="ml-auto shrink-0 text-[11px] text-brown-500">actual / mínimo</span>
      </CardHeader>

      {pending ? (
        <div className="mt-2">
          <LowStockSkeleton />
        </div>
      ) : products.length > 0 ? (
        // Medida estable: se ven 4 productos y el resto se scrollea,
        // como la tabla de movimientos
        <ul className="mt-1 max-h-[184px] overflow-y-auto scrollbar-custom">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex items-center gap-2.5 border-b border-dashed border-cream-200 py-2 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-brown-900">
                  {product.nombre}
                </p>
                <p className="text-[10.5px] text-brown-400">
                  {product.codigo} · {product.categoria}
                </p>
              </div>
              <p className="shrink-0 text-[11.5px] tabular-nums text-brown-600">
                <b className="font-bold text-brown-900">{product.stockActual}</b> /{' '}
                {product.stockMinimo} un.
              </p>
              <StockTag level={product.level} className="ml-2 shrink-0" />
              <StockMeter
                product={product}
                level={product.level}
                className="w-[76px] shrink-0"
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-1 items-center justify-center py-10 text-center text-[11.5px] text-brown-400">
          Todo el inventario activo tiene stock OK. 🎉
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate('/productos')}
        className="mt-auto flex items-center gap-1.5 pt-3 text-[11.5px] font-semibold text-rust-600 hover:text-rust-700 hover:underline"
      >
        Ver los {products.length} productos con stock bajo
        <ChevronRight size={13} />
      </button>
    </Card>
  )
}
