import { Home, Package, Tag, BarChart3, FolderTree } from 'lucide-react'

const sections = [
    {
        title: 'Principal',
        items: [
            { icon: Home, label: 'Inicio' },
        ],
    },
    {
        title: 'Inventario',
        items: [
            { icon: Package, label: 'Productos' },
            { icon: Tag, label: 'Movimientos' },
            { icon: FolderTree, label: 'Categorias' },
            { icon: FolderTree, label: 'Stock Bajo'}
        ],
    },
    {
        title: 'Sistema',
        items: [
            { icon: BarChart3, label: 'Configuración' },
        ],
    },
]

const Sidebar = () => {
    return (
        <aside className="w-64 bg-white text-[#434655] p-4 min-h-screen">
            <h2 className="text-xl font-bold mb-6">StockFX</h2>
            <nav className="space-y-6">
                {sections.map((section) => (
                    <div key={section.title}>
                        <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                            {section.title}
                        </h3>
                        <ul className="space-y-1">
                            {section.items.map((item) => {
                                const Icon = item.icon
                                return (
                                    <li key={item.label}>
                                        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#dce9ff] text-left">
                                            <Icon size={16} />
                                            <span>{item.label}</span>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    )
}

export default Sidebar
