import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import { cx } from '../../../lib/cx'

/**
 * Slot fijo para alinear el ícono con los ítems de la sidebar y el bloque
 * de usuario, igual que el resto de los slots del rail.
 */
const iconSlotClassName = 'flex h-9 w-9 shrink-0 items-center justify-center'

const variantClassName = {
  // Fila del pie de la sidebar (mismo lenguaje que "Cerrar sesión").
  sidebar:
    'flex w-full items-center gap-2.5 rounded px-1.5 text-left text-sm text-cream-300/80 transition-colors hover:bg-cream-50/10 hover:text-cream-50',
  // Botón compacto del header móvil.
  icon: 'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded text-cream-50/80 transition-colors hover:bg-cream-50/10 hover:text-cream-50',
  // Botón para pantallas con fondo claro (login), donde no hay sidebar.
  canvas:
    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded text-brown-600 transition-colors hover:bg-cream-100 hover:text-brown-900',
}

/**
 * Botón para alternar entre modo claro y oscuro.
 *
 * @param {object}  props
 * @param {'sidebar' | 'icon' | 'canvas'} [props.variant='sidebar']
 * @param {boolean} [props.showLabels=false] Muestra la etiqueta siempre (sidebar expandida fija).
 * @param {string}  [props.className]
 */
export default function ThemeToggle({
  variant = 'sidebar',
  showLabels = false,
  className = '',
}) {
  const { isDark, toggleTheme } = useTheme()

  const label = isDark ? 'Modo claro' : 'Modo oscuro'
  const Icon = isDark ? Sun : Moon

  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={label}
        title={label}
        className={cx(variantClassName.sidebar, className)}
      >
        <span className={iconSlotClassName}>
          <Icon size={16} />
        </span>
        <span
          className={cx(
            'whitespace-nowrap transition-opacity duration-200',
            showLabels ? 'opacity-100' : 'opacity-0 group-hover/sidebar:opacity-100',
          )}
        >
          {label}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cx(variantClassName[variant] ?? variantClassName.icon, className)}
    >
      <Icon size={18} />
    </button>
  )
}
