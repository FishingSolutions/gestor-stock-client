import { useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  claseEstado,
  debeMostrarValorPropuesto,
  etiquetaEstado,
  formatearMoneda,
  formatearNumero,
  stockPropuesto,
} from '../../../features/import/utils/importStatus'

const FILTROS = [
  { valor: 'todos', label: 'Todas' },
  { valor: 'nuevo', label: 'Nuevas' },
  { valor: 'existente', label: 'Existentes' },
  { valor: 'sin_cambios', label: 'Sin cambios' },
  { valor: 'ambigua', label: 'A revisar' },
  { valor: 'invalida', label: 'Inválidas' },
]

const TAMANO_PAGINA = 100

const claseSelect =
  'h-8 w-full max-w-[260px] rounded border border-cream-300 bg-white px-2 text-[11.5px] text-brown-900 outline-none transition focus:border-rust-500 focus:ring-2 focus:ring-rust-500/20 disabled:bg-cream-100'

function CeldaCambio({ actual, nuevo, formato = formatearNumero }) {
  const mostrarNuevo = debeMostrarValorPropuesto(actual, nuevo)

  return (
    <span className="whitespace-nowrap">
      {actual !== null && actual !== undefined && (
        <span className="text-brown-500">{formato(actual)}</span>
      )}
      {mostrarNuevo && actual !== null && actual !== undefined && (
        <>
          <span className="mx-1 text-brown-400">→</span>
          <span className="font-semibold text-brown-900">{formato(nuevo)}</span>
        </>
      )}
      {mostrarNuevo && (actual === null || actual === undefined) && (
        <span className="font-semibold text-brown-900">{formato(nuevo)}</span>
      )}
    </span>
  )
}

/**
 * Tabla de vista previa: qué va a pasar con cada fila antes de escribir nada.
 */
