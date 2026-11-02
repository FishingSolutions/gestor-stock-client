import { useMemo } from 'react'
import AppShell from '../components/layout/AppShell/AppShell'
import KpiCards from '../components/kpis/KpiCards/KpiCards'
import { useProducts } from '../features/products/hooks/useProducts'
import { buildInventoryKpis } from '../features/products/utils/kpis'

const HomePage = () => {
  const { products, loading, error } = useProducts()
  const kpis = useMemo(() => buildInventoryKpis(products), [products])

  return (
    <AppShell>
      <div className="p-6">
        <KpiCards items={kpis} pending={loading || Boolean(error)} />
      </div>
    </AppShell>
  )
}

export default HomePage
