import { Home, Package, Tag, BarChart3, FolderTree, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

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
    const { user, profile, signOut } = useAuth()

    const displayName =
        [profile?.nombre, profile?.apellido].filter(Boolean).join(' ') ||
        user?.email ||
        'Usuario'

    const initials =
        `${profile?.nombre?.[0] ?? ''}${profile?.apellido?.[0] ?? ''}`.toUpperCase() ||
        (user?.email?.[0] ?? 'U').toUpperCase()

    const handleSignOut = async () => {
        try {
            await signOut()
        } catch {
            // La sesión local se limpia igual y ProtectedRoute redirige al login.
        }
    }

    return (
        <aside className="flex w-64 min-h-screen flex-col bg-white text-[#434655] p-4">
            <h2 className="text-xl font-bold mb-6">StockFX</h2>
            <nav className="flex-1 space-y-6">
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

            <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                            {displayName}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                            {profile?.rol ?? user?.email}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-3 flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut size={16} />
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