export default function ImportPreviewTable({
  filas,
  modo,
  incluidas,
  resoluciones,
  onIncluir,
  onResolver,
  disabled = false,
}) {
  const [filtro, setFiltro] = useState('todos')
  const [limite, setLimite] = useState(TAMANO_PAGINA)

  const conteo = useMemo(() => {
    const mapa = { todos: filas.length }
    for (const fila of filas) mapa[fila.estado] = (mapa[fila.estado] ?? 0) + 1
    return mapa
  }, [filas])

  const visibles = useMemo(() => {
    const lista = filtro === 'todos' ? filas : filas.filter((fila) => fila.estado === filtro)
    return lista.slice(0, limite)
  }, [filas, filtro, limite])

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-1.5">
        {FILTROS.filter((opcion) => opcion.valor === 'todos' || conteo[opcion.valor]).map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => {
              setFiltro(opcion.valor)
              setLimite(TAMANO_PAGINA)
            }}
            className={`rounded px-2 py-1 text-[11px] font-semibold transition-colors ${
              filtro === opcion.valor
                ? 'bg-espresso text-cream-50'
                : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
            }`}
          >
            {opcion.label}
            <span className="ml-1 opacity-70">{conteo[opcion.valor] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="scrollbar-custom mt-2 max-h-[46vh] overflow-auto rounded border border-cream-200">
        <table className="w-full border-collapse text-left text-[11.5px]">
          <thead className="sticky top-0 z-10 bg-cream-100 text-[10.5px] uppercase tracking-wide text-brown-500">
            <tr>
              <th className="w-10 px-2 py-2 font-semibold"> </th>
              <th className="w-12 px-2 py-2 font-semibold">Fila</th>
              <th className="px-2 py-2 font-semibold">Código</th>
              <th className="px-2 py-2 font-semibold">Descripción</th>
              <th className="px-2 py-2 font-semibold">Categoría</th>
              <th className="px-2 py-2 font-semibold">Stock</th>
              <th className="px-2 py-2 font-semibold">Precio</th>
              <th className="px-2 py-2 font-semibold">Estado</th>
              <th className="px-2 py-2 font-semibold">Qué hacer</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((fila) => {
              const clave = String(fila.fila)
              const incluida = incluidas[clave] ?? true
              const bloqueada = fila.estado === 'invalida'
              const resolucion = resoluciones[clave] ?? ''

              return (
                <tr key={`${fila.fila}-${fila.codigo}`} className="border-t border-cream-200 align-top">
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      aria-label={`Incluir fila ${fila.fila}`}
                      checked={incluida && !bloqueada}
                      disabled={disabled || bloqueada}
                      onChange={(event) => onIncluir(fila.fila, event.target.checked)}
                      className="h-3.5 w-3.5 accent-rust-600"
                    />
                  </td>
                  <td className="px-2 py-2 text-brown-500">{fila.fila}</td>
                  <td className="px-2 py-2 font-semibold text-brown-900">{fila.codigo || '—'}</td>
                  <td className="max-w-[260px] px-2 py-2">
                    <p className="truncate text-brown-900" title={fila.nombre}>{fila.nombre || '—'}</p>
                    {fila.actual && fila.actual.nombre !== fila.nombre && (
                      <p className="truncate text-[10.5px] text-brown-500" title={fila.actual.nombre}>
                        antes: {fila.actual.nombre}
                      </p>
                    )}
                    {fila.descripcion && (
                      <p className="truncate text-[10.5px] text-brown-400" title={fila.descripcion}>
                        {fila.descripcion}
                      </p>
                    )}
                  </td>
                  <td className="px-2 py-2 text-brown-700">{fila.categoria ?? '—'}</td>
                  <td className="px-2 py-2">
                    <CeldaCambio
                      actual={fila.actual ? fila.actual.stock : null}
                      nuevo={fila.stock === null ? null : stockPropuesto(fila, modo)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <CeldaCambio
                      actual={fila.actual ? fila.actual.precio : null}
                      nuevo={fila.precio}
                      formato={formatearMoneda}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <span className={`inline-flex rounded px-1.5 py-0.5 text-[10.5px] font-semibold ${claseEstado(fila.estado)}`}>
                      {etiquetaEstado(fila.estado)}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    {fila.estado === 'ambigua' && (
                      <select
                        className={claseSelect}
                        value={resolucion}
                        disabled={disabled || !incluida}
                        onChange={(event) => onResolver(fila.fila, event.target.value)}
                      >
                        <option value="">Elegí una opción…</option>
                        <option value="crear">Crear producto nuevo</option>
                        {fila.sugerencias.map((sugerencia) => (
                          <option key={sugerencia.idProducto} value={`vincular:${sugerencia.idProducto}`}>
                            Vincular a {sugerencia.codigo} · {sugerencia.nombre} ({Math.round(sugerencia.similitud * 100)}%)
                          </option>
                        ))}
                        <option value="excluir">Excluir esta fila</option>
                      </select>
                    )}

                    {fila.estado === 'invalida' && (
                      <p className="flex items-start gap-1 text-[10.5px] leading-snug text-stock-red">
                        <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                        <span>{fila.errores[0] ?? 'Fila con errores.'}</span>
                      </p>
                    )}

                    {fila.estado === 'nuevo' && <span className="text-brown-500">Crear producto</span>}
                    {fila.estado === 'existente' && <span className="text-brown-500">Actualizar existente</span>}
                    {fila.estado === 'sin_cambios' && <span className="text-brown-500">Sin cambios</span>}
                  </td>
                </tr>
              )
            })}

            {visibles.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-brown-500">
                  No hay filas con este estado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filtro !== 'todos' && (conteo[filtro] ?? 0) > visibles.length && (
        <button
          type="button"
          onClick={() => setLimite((valor) => valor + TAMANO_PAGINA)}
          className="mt-2 self-center rounded bg-cream-100 px-3 py-1.5 text-[11.5px] font-semibold text-brown-700 transition-colors hover:bg-cream-200"
        >
          Mostrar {Math.min(TAMANO_PAGINA, (conteo[filtro] ?? 0) - visibles.length)} más
        </button>
      )}

      {filtro === 'todos' && filas.length > visibles.length && (
        <button
          type="button"
          onClick={() => setLimite((valor) => valor + TAMANO_PAGINA)}
          className="mt-2 self-center rounded bg-cream-100 px-3 py-1.5 text-[11.5px] font-semibold text-brown-700 transition-colors hover:bg-cream-200"
        >
          Mostrar {Math.min(TAMANO_PAGINA, filas.length - visibles.length)} filas más
        </button>
      )}
    </div>
  )
}
