import ProductsTableRow from './ProductsTableRow'

const COLUMNS = [
  { label: '', width: '4%' },
  { label: 'Nombre', width: '28%' },
  { label: 'Código', width: '9%' },
  { label: 'Categoría', width: '11%' },
  { label: 'Costo', width: '8%', align: 'right' },
  { label: 'Venta', width: '8%', align: 'right' },
  { label: 'Stock', width: '14%' },
  { label: 'Estado', width: '9%' },
  { label: 'Acciones', width: '9%', align: 'right' },
]

export default function ProductsTable({ products, footer }) {
  return (
    <div className="hidden min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-white min-[1281px]:flex">
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            {COLUMNS.map((column) => (
              <col key={column.label || 'check'} style={{ width: column.width }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th
                  key={column.label || 'check'}
                  className={`sticky top-0 z-10 h-10 bg-espresso px-3 text-[14px] font-bold text-cream-50 ${
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {column.label === '' ? (
                    <input
                      type="checkbox"
                      aria-label="Seleccionar todos"
                      className="h-4 w-4 rounded accent-rust-600"
                    />
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <ProductsTableRow key={product.id} product={product} />
            ))}
          </tbody>
        </table>
      </div>
      {footer && <div className="shrink-0">{footer}</div>}
    </div>
  )
}
