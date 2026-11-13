import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Drawer({ title, subtitle, headerRight, onClose, children, footer }) {
  const titleId = useId()
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-espresso/50 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex h-full w-full max-w-[480px] flex-col bg-white motion-safe:animate-[drawer-in_180ms_ease-out]"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 px-5 pb-2 pt-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="min-w-0">
              <h2
                id={titleId}
                className="truncate text-lg font-bold tracking-tight text-espresso"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 truncate text-[11.5px] text-brown-500">
                  {subtitle}
                </p>
              )}
            </div>
            {headerRight}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-brown-600 transition-colors hover:bg-cream-100 hover:text-brown-900"
          >
            <X size={16} />
          </button>
        </header>

        <div className="scrollbar-custom min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-6">
          {children}
        </div>

        {footer && (
          <footer className="shrink-0 bg-alabaster px-5 py-3.5 sm:px-6">
            {footer}
          </footer>
        )}
      </section>
    </div>,
    document.body,
  )
}
