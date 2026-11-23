import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react'
import ImportColumnMapper from './ImportColumnMapper'
import ImportDropzone from './ImportDropzone'
import ImportPreviewTable from './ImportPreviewTable'
import {
  analizarImportacion,
  confirmarImportacion,
  crearClaveIdempotencia,
} from '../../../features/import/services/importService'
import {
  claseEstado,
  formatearNumero,
  mensajeIA,
  resumirSeleccion,
} from '../../../features/import/utils/importStatus'
import { descargarPlantillaProductos } from '../../../features/import/utils/exportProducts'

const MODOS = [
  {
    valor: 'REEMPLAZAR',
    titulo: 'Reemplazar existencias',
    descripcion: 'El stock del sistema pasa a ser el de la planilla.',
  },
  {
    valor: 'SUMAR',
    titulo: 'Sumar existencias',
    descripcion: 'La cantidad de la planilla se agrega al stock actual.',
  },
]

const claseBotonPrimario =
  'inline-flex items-center justify-center gap-2 rounded bg-rust-600 px-4 py-2 text-[12.5px] font-semibold text-cream-50 transition-colors hover:bg-rust-700 disabled:cursor-not-allowed disabled:opacity-60'
const claseBotonSecundario =
  'inline-flex items-center justify-center gap-2 rounded bg-cream-100 px-4 py-2 text-[12.5px] font-semibold text-brown-700 transition-colors hover:bg-cream-200 disabled:cursor-not-allowed disabled:opacity-60'

function Resumen({ filas, incluidas, resoluciones }) {
  const resumen = resumirSeleccion(filas, incluidas, resoluciones)

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-brown-600">
      <span>
        <b className="text-brown-900">{resumen.crear}</b> nuevos
      </span>
      <span>
        <b className="text-brown-900">{resumen.actualizar}</b> actualizados
      </span>
      <span>
        <b className="text-brown-900">{resumen.sinCambios}</b> sin cambios
      </span>
      <span>
        <b className="text-brown-900">{resumen.excluir}</b> excluidos
      </span>
      {resumen.pendientes > 0 && (
        <span className="font-semibold text-stock-red">
          {resumen.pendientes} sin resolver
        </span>
      )}
    </div>
  )
}

function PanelResultado({ resultado }) {
  const resumen = resultado?.resumen ?? {}

  return (
    <div className="py-6">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stock-green-bg text-stock-green">
          <CheckCircle2 size={24} />
        </span>
        <h3 className="mt-3 text-lg font-bold text-espresso">
          {resultado?.repetida ? 'La importación ya estaba aplicada' : 'Importación completada'}
        </h3>
        <p className="mt-1 max-w-[520px] text-[12px] text-brown-600">
          {resultado?.repetida
            ? 'Ya existía una importación con esta misma clave: no se volvió a escribir nada.'
            : 'Los cambios se guardaron en una sola transacción. El stock quedó registrado como movimiento.'}
        </p>
      </div>

      <div className="mx-auto mt-5 grid max-w-[620px] grid-cols-2 gap-2 min-[640px]:grid-cols-4">
        {[
          ['Creados', resumen.productosCreados ?? 0],
          ['Actualizados', resumen.productosActualizados ?? 0],
          ['Sin cambios', resumen.productosSinCambios ?? 0],
          ['Excluidos', resumen.filasExcluidas ?? 0],
        ].map(([titulo, valor]) => (
          <div key={titulo} className="rounded-lg bg-cream-100 px-3 py-3 text-center">
            <p className="text-xl font-bold text-brown-900">{formatearNumero(valor)}</p>
            <p className="mt-0.5 text-[10.5px] uppercase tracking-wide text-brown-500">{titulo}</p>
          </div>
        ))}
      </div>

      {resultado?.idImportacion && (
        <p className="mt-4 text-center text-[11px] text-brown-400">
          Importación #{resultado.idImportacion}
        </p>
      )}
    </div>
  )
}

/**
 * Modal "Importar con IA".
 *
 * Pasos:
 *   1. archivo   -> se analiza automáticamente (sin escribir nada)
 *   2. revisión  -> mapeo, modo de stock, filas ambiguas y confirmación
 *   3. resultado -> resumen de lo aplicado
 */
