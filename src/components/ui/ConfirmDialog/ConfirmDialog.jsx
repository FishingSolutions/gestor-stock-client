import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Trash2 } from 'lucide-react'

/**
 * Diálogo de confirmación para acciones destructivas.
 *
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {string}   props.title
 * @param {*}        props.message        Contenido del cuerpo (texto o nodos).
 * @param {string}   [props.confirmLabel='Confirmar']
 * @param {string}   [props.cancelLabel='Cancelar']
 * @param {boolean}  [props.busy=false]   Deshabilita los botones mientras se confirma.
 * @param {Function} props.onConfirm
 * @param {Function} props.onCancel
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(onCancel)

  useEffect(() => {
    cancelRef.current = onCancel
  }, [onCancel])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-espresso/50 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) cancelRef.current()
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-[400px] overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-start gap-3 p-5 pb-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stock-red-bg text-wine-600 dark:text-stock-red">
            <Trash2 size={17} />
          </span>
          <div className="min-w-0">
            <h2
              id="confirm-dialog-title"
              className="text-[15px] font-bold tracking-tight text-brown-900"
            >
              {title}
            </h2>
            <div className="mt-1 text-[12px] leading-relaxed text-brown-600">
              {message}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 bg-alabaster px-5 py-3.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-9 rounded bg-cream-100 px-4 text-[12.5px] font-semibold text-brown-700 transition-colors hover:bg-cream-200 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="h-9 rounded bg-wine-600 px-4 text-[12.5px] font-semibold text-cream-50 transition-colors hover:bg-wine-700 disabled:opacity-60"
          >
            {busy ? 'Eliminando…' : confirmLabel}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  )
}
