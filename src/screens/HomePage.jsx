import Sidebar from '../components/Sidebar'
import KpiCard from '../components/KpiCard'
import { Archive, Layers, TriangleAlert, CircleAlert } from 'lucide-react'

const kpis = [
    { title: 'Total de productos', value: '1,420', unit: 'SKUs activos', badge: '+12 nuevos este mes', tone: 'green', icon: <Archive size={18} /> },
    { title: 'Unidades en stock', value: '48,290', unit: 'unidades', badge: 'Valoración: $384,150 USD', tone: 'blue', icon: <Layers size={18} /> },
    { title: 'Stock bajo', value: '6', unit: 'artículos', badge: 'Requiere reposición', tone: 'amber', icon: <TriangleAlert size={18} /> },
    { title: 'Sin stock', value: '2', unit: 'artículos', badge: 'Atención urgente', tone: 'red', icon: <CircleAlert size={18} /> },
]

const HomePage = () => {
    return (
        <div className="flex bg-[#F8F9FF] min-h-screen">
            <Sidebar />
            <main className="flex-1 p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {kpis.map((k) => (
                        <KpiCard key={k.title} {...k} />
                    ))}
                </div>
            </main>
        </div>
    )
}

export default HomePage