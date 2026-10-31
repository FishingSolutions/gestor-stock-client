import { useMemo, useState } from 'react'
import { Download, Plus } from 'lucide-react'
import AppShell from '../../components/layout/AppShell/AppShell'
import ProductsToolbar from '../../components/products/ProductsToolbar/ProductsToolbar'
import ProductsTable from '../../components/products/ProductsTable/ProductsTable'
import ProductsCards from '../../components/products/ProductsCards/ProductsCards'
import ProductsFooter from '../../components/products/ProductsFooter/ProductsFooter'
import ProductsEmptyState from '../../components/products/ProductsEmptyState/ProductsEmptyState'
import ProductsErrorState from '../../components/products/ProductsErrorState/ProductsErrorState'
import ProductsLoading from '../../components/products/ProductsLoading/ProductsLoading'
import { useProducts } from '../../features/products/hooks/useProducts'

export default function ProductsPage() {
 const { products, loading, error, reload } = useProducts()

 const [search, setSearch] = useState('')
 const [category, setCategory] = useState('all')
 const [activeFilter, setActiveFilter] = useState('activos')
 const [sort, setSort] = useState('recent')
 const [page, setPage] = useState(1)
 const [pageSize, setPageSize] = useState(10)

 const categories = useMemo(
  () =>
   [...new Set(products.map((product) => product.categoria).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, 'es'),
   ),
  [products],
 )

 const filtered = useMemo(() => {
  const term = search.trim().toLowerCase()

  return products.filter((product) => {
   if (category !== 'all' && product.categoria !== category) return false
   if (activeFilter === 'activos' && !product.activo) return false
   if (activeFilter === 'inactivos' && product.activo) return false
   if (!term) return true

   return [product.nombre, product.codigo, product.categoria].some((value) =>
    value?.toLowerCase().includes(term),
   )
  })
 }, [products, search, category, activeFilter])

 const sorted = useMemo(() => {
  const list = [...filtered]
  const byName = (a, b) => a.nombre.localeCompare(b.nombre, 'es')

  switch (sort) {
   case 'name':
    return list.sort(byName)
   case 'stock-desc':
    return list.sort((a, b) => b.stockActual - a.stockActual || byName(a, b))
   case 'stock-asc':
    return list.sort((a, b) => a.stockActual - b.stockActual || byName(a, b))
   case 'price-desc':
    return list.sort((a, b) => b.precioVenta - a.precioVenta || byName(a, b))
   default:
    return list
  }
 }, [filtered, sort])

 const total = sorted.length
 const pageCount = Math.max(1, Math.ceil(total / pageSize))
 const currentPage = Math.min(page, pageCount)
 const pageItems = sorted.slice(
  (currentPage - 1) * pageSize,
  currentPage * pageSize,
 )

 const resetPage = () => setPage(1)

 const clearFilters = () => {
  setSearch('')
  setCategory('all')
  setActiveFilter('activos')
  setSort('recent')
  setPage(1)
 }

 const footerProps = {
  total,
  page: currentPage,
  pageSize,
  pageCount,
  onPageChange: setPage,
  onPageSizeChange: (size) => {
   setPageSize(size)
   setPage(1)
  },
  onLoadMore: () => setPage((value) => Math.min(value + 1, pageCount)),
 }

 return (
  <AppShell>
   <div className="mx-auto flex h-full min-h-0 w-full max-w-[1460px] flex-col px-4 py-4 min-[900px]:px-7 min-[900px]:py-6">
    <header className="flex shrink-0 flex-col gap-3 min-[900px]:flex-row min-[900px]:items-start min-[900px]:justify-between">
     <div>
      <p className="text-[11px] font-semibold text-rust-600">Inventario / Productos</p>
      <div className="mt-1 flex items-center gap-2">
       <h1 className="text-2xl font-bold tracking-tight text-rust-600">
        Productos
       </h1>
       <span className="rounded bg-cream-200 px-2 py-0.5 text-[11px] font-semibold text-brown-600">
        {loading ? '…' : products.length}
       </span>
      </div>
      <p className="mt-1 text-[12.5px] text-brown-600">
       Tabla limpia con nivel de stock para priorizar reposiciones.
      </p>
     </div>

     <div className="flex gap-2">
      <button
       type="button"
       className="flex flex-1 items-center justify-center gap-2 rounded bg-espresso px-3.5 py-2 text-[12.5px] font-semibold text-cream-50 transition-colors hover:bg-espresso-light min-[900px]:flex-none"
      >
       <Download size={16} />
       Exportar
      </button>
      <button
       type="button"
       className="flex flex-1 items-center justify-center gap-2 rounded bg-rust-600 px-3.5 py-2 text-[12.5px] font-semibold text-cream-50 transition-colors hover:bg-rust-700 min-[900px]:flex-none"
      >
       <Plus size={16} />
       Nuevo producto
      </button>
     </div>
    </header>

    {loading ? (
     <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto">
      <ProductsLoading />
     </div>
    ) : error ? (
     <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto">
      <ProductsErrorState error={error} onRetry={reload} />
     </div>
    ) : products.length === 0 ? (
     <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto">
      <ProductsEmptyState
       title="Todavía no hay productos"
       description="Cuando cargues el primero, va a aparecer en esta tabla."
      />
     </div>
    ) : (
     <>
      <div className="mt-4 shrink-0">
       <ProductsToolbar
        search={search}
        onSearchChange={(value) => {
         setSearch(value)
         resetPage()
        }}
        category={category}
        categories={categories}
        onCategoryChange={(value) => {
         setCategory(value)
         resetPage()
        }}
        activeFilter={activeFilter}
        onActiveFilterChange={(value) => {
         setActiveFilter(value)
         resetPage()
        }}
        sort={sort}
        onSortChange={(value) => {
         setSort(value)
         resetPage()
        }}
       />
      </div>

      {total === 0 ? (
       <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto">
        <ProductsEmptyState
         actionLabel="Limpiar filtros"
         onAction={clearFilters}
        />
       </div>
      ) : (
       <>
        <div className="mt-3 hidden min-h-0 flex-1 flex-col min-[1281px]:flex">
         <ProductsTable
          products={pageItems}
          footer={<ProductsFooter variant="desktop" {...footerProps} />}
         />
        </div>

        <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 min-[1281px]:hidden">
         <ProductsCards products={pageItems} />
         <ProductsFooter variant="mobile" {...footerProps} />
        </div>
       </>
      )}
     </>
    )}
   </div>
  </AppShell>
 )
}
