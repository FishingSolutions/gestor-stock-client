import { ArrowLeftRight } from 'lucide-react'

/**
 * Sección Movimientos. Placeholder: por ahora solo existe la sección para que
 * se pueda navegar a ella (menú de acciones de la tabla y sidebar). Próximo
 * paso: mostrar el historial de movimientos (v_movimiento / capa temp) y el
 * detalle de un producto elegido desde la tabla.
 *
 * Se renderiza dentro del AppShell del layout route.
 */
export default function MovimientosPage() {
  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1460px] flex-col px-4 py-4 min-[900px]:px-7 min-[900px]:py-6">
        <header className="shrink-0">
          <p className="text-[11px] font-semibold text-rust-600">
            Inventario / Movimientos
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-rust-600">
            Movimientos
          </h1>
        </header>

        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col items-center justify-center rounded-lg bg-white px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-200 text-brown-500">
              <ArrowLeftRight size={20} />
            </span>
            <h2 className="mt-4 text-base font-semibold text-brown-900">
              Historial de movimientos de stock
            </h2>
            <p className="mt-1 max-w-md text-sm text-brown-600">
              Acá va a quedar el registro de ingresos, egresos y ajustes de cada
              producto.
            </p>
          </div>
      </div>
    </div>
  )
}
