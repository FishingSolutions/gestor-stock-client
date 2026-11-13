import { lazy, Suspense, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Plus } from 'lucide-react'
import ErrorState from '../components/ui/ErrorState/ErrorState'
import Dropdown from '../components/ui/Dropdown/Dropdown'
import KpiCards from '../components/kpis/KpiCards/KpiCards'
import LowStockCard from '../components/dashboard/LowStockCard/LowStockCard'
import RecentMovementsCard from '../components/dashboard/RecentMovementsCard/RecentMovementsCard'
import StockActivityCard from '../components/dashboard/StockActivityCard/StockActivityCard'
import { useProducts } from '../features/products/hooks/useProducts'
import { useMovements } from '../features/movements/hooks/useMovements'
import { buildInventoryKpis } from '../features/products/utils/kpis'
import { buildCategoryValue, buildLowStockProducts } from '../features/products/utils/dashboard'
import { exportMovementsCsv } from '../features/movements/utils/movements'

// La rueda es lo único que necesita Recharts (~400KB): se parte en su
// propio chunk y carga en paralelo con las queries, con skeleton de
// fallback — el resto de la página pinta al instante.
const CategoryDonutCard = lazy(() =>
  import('../components/dashboard/CategoryDonutCard/CategoryDonutCard'),
)

function DonutCardFallback() {
  return (
    <div className="flex min-h-0 flex-col rounded-lg bg-white p-3.5">
      <span className="block h-4 w-36 animate-pulse rounded bg-cream-200" />
      <span className="mt-3 block h-[170px] animate-pulse rounded-lg bg-cream-100" />
    </div>
  )
}

const PERIOD_OPTIONS = [
  { value: '7', label: 'Últimos 7 días' },
  { value: '14', label: 'Últimos 14 días' },
  { value: '30', label: 'Últimos 30 días' },
  { value: '90', label: 'Últimos 90 días' },
]

const HomePage = () => {
  const { products, loading, error, reload } = useProducts()
  const [days, setDays] = useState(30)
  const { movements, loading: movementsLoading } = useMovements(days)
  const navigate = useNavigate()
  // Estado compartido del modelo E: al abrir "Más detalles" se despliegan
  // los rankings Y la card del donut se apila (rueda viajando con FLIP)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const kpis = useMemo(() => buildInventoryKpis(products), [products])
  const categoryValue = useMemo(() => buildCategoryValue(products), [products])
  const lowStockProducts = useMemo(() => buildLowStockProducts(products), [products])

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1460px] flex-col px-4 py-4 min-[900px]:px-7 min-[900px]:py-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-rust-600">Inventario / Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-rust-600">
            Dashboard
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Dropdown
            value={String(days)}
            onChange={(value) => setDays(Number(value))}
            options={PERIOD_OPTIONS}
            label="Período del dashboard"
            align="right"
            buttonClassName="h-9 w-auto rounded-lg border border-cream-200 bg-white px-3 text-[12.5px] font-semibold hover:bg-cream-50"
          />
          <button
            type="button"
            onClick={() => exportMovementsCsv(movements, days)}
            className="flex h-9 items-center gap-2 rounded-lg bg-cream-200 px-3 text-[12.5px] font-bold text-brown-700 transition-colors hover:bg-cream-100"
          >
            <Download size={15} />
            Exportar informe
          </button>
          <button
            type="button"
            onClick={() => navigate('/movimientos')}
            className="flex h-9 items-center gap-2 rounded-lg bg-rust-600 px-3 text-[12.5px] font-bold text-cream-50 transition-colors hover:bg-rust-700"
          >
            <Plus size={15} />
            Nuevo movimiento
          </button>
        </div>
      </header>

      {loading ? (
        <div className="mt-5 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto scrollbar-custom">
          <div className="shrink-0">
            <KpiCards items={kpis} pending />
          </div>
          <div className="grid shrink-0 gap-3 xl:grid-cols-3">
            <div className="rounded-lg bg-white p-3.5 xl:col-span-2">
              <span className="block h-4 w-40 animate-pulse rounded bg-cream-200" />
              <span className="mt-3 block h-[170px] animate-pulse rounded-lg bg-cream-100" />
            </div>
            <div className="rounded-lg bg-white p-3.5">
              <span className="block h-4 w-36 animate-pulse rounded bg-cream-200" />
              <span className="mt-3 block h-[170px] animate-pulse rounded-lg bg-cream-100" />
            </div>
          </div>
          <div className="grid shrink-0 gap-3 xl:grid-cols-3">
            <div className="rounded-lg bg-white p-3.5 xl:col-span-2">
              <span className="block h-4 w-40 animate-pulse rounded bg-cream-200" />
              <span className="mt-3 block h-[190px] animate-pulse rounded-lg bg-cream-100" />
            </div>
            <div className="rounded-lg bg-white p-3.5">
              <span className="block h-4 w-36 animate-pulse rounded bg-cream-200" />
              <span className="mt-3 block h-[190px] animate-pulse rounded-lg bg-cream-100" />
            </div>
          </div>
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
        <div className="mt-5 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto scrollbar-custom">
          <div className="shrink-0">
            <KpiCards items={kpis} />
          </div>

          <div className="grid shrink-0 gap-3 xl:grid-cols-3">
            <StockActivityCard
              movements={movements}
              pending={movementsLoading}
              days={days}
              detailsOpen={detailsOpen}
              onToggleDetails={() => setDetailsOpen((open) => !open)}
              className="xl:col-span-2"
            />
            <Suspense fallback={<DonutCardFallback />}>
              <CategoryDonutCard
                items={categoryValue.items}
                total={categoryValue.total}
                stacked={detailsOpen}
              />
            </Suspense>
          </div>

          <div className="grid shrink-0 gap-3 xl:grid-cols-3">
            <RecentMovementsCard
              movements={movements}
              pending={movementsLoading}
              days={days}
              className="xl:col-span-2"
            />
            <LowStockCard products={lowStockProducts} />
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
