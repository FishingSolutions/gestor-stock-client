import { BarChart3, FolderTree, Home, LogOut, Package, Tag } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const sections = [
  {
    title: 'Principal',
    items: [{ icon: Home, label: 'Inicio', to: '/', end: true }],
  },
  {
    title: 'Inventario',
    items: [
      { icon: Package, label: 'Productos', to: '/productos' },
      { icon: Tag, label: 'Movimientos' },
      { icon: FolderTree, label: 'Categorías' },
      { icon: FolderTree, label: 'Stock bajo' },
    ],
  },
  {
    title: 'Sistema',
    items: [{ icon: BarChart3, label: 'Configuración' }],
  },
]

const baseItemClassName =
  'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors'
const inactiveItemClassName = `${baseItemClassName} text-cream-100 hover:bg-white/5`
const activeItemClassName = `${baseItemClassName} bg-rust-600 font-semibold text-cream-50`

export default function Sidebar({ className = '', onNavigate }) {
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
    <aside
      className={`flex w-[260px] min-h-screen flex-col bg-espresso p-4 text-cream-100 ${className}`}
    >
      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-cream-50">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rust-600 text-cream-50">
          <Package size={18} />
        </span>
        StockFX
      </h2>

      <nav className="flex-1 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 text-xs uppercase tracking-wider text-cream-300/70">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon

                return (
                  <li key={item.label}>
                    {item.to ? (
                      <NavLink
                        to={item.to}
                        end={Boolean(item.end)}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          isActive ? activeItemClassName : inactiveItemClassName
                        }
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </NavLink>
                    ) : (
                      <button type="button" className={inactiveItemClassName}>
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-6 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-200 text-sm font-semibold text-brown-900">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-cream-50">{displayName}</p>
            {profile?.rol && (
              <p className="truncate text-xs text-cream-300/70">{profile.rol}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-3 flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-cream-300/80 transition-colors hover:bg-white/5 hover:text-cream-50"
        >
          <LogOut size={16} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
