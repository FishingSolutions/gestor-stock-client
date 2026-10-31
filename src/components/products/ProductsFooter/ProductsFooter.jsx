import PageSizeDropdown from './PageSizeDropdown'
import ProductsPagination from './ProductsPagination'

export default function ProductsFooter({
  variant = 'desktop',
  total,
  page,
  pageSize,
  pageCount,
  onPageChange,
  onPageSizeChange,
  onLoadMore,
}) {
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  if (variant === 'mobile') {
    return (
      <div className="flex shrink-0 flex-col items-center gap-2 min-[1281px]:hidden">
        <p className="text-[11.5px] text-brown-500">
          Mostrando{' '}
          <strong className="font-semibold text-brown-600">
            {rangeStart}–{rangeEnd}
          </strong>{' '}
          de <strong className="font-semibold text-brown-600">{total}</strong> productos
        </p>

        {page < pageCount && (
          <button
            type="button"
            onClick={onLoadMore}
            className="rounded bg-white px-4 py-2 text-[12.5px] font-semibold text-espresso transition-colors hover:bg-cream-100"
          >
            Cargar más productos
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-alabaster px-3 py-2.5 text-[11.5px] text-brown-500">
      <p>
        Mostrando{' '}
        <strong className="font-semibold text-brown-600">
          {rangeStart}–{rangeEnd}
        </strong>{' '}
        de <strong className="font-semibold text-brown-600">{total}</strong> productos
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.04em]">
          Filas por página
        </span>
        <PageSizeDropdown value={pageSize} onChange={onPageSizeChange} />
        <ProductsPagination page={page} pageCount={pageCount} onChange={onPageChange} />
      </div>
    </div>
  )
}