export default function ImportProductsModal({ onClose, onImported }) {
  const [paso, setPaso] = useState('archivo')
  const [archivo, setArchivo] = useState(null)
  const [analisis, setAnalisis] = useState(null)
  const [mapeo, setMapeo] = useState({})
  const [modo, setModo] = useState(null)
  const [incluidas, setIncluidas] = useState({})
  const [resoluciones, setResoluciones] = useState({})
  const [crearCategorias, setCrearCategorias] = useState(false)
  const [clave, setClave] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [mostrarMapeo, setMostrarMapeo] = useState(false)

  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const alPresionar = (event) => {
      if (event.key === 'Escape' && !cargando) onCloseRef.current()
    }
    const overflowPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', alPresionar)

    return () => {
      document.body.style.overflow = overflowPrevio
      document.removeEventListener('keydown', alPresionar)
    }
  }, [cargando])

  const filas = useMemo(() => analisis?.filas ?? [], [analisis])
  const hayColumnaStock = analisis?.mapeo?.stock !== undefined

  const pendientes = useMemo(
    () => resumirSeleccion(filas, incluidas, resoluciones).pendientes,
    [filas, incluidas, resoluciones],
  )

  const mapeoModificado = useMemo(
    () => analisis && JSON.stringify(mapeo) !== JSON.stringify(analisis.mapeo ?? {}),
    [analisis, mapeo],
  )

  const errorDetalles = error?.detalles?.errores ?? error?.cuerpo?.errores ?? []

  const aplicarAnalisis = (datos, file) => {
    setArchivo(file)
    setAnalisis(datos)
    setMapeo(datos.mapeo ?? {})
    setModo((actual) => datos.modoStock ?? actual)
    setIncluidas((previas) => {
      const siguientes = { ...previas }
      for (const fila of datos.filas ?? []) {
        if (!(String(fila.fila) in siguientes)) {
          siguientes[fila.fila] = fila.estado !== 'invalida'
        }
      }
      return siguientes
    })
    setClave((actual) => actual ?? crearClaveIdempotencia())
    setPaso('revision')
  }

  const analizar = async (file, { modoStock = modo, mapeoEnviado = null } = {}) => {
    setCargando(true)
    setError(null)

    try {
      const datos = await analizarImportacion({
        archivo: file,
        hoja: mapeoEnviado ? analisis?.archivo?.hoja : null,
        modoStock,
        mapeo: mapeoEnviado,
        iaToken: mapeoEnviado ? analisis?.iaToken : null,
      })

      aplicarAnalisis(datos, file)
    } catch (fallo) {
      setError(fallo)
      if (!analisis) setPaso('archivo')
    } finally {
      setCargando(false)
    }
  }

  const elegirArchivo = (file) => {
    setResultado(null)
    setResoluciones({})
    setIncluidas({})
    setClave(crearClaveIdempotencia())
    analizar(file, { modoStock: null })
  }

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo)
    if (archivo) analizar(archivo, { modoStock: nuevoModo, mapeo })
  }

  const cambiarMapeo = (campo, columna) => {
    setMapeo((actual) => {
      const siguiente = { ...actual }

      if (columna === null) {
        delete siguiente[campo]
        return siguiente
      }

      // Una columna no puede estar en dos campos a la vez.
      for (const [otroCampo, indice] of Object.entries(siguiente)) {
        if (indice === columna && otroCampo !== campo) delete siguiente[otroCampo]
      }

      siguiente[campo] = columna
      return siguiente
    })
  }

  const confirmar = async () => {
    if (!archivo || !clave || pendientes > 0) return

    setCargando(true)
    setError(null)

    const decisiones = {}
    for (const fila of filas) {
      const claveFila = String(fila.fila)
      const incluir = incluidas[claveFila] ?? true

      if (!incluir || fila.estado === 'invalida') {
        decisiones[fila.fila] = { accion: 'EXCLUIR' }
        continue
      }

      if (fila.estado === 'ambigua') {
        const resolucion = resoluciones[claveFila] ?? ''
        if (resolucion === 'crear') decisiones[fila.fila] = { accion: 'CREAR' }
        else if (resolucion.startsWith('vincular:')) {
          decisiones[fila.fila] = {
            accion: 'VINCULAR',
            idProducto: Number(resolucion.split(':')[1]),
          }
        } else {
          decisiones[fila.fila] = { accion: 'EXCLUIR' }
        }
      }
    }

    try {
      const datos = await confirmarImportacion({
        archivo,
        hoja: analisis?.archivo?.hoja,
        modoStock: modo,
        mapeo,
        decisiones,
        crearCategorias,
        idempotencyKey: clave,
        iaToken: analisis?.iaToken,
      })
      setResultado(datos)
      setPaso('resultado')
      onImported?.()
    } catch (fallo) {
      setError(fallo)
    } finally {
      setCargando(false)
    }
  }

  const reiniciar = () => {
    setPaso('archivo')
    setArchivo(null)
    setAnalisis(null)
    setMapeo({})
    setModo(null)
    setIncluidas({})
    setResoluciones({})
    setClave(null)
    setResultado(null)
    setError(null)
    setMostrarMapeo(false)
    setCrearCategorias(false)
  }

  const titulo =
    paso === 'resultado' ? 'Resultado de la importación' : 'Importar productos con IA'

  const subtitulo =
    paso === 'revision' && archivo
      ? `${archivo.name} · hoja ${analisis?.archivo?.hoja ?? '—'} · ${filas.length} fila(s)`
      : 'Revisá la vista previa antes de guardar. Nada se escribe hasta que confirmes.'

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-espresso/50 backdrop-blur-[2px] sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !cargando) onCloseRef.current()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="importar-productos-titulo"
        className="flex h-full w-full max-w-[1200px] flex-col overflow-hidden bg-white shadow-2xl sm:h-[92vh] sm:rounded-xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-cream-200 px-5 py-4">
          <div className="min-w-0">
            <h2
              id="importar-productos-titulo"
              className="text-lg font-bold tracking-tight text-espresso"
            >
              {titulo}
            </h2>
            <p className="mt-0.5 truncate text-[11.5px] text-brown-500">{subtitulo}</p>
          </div>
          <button
            type="button"
            onClick={() => !cargando && onCloseRef.current()}
            aria-label="Cerrar"
            disabled={cargando}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-brown-600 transition-colors hover:bg-cream-100 hover:text-brown-900 disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </header>

        <div className="scrollbar-custom min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {paso === 'archivo' && (
            <div className="mx-auto max-w-[640px]">
              <ImportDropzone
                archivo={archivo}
                disabled={cargando}
                onArchivo={elegirArchivo}
                onError={(mensaje) => setError(mensaje ? new Error(mensaje) : null)}
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11.5px] text-brown-500">
                  La IA solo se usa para interpretar los encabezados. El stock y los precios
                  salen siempre de tu archivo.
                </p>
                <button
                  type="button"
                  onClick={() => descargarPlantillaProductos()}
                  className={claseBotonSecundario}
                >
                  <Download size={14} />
                  Descargar plantilla
                </button>
              </div>

              {cargando && (
                <p className="mt-5 flex items-center justify-center gap-2 text-[12px] text-brown-600">
                  <Loader2 size={15} className="animate-spin" />
                  Analizando el archivo…
                </p>
              )}
            </div>
          )}

          {paso === 'revision' && analisis && (
            <div className="flex flex-col gap-4">
              {analisis.necesitaMapeo && (
                <div className="flex items-start gap-2 rounded-lg bg-stock-amber-bg px-3 py-2.5 text-[11.5px] text-stock-amber">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <span>
                    No pudimos reconocer las columnas de código y descripción. Elegilas a mano y
                    volvé a analizar.
                  </span>
                </div>
              )}

              <section className="rounded-lg border border-cream-200 px-3 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[12.5px] font-bold text-brown-900">Columnas</h3>
                    {analisis.ia?.usada ? (
                      <span className="inline-flex items-center gap-1 rounded bg-stock-green-bg px-1.5 py-0.5 text-[10.5px] font-semibold text-stock-green">
                        <Sparkles size={11} />
                        Interpretadas con IA
                      </span>
                    ) : (
                      mensajeIA(analisis.ia?.motivo) && (
                        <span className="rounded bg-cream-200 px-1.5 py-0.5 text-[10.5px] font-semibold text-brown-600">
                          Sin IA
                        </span>
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMostrarMapeo((valor) => !valor)}
                      className="text-[11.5px] font-semibold text-rust-600 hover:text-rust-700"
                    >
                      {mostrarMapeo ? 'Ocultar mapeo' : 'Corregir columnas'}
                    </button>
                    {mapeoModificado && (
                      <button
                        type="button"
                        disabled={cargando}
                        onClick={() => analizar(archivo, { modoStock: modo, mapeo })}
                        className={claseBotonSecundario}
                      >
                        {cargando ? <Loader2 size={14} className="animate-spin" /> : null}
                        Aplicar mapeo
                      </button>
                    )}
                  </div>
                </div>

                {mensajeIA(analisis.ia?.motivo) && !analisis.ia?.usada && (
                  <p className="mt-1.5 text-[11px] text-brown-500">{mensajeIA(analisis.ia?.motivo)}</p>
                )}
                {analisis.ia?.usada && (
                  <p className="mt-1.5 text-[11px] text-brown-500">
                    Modelo {analisis.ia.modelo} · {analisis.ia.ms} ms · se enviaron solo encabezados y
                    {` ${Math.min(10, filas.length)} `}filas de muestra con los números enmascarados.
                  </p>
                )}

                {mostrarMapeo && (
                  <div className="mt-3">
                    <ImportColumnMapper
                      encabezados={analisis.encabezados}
                      mapeo={mapeo}
                      onCambio={cambiarMapeo}
                      disabled={cargando}
                    />
                  </div>
                )}
              </section>

              {hayColumnaStock && (
                <section className="rounded-lg border border-cream-200 px-3 py-3">
                  <h3 className="text-[12.5px] font-bold text-brown-900">
                    ¿Qué hacemos con el stock de los productos existentes?
                  </h3>
                  <p className="mt-0.5 text-[11px] text-brown-500">
                    Es obligatorio elegirlo: no se adivina. Los productos nuevos siempre entran con
                    el stock de la planilla.
                  </p>

                  <div className="mt-2 grid grid-cols-1 gap-2 min-[640px]:grid-cols-2">
                    {MODOS.map((opcion) => {
                      const activo = modo === opcion.valor
                      return (
                        <button
                          key={opcion.valor}
                          type="button"
                          disabled={cargando}
                          onClick={() => cambiarModo(opcion.valor)}
                          className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                            activo
                              ? 'border-rust-600 bg-rust-600/5'
                              : 'border-cream-300 bg-white hover:border-cream-400'
                          }`}
                        >
                          <span className="flex items-center gap-2 text-[12px] font-semibold text-brown-900">
                            <span
                              className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                                activo ? 'border-rust-600' : 'border-brown-400'
                              }`}
                            >
                              {activo && <span className="h-2 w-2 rounded-full bg-rust-600" />}
                            </span>
                            {opcion.titulo}
                          </span>
                          <span className="mt-1 block pl-5 text-[11px] text-brown-500">
                            {opcion.descripcion}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              )}

              <section className="rounded-lg border border-cream-200 px-3 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-[12.5px] font-bold text-brown-900">Vista previa</h3>
                  <Resumen filas={filas} incluidas={incluidas} resoluciones={resoluciones} />
                </div>

                {filas.length > 0 ? (
                  <div className="mt-2">
                    <ImportPreviewTable
                      filas={filas}
                      modo={modo}
                      incluidas={incluidas}
                      resoluciones={resoluciones}
                      disabled={cargando}
                      onIncluir={(numeroFila, valor) =>
                        setIncluidas((actual) => ({ ...actual, [numeroFila]: valor }))
                      }
                      onResolver={(numeroFila, valor) =>
                        setResoluciones((actual) => ({ ...actual, [numeroFila]: valor }))
                      }
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-[11.5px] text-brown-500">
                    No hay filas para mostrar.
                  </p>
                )}
              </section>

              {(analisis.advertencias?.length > 0 || analisis.columnasIgnoradas?.length > 0) && (
                <section className="rounded-lg bg-cream-100 px-3 py-2.5">
                  <ul className="list-inside list-disc space-y-1 text-[11px] text-brown-600">
                    {(analisis.advertencias ?? []).map((advertencia) => (
                      <li key={advertencia}>{advertencia}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="rounded-lg border border-cream-200 px-3 py-3">
                <label className="flex items-start gap-2 text-[11.5px] text-brown-700">
                  <input
                    type="checkbox"
                    checked={crearCategorias}
                    disabled={cargando}
                    onChange={(event) => setCrearCategorias(event.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 accent-rust-600"
                  />
                  <span>
                    Crear las categorías que no existan.
                    <span className="block text-[10.5px] text-brown-500">
                      Si una fila trae una categoría nueva y esta opción está desmarcada, la
                      importación se rechaza sin escribir nada.
                    </span>
                  </span>
                </label>

                {analisis.categoriasNuevas?.length > 0 && (
                  <p className="mt-2 pl-5 text-[10.5px] text-brown-500">
                    {analisis.categoriasNuevas.length === 1
                      ? 'Categoría nueva en el archivo: '
                      : 'Categorías nuevas en el archivo: '}
                    <b className="text-brown-700">{analisis.categoriasNuevas.join(', ')}</b>
                  </p>
                )}
              </section>
            </div>
          )}

          {paso === 'resultado' && <PanelResultado resultado={resultado} />}

          {error && (
            <div className="mt-4 rounded-lg bg-stock-red-bg px-3 py-2.5 text-[11.5px] text-stock-red">
              <p className="flex items-start gap-2 font-semibold">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                <span>{error.message}</span>
              </p>
              {errorDetalles.length > 0 && (
                <ul className="mt-2 max-h-[160px] scrollbar-custom list-inside list-disc space-y-0.5 overflow-y-auto pl-5 font-normal">
                  {errorDetalles.slice(0, 100).map((detalle, indice) => (
                    <li key={`${detalle.fila}-${indice}`}>
                      {detalle.fila ? `Fila ${detalle.fila}: ` : ''}
                      {detalle.mensaje}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-cream-200 bg-alabaster px-5 py-3.5">
          <div className="flex items-center gap-2 text-[11px] text-brown-500">
            {paso === 'revision' && analisis && (
              <>
                <span
                  className={`inline-flex rounded px-1.5 py-0.5 text-[10.5px] font-semibold ${claseEstado(
                    pendientes > 0 ? 'ambigua' : 'nuevo',
                  )}`}
                >
                  {pendientes > 0 ? 'Faltan decisiones' : 'Listo para importar'}
                </span>
                {hayColumnaStock && !modo && <span>Todavía no elegiste qué hacer con el stock.</span>}
                {pendientes > 0 && (
                  <span>Resolvé las coincidencias ambiguas antes de continuar.</span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {paso === 'archivo' && (
              <button type="button" onClick={onClose} className={claseBotonSecundario}>
                Cancelar
              </button>
            )}

            {paso === 'revision' && (
              <>
                <button
                  type="button"
                  onClick={reiniciar}
                  disabled={cargando}
                  className={claseBotonSecundario}
                >
                  Elegir otro archivo
                </button>
                <button
                  type="button"
                  onClick={confirmar}
                  disabled={cargando || pendientes > 0 || (hayColumnaStock && !modo) || Boolean(analisis?.necesitaMapeo)}
                  className={claseBotonPrimario}
                >
                  {cargando ? <Loader2 size={14} className="animate-spin" /> : null}
                  Confirmar importación
                </button>
              </>
            )}

            {paso === 'resultado' && (
              <>
                <button type="button" onClick={onClose} className={claseBotonSecundario}>
                  Cerrar
                </button>
                <button type="button" onClick={reiniciar} className={claseBotonPrimario}>
                  Importar otro archivo
                </button>
              </>
            )}
          </div>
        </footer>
      </section>
    </div>,
    document.body,
  )
}
