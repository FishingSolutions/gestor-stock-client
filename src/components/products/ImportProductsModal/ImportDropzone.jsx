import { useRef, useState } from 'react'
import { FileSpreadsheet, Upload } from 'lucide-react'

const MAX_MB = 5
const ACEPTADOS = '.xlsx,.xls'

function formatearBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function extensionDe(nombre) {
  const punto = nombre.lastIndexOf('.')
  return punto === -1 ? '' : nombre.slice(punto).toLowerCase()
}

/**
 * Selector de archivo con arrastrar y soltar.
 * Valida extensión y tamaño antes de subir nada.
 */
export default function ImportDropzone({ archivo, onArchivo, onError, disabled = false }) {
  const inputRef = useRef(null)
  const [arrastrando, setArrastrando] = useState(false)

  const elegir = (file) => {
    if (!file || disabled) return

    if (!['.xlsx', '.xls'].includes(extensionDe(file.name))) {
      onError('El archivo tiene que ser de Excel (.xlsx o .xls).')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      onError(`El archivo supera el máximo de ${MAX_MB} MB.`)
      return
    }
    if (file.size === 0) {
      onError('El archivo está vacío.')
      return
    }

    onError(null)
    onArchivo(file)
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Elegir archivo de Excel"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            if (!disabled) inputRef.current?.click()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setArrastrando(true)
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(event) => {
          event.preventDefault()
          setArrastrando(false)
          elegir(event.dataTransfer.files?.[0])
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
          disabled
            ? 'cursor-not-allowed border-cream-300 bg-cream-100/60'
            : arrastrando
              ? 'cursor-pointer border-rust-500 bg-rust-500/5'
              : 'cursor-pointer border-cream-400 bg-alabaster hover:border-rust-500 hover:bg-cream-100'
        }`}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream-200 text-rust-600">
          <Upload size={20} />
        </span>

        {archivo ? (
          <div className="min-w-0">
            <p className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-brown-900">
              <FileSpreadsheet size={15} className="shrink-0 text-rust-600" />
              <span className="truncate">{archivo.name}</span>
            </p>
            <p className="mt-0.5 text-[11.5px] text-brown-500">
              {formatearBytes(archivo.size)} · hacé clic para cambiarlo
            </p>
          </div>
        ) : (
          <>
            <p className="text-[13px] font-semibold text-brown-900">
              Arrastrá tu planilla o hacé clic para elegirla
            </p>
            <p className="text-[11.5px] text-brown-500">
              Excel .xlsx o .xls · hasta {MAX_MB} MB y 2.000 filas
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACEPTADOS}
        className="hidden"
        onChange={(event) => {
          elegir(event.target.files?.[0])
          event.target.value = ''
        }}
      />
    </div>
  )
}
