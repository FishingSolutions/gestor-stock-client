import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeftRight, Eye, MoreVertical, Pencil, Trash2 } from 'lucide-react'

const iconButtonClassName =
  'inline-flex h-7 w-7 items-center justify-center rounded text-brown-500 transition-colors hover:bg-cream-200 hover:text-brown-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-rust-500/30'

const MENU_WIDTH = 176

const MENU = [
  { action: 'view', label: 'Ver producto', icon: Eye },
  { action: 'edit', label: 'Editar producto', icon: Pencil },
  { action: 'movements', label: 'Ver movimientos', icon: ArrowLeftRight },
  { action: 'delete', label: 'Eliminar producto', icon: Trash2, danger: true },
]

/**
 * Acciones de fila. Sin permisos de administración: solo el ojito para ver
 * el detalle. Para ADMIN en lugar de botones sueltos abre un menú con las
 * tres acciones (ver / editar / eliminar).
 *
 * @param {object}   props
 * @param {string}   props.productName
 * @param {boolean}  [props.canManage=false] True si el rol es ADMINISTRADOR.
 * @param {Function} props.onView
 * @param {Function} props.onEdit
 * @param {Function} props.onDelete
 */
export default function ProductActions({
  productName,
  canManage = false,
  onView,
  onEdit,
  onMovements,
  onDelete,
}) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(null)
  const buttonRef = useRef(null)
  const actions = { view: onView, edit: onEdit, movements: onMovements, delete: onDelete }

  useEffect(() => {
    if (!open) return

    const close = () => setOpen(false)
    const handlePointerDown = (event) => {
      if (!event.target.closest('[data-actions-menu]')) setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  if (!canManage) {
    return (
      <div className="flex items-center justify-end gap-0.5">
        <button
          type="button"
          aria-label={`Ver ${productName}`}
          onClick={onView}
          className={iconButtonClassName}
        >
          <Eye size={15} />
        </button>
        <button
          type="button"
          aria-label={`Movimientos de ${productName}`}
          onClick={onMovements}
          className={iconButtonClassName}
        >
          <ArrowLeftRight size={15} />
        </button>
      </div>
    )
  }

  const openMenu = () => {
    const rect = buttonRef.current.getBoundingClientRect()
    const top = Math.min(rect.bottom + 4, window.innerHeight - 8)
    const left = Math.max(
      8,
      Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8),
    )
    setPosition({ top, left })
    setOpen(true)
  }

  const run = (action) => {
    setOpen(false)
    actions[action]?.()
  }

  return (
    <div className="flex items-center justify-end gap-0.5">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Acciones de ${productName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={`${iconButtonClassName} ${open ? 'bg-cream-200 text-brown-900' : ''}`}
      >
        <MoreVertical size={15} />
      </button>

      {open &&
        createPortal(
          <div
            data-actions-menu
            role="menu"
            aria-label={`Acciones de ${productName}`}
            style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
            className="fixed z-[120] rounded-lg border border-cream-200 bg-white p-1 shadow-xl"
          >
            {MENU.map(({ action, label, icon: Icon, danger }) => (
              <button
                key={action}
                type="button"
                role="menuitem"
                onClick={() => run(action)}
                className={`flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-left text-[12px] font-medium transition-colors ${
                  danger
                    ? 'text-wine-600 hover:bg-stock-red-bg dark:text-stock-red'
                    : 'text-brown-700 hover:bg-cream-100'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  )
}
