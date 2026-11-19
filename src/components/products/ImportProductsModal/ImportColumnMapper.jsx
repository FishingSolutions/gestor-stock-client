const CAMPOS = [
  { campo: 'codigo', titulo: 'Código', obligatorio: true },
  { campo: 'nombre', titulo: 'Descripción', obligatorio: true },
  { campo: 'precio', titulo: 'Precio de venta' },
  { campo: 'costo', titulo: 'Precio de costo' },
  { campo: 'stock', titulo: 'Stock' },
  { campo: 'categoria', titulo: 'Categoría' },
  { campo: 'descripcion', titulo: 'Detalle' },
  { campo: 'stockMinimo', titulo: 'Stock mínimo' },
  { campo: 'stockMaximo', titulo: 'Stock máximo' },
  { campo: 'activo', titulo: 'Activo (SI/NO)' },
]

const claseSelect =
  'h-9 w-full rounded border border-cream-300 bg-white px-2 text-[12px] text-brown-900 outline-none transition focus:border-rust-500 focus:ring-2 focus:ring-rust-500/20 disabled:bg-cream-100 disabled:text-brown-500'

/**
 * Permite corregir a mano qué columna de la planilla corresponde a cada campo.
 * Mientras el administrador cambia algo, el resto queda deshabilitado.
 */
export default function ImportColumnMapper({ encabezados, mapeo, onCambio, disabled = false }) {
  const usadas = new Set(Object.values(mapeo))

  return (
    <div>
      <p className="text-[11.5px] text-brown-500">
        Revisá que cada campo apunte a la columna correcta. Las columnas sin usar se ignoran.
      </p>

      <div className="mt-2 grid grid-cols-1 gap-2 min-[700px]:grid-cols-2 min-[1100px]:grid-cols-3">
        {CAMPOS.map(({ campo, titulo, obligatorio }) => {
          const valor = mapeo[campo]
          const esObligatorio = obligatorio && valor === undefined

          return (
            <label key={campo} className="flex flex-col gap-1">
              <span className="text-[10.5px] font-semibold uppercase tracking-wide text-brown-500">
                {titulo}
                {obligatorio && <span className="text-rust-600"> *</span>}
              </span>
              <select
                className={`${claseSelect} ${esObligatorio ? 'border-wine-600/60 ring-1 ring-wine-600/20' : ''}`}
                value={valor ?? ''}
                disabled={disabled}
                onChange={(event) => {
                  const seleccion = event.target.value
                  onCambio(campo, seleccion === '' ? null : Number(seleccion))
                }}
              >
                <option value="">— Sin usar —</option>
                {encabezados.map((encabezado, indice) => (
                  <option key={`${campo}-${indice}`} value={indice} disabled={usadas.has(indice) && valor !== indice}>
                    {indice + 1}. {encabezado}
                  </option>
                ))}
              </select>
            </label>
          )
        })}
      </div>
    </div>
  )
}
