import { Package } from 'lucide-react'
import { cx } from '../../lib/cx'
import { sidebarSections } from './sidebarSections'
import SidebarItem from './SidebarItem'
import SidebarUser from './SidebarUser'

/**
 * Ancho del "rail" colapsado (w-16 = 64px) y del panel expandido.
 * El cálculo del rail es intencional: p-2 del aside + px-1.5 del ítem + slot
 * de ícono w-9 (36px) dejan el ícono perfectamente centrado en los 64px.
 */
const variantClassName = {
  // Colapsada: se expande al hacer hover o al navegar con teclado (focus-within).
  // Flota sobre el contenido (el ancho real lo fija el contenedor en AppShell),
  // así el resto de la app nunca "salta" durante la transición.
  rail: 'w-16 transition-[width,box-shadow] duration-200 ease-out hover:w-[260px] hover:shadow-xl focus-within:w-[260px] focus-within:shadow-xl',
  // Siempre expandida (drawer móvil).
  full: 'w-[260px]',
}

/**
 * @param {object}  props
 * @param {'rail' | 'full'} [props.variant='rail'] rail = colapsada con íconos y
 *        se expande con hover; full = siempre expandida (drawer móvil).
 * @param {string}  [props.className]
 * @param {Function} [props.onNavigate] Se ejecuta al navegar (cierra el drawer móvil).
 */
export default function Sidebar({ className = '', variant = 'rail', onNavigate }) {
  const showLabels = variant === 'full'

  // Patrón compartido: con la sidebar colapsada los textos se desvanecen y
  // reaparecen al hacer hover; con variant="full" siempre son visibles.
  const labelVisibilityClassName = showLabels
    ? 'opacity-100'
    : 'opacity-0 group-hover/sidebar:opacity-100'

  const sectionTitleClassName = cx(
    'mb-2 px-1.5 text-xs uppercase tracking-wider text-cream-300/70 transition-opacity duration-200',
    labelVisibilityClassName,
  )

  return (
    <aside
      className={cx(
        'group/sidebar flex h-full flex-col overflow-hidden bg-espresso p-2 text-cream-100',
        variantClassName[variant] ?? variantClassName.full,
        className,
      )}
    >
      <h2 className="mb-6 flex items-center gap-2 px-1.5 text-xl font-bold text-cream-50">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rust-600 text-cream-50">
            <Package size={18} />
          </span>
        </span>
        <span
          className={cx(
            'whitespace-nowrap transition-opacity duration-200',
            labelVisibilityClassName,
          )}
        >
          StockFX
        </span>
      </h2>

      <nav className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden scrollbar-custom">
        {sidebarSections.map((section) => (
          <div key={section.title}>
            <h3 className={sectionTitleClassName}>{section.title}</h3>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.label}>
                  <SidebarItem {...item} showLabels={showLabels} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <SidebarUser showLabels={showLabels} />
    </aside>
  )
}
