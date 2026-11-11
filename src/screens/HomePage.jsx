import { useMemo } from 'react'
import ErrorState from '../components/ui/ErrorState/ErrorState'
import KpiCards from '../components/kpis/KpiCards/KpiCards'
import { useProducts } from '../features/products/hooks/useProducts'
import { buildInventoryKpis } from '../features/products/utils/kpis'

const HomePage = () => {
  const { products, loading, error, reload } = useProducts()
  const kpis = useMemo(() => buildInventoryKpis(products), [products])

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1460px] flex-col px-4 py-4 min-[900px]:px-7 min-[900px]:py-6">
      <header className="shrink-0">
        <p className="text-[11px] font-semibold text-rust-600">Inventario / Dashboard</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-rust-600">
          Dashboard
        </h1>
      </header>

      {loading ? (
        <div className="mt-5 shrink-0">
          <KpiCards items={kpis} pending />
        </div>
      ) : error ? (
        <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-custom">
          <ErrorState
            title="No pudimos cargar los productos"
            error={error}
            onRetry={reload}
          />
        </div>
      ) : (
        <div className="mt-5 shrink-0">
          <KpiCards items={kpis} />
        </div>
      )}
    </div>
  )
}

export default HomePage
