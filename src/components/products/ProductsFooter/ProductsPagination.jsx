import { ChevronLeft, ChevronRight } from 'lucide-react'

function getPageItems(page, pageCount) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const pages = [...new Set([1, pageCount, page - 1, page, page + 1])]
    .filter((item) => item >= 1 && item <= pageCount)
    .sort((a, b) => a - b)

  const items = []

  pages.forEach((item, index) => {
    if (index > 0 && item - pages[index - 1] > 1) {
      items.push('ellipsis')
    }
    items.push(item)
  })

  return items
}

export default function ProductsPagination({ page, pageCount, onChange }) {
  const items = getPageItems(page, pageCount)

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        aria-label="Página anterior"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="inline-flex h-7 w-7 items-center justify-center rounded text-brown-500 transition-colors hover:bg-cream-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={13} />
      </button>

      {items.map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-1 text-[11px] text-brown-400">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`Página ${item}`}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onChange(item)}
            className={`inline-flex h-7 min-w-7 items-center justify-center rounded px-1 text-[11.5px] font-medium transition-colors ${
              item === page
                ? 'bg-rust-600 text-cream-50'
                : 'text-brown-600 hover:bg-cream-200'
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Página siguiente"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
        className="inline-flex h-7 w-7 items-center justify-center rounded text-brown-500 transition-colors hover:bg-cream-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={13} />
      </button>
    </div>
  )
}
