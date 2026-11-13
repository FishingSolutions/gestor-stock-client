import { useState } from 'react'
import { Menu, Package, X } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../Sidebar/Sidebar'
import StockFxAssistant from '../../chat/StockFxAssistant'
import { useAuth } from '../../../context/AuthContext'

function getInitials(user) {
  return (user?.email?.[0] ?? 'U').toUpperCase()
}

/**
 * Layout de la app (se usa como layout route: las páginas se renderizan
 * dentro de <Outlet />). Al persistir entre navegaciones, la sidebar no se
 * desmonta y el :hover sobrevive a los cambios de sección.
 */
export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="flex h-full overflow-hidden">
      {/* Rail colapsado: el contenedor fija el ancho real (w-16) para que el
          contenido principal nunca se mueva; la sidebar expandida flota encima. */}
      <div className="relative hidden w-16 shrink-0 min-[900px]:block">
        <Sidebar
          variant="rail"
          className="absolute inset-y-0 left-0 z-30"
        />
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

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
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
            <Sidebar variant="full" className="h-full" onNavigate={closeMenu} />
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

      <StockFxAssistant />
    </div>
  )
}
