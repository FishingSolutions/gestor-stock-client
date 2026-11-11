import { LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cx } from '../../lib/cx'

/**
 * Slot fijo del avatar, misma medida que el slot de íconos de los ítems para
 * que todo quede alineado y centrado cuando la sidebar está colapsada.
 */
const avatarSlotClassName = 'flex h-9 w-9 shrink-0 items-center justify-center'

/**
 * Pie de la Sidebar: avatar con nombre/rol del usuario y botón de cerrar sesión.
 * Sigue el mismo patrón de colapsado que el resto de la sidebar: el avatar
 * siempre se ve, los textos se desvanecen salvo que `showLabels` sea true.
 *
 * @param {object}  props
 * @param {boolean} [props.showLabels=false] Labels siempre visibles (sidebar expandida fija).
 */
export default function SidebarUser({ showLabels = false }) {
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

  const labelClassName = cx(
    'transition-opacity duration-200',
    showLabels ? 'opacity-100' : 'opacity-0 group-hover/sidebar:opacity-100',
  )

  return (
    <div className="mt-6 pt-4">
      <div className="flex items-center gap-2.5 px-1.5">
        <div className={avatarSlotClassName}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 text-sm font-semibold text-brown-900">
            {initials}
          </div>
        </div>
        <div className="min-w-0">
          <p className={cx('truncate text-sm font-medium text-cream-50', labelClassName)}>
            {displayName}
          </p>
          {profile?.rol && (
            <p className={cx('truncate text-xs text-cream-300/70', labelClassName)}>
              {profile.rol}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        className="mt-3 flex w-full items-center gap-2.5 rounded px-1.5 text-left text-sm text-cream-300/80 transition-colors hover:bg-white/5 hover:text-cream-50"
      >
        <span className={avatarSlotClassName}>
          <LogOut size={16} />
        </span>
        <span className={cx('whitespace-nowrap', labelClassName)}>Cerrar sesión</span>
      </button>
    </div>
  )
}
