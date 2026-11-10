import { NavLink } from 'react-router-dom'
import { cx } from '../../lib/cx'

/**
 * Slot fijo donde vive el ícono. Mide lo mismo con la sidebar colapsada o
 * expandida, de modo que los íconos no se mueven durante la transición y
 * quedan centrados en el modo "rail" (colapsada).
 */
const iconSlotClassName = 'flex h-9 w-9 shrink-0 items-center justify-center'

const baseItemClassName =
  'flex w-full items-center gap-2.5 rounded px-1.5 text-left text-sm transition-colors'
const inactiveItemClassName = `${baseItemClassName} text-cream-100 hover:bg-white/5`
const activeItemClassName = `${baseItemClassName} bg-rust-600 font-semibold text-cream-50`

function SidebarLabel({ showLabels, className, children }) {
  return (
    <span
      className={cx(
        'whitespace-nowrap transition-opacity duration-200',
        showLabels ? 'opacity-100' : 'opacity-0 group-hover/sidebar:opacity-100',
        className,
      )}
    >
      {children}
    </span>
  )
}

/**
 * Ítem de navegación de la Sidebar. Renderiza un `NavLink` si recibe `to`,
 * o un botón si es una entrada sin ruta todavía.
 *
 * @param {object}   props
 * @param {*}        props.icon       Componente de ícono de lucide-react.
 * @param {string}   props.label      Texto visible del ítem.
 * @param {string}   [props.to]       Ruta de destino (si falta, renderiza botón).
 * @param {boolean}  [props.end]      Pasa `end` al NavLink para matched exacto.
 * @param {boolean}  [props.showLabels=false] Labels siempre visibles (sidebar expandida fija).
 * @param {Function} [props.onNavigate] Se ejecuta al activar el ítem (ej. cerrar el drawer móvil).
 */
export default function SidebarItem({
  icon: Icon,
  label,
  to,
  end,
  showLabels = false,
  onNavigate,
}) {
  const handleClick = (event) => {
    // La sección cambia con la navegación; al soltar el foco del ítem la
    // sidebar deja de matchear `focus-within` y vuelve a colapsar.
    // Si el click vino de teclado (event.detail === 0) se conserva el foco.
    if (event.detail > 0) {
      event.currentTarget.blur()
    }
    onNavigate?.()
  }

  const content = (
    <>
      <span className={iconSlotClassName}>
        <Icon size={16} />
      </span>
      <SidebarLabel showLabels={showLabels}>{label}</SidebarLabel>
    </>
  )

  if (!to) {
    return (
      <button type="button" onClick={handleClick} className={inactiveItemClassName}>
        {content}
      </button>
    )
  }

  return (
    <NavLink
      to={to}
      end={Boolean(end)}
      onClick={handleClick}
      className={({ isActive }) => (isActive ? activeItemClassName : inactiveItemClassName)}
    >
      {content}
    </NavLink>
  )
}
