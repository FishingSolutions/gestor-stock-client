import { useState } from 'react'
import { Menu, Package, X } from 'lucide-react'
import Sidebar from '../../Sidebar/Sidebar'
import { useAuth } from '../../../context/AuthContext'

function getInitials(user) {
  return (user?.email?.[0] ?? 'U').toUpperCase()
}

export default function AppShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="flex h-dvh overflow-hidden">
      <div className="hidden h-full shrink-0 min-[900px]:block">
        <Sidebar className="h-full overflow-y-auto" />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
        <header className="sticky top-0 z-20 flex shrink-0 items-center gap-3 bg-espresso px-4 py-2.5 text-cream-50 min-[900px]:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            className="inline-flex h-9 w-9 items-center justify-center rounded text-cream-100 transition-colors hover:bg-white/5"
          >
            <Menu size={20} />
          </button>

          <span className="flex items-center gap-2 text-[15px] font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rust-600 text-cream-50">
              <Package size={18} />
            </span>
            StockFX
          </span>

          <span className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-cream-200 text-xs font-semibold text-brown-900">
            {getInitials(user)}
          </span>
        </header>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 min-[900px]:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={closeMenu}
            className="absolute inset-0 bg-espresso/50"
          />
          <div className="absolute inset-y-0 left-0 w-[260px] bg-espresso">
            <Sidebar className="h-full overflow-y-auto" onNavigate={closeMenu} />
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Cerrar menú"
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded text-cream-100 transition-colors hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
