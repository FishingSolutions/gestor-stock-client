import { useEffect, useRef, useState } from 'react'
import Drawer from '../../ui/Drawer/Drawer'
import Dropdown from '../../ui/Dropdown/Dropdown'
import { createProduct } from '../../../features/products/services/productsService'

const INITIAL_FORM = {
  nombre: '',
  codigo: '',
  categoria: '',
  descripcion: '',
  precioCosto: '',
  precioVenta: '',
  stockActual: '0',
  stockMinimo: '',
  stockMaximo: '',
  activo: 'activo',
}

function buildInitialForm(initialValues) {
  return {
    ...INITIAL_FORM,
    ...initialValues,
    stockActual:
      initialValues?.stockActual === undefined
        ? INITIAL_FORM.stockActual
        : String(initialValues.stockActual),
  }
}

const inputClassName =
  'h-10 w-full rounded bg-cream-100 px-3 text-[12.5px] text-brown-900 outline-none transition placeholder:text-brown-400 focus:bg-white focus:ring-2 focus:ring-rust-500/20'

function SectionLabel({ children }) {
  return (
    <div className="mb-3 mt-1 flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.06em] text-brown-500">
      {children}
      <span className="h-px flex-1 bg-cream-200" />
    </div>
  )
}

function FieldError({ children }) {
  if (!children) return null
  return (
    <span className="text-[10.5px] font-medium text-wine-600">{children}</span>
  )
}

export default function ProductDrawer({ categories, initialValues, onClose, onCreated }) {
  const [form, setForm] = useState(() => buildInitialForm(initialValues))
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [saving, setSaving] = useState(false)
  const nameRef = useRef(null)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const requestClose = () => {
    if (!saving) onClose()
  }

  const update = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }))

    setErrors((previous) => {
      if (!previous[field]) return previous
      const next = { ...previous }
      delete next[field]
      return next
    })
  }

  const validate = () => {
    const next = {}

    if (!form.nombre.trim()) next.nombre = 'Ingresá el nombre'
    if (!form.codigo.trim()) next.codigo = 'Ingresá el código'
    if (!form.categoria) next.categoria = 'Elegí una categoría'

    const numericFields = [
      ['precioCosto', 'Ingresá el precio de costo'],
      ['precioVenta', 'Ingresá el precio de venta'],
      ['stockActual', 'Ingresá el stock actual'],
      ['stockMinimo', 'Ingresá el stock mínimo'],
      ['stockMaximo', 'Ingresá el stock máximo'],
    ]

    numericFields.forEach(([field, message]) => {
      if (form[field] === '') {
        next[field] = message
      } else if (Number(form[field]) < 0) {
        next[field] = 'No puede ser negativo'
      }
    })

    return next
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (saving) return

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    setServerError(null)

    try {
      await createProduct({
        ...form,
        idCategoria: form.categoria,
      })
      onCreated?.()
      onClose()
    } catch (error) {
      setServerError(
        error?.message || 'No pudimos guardar el producto. Intentá de nuevo.',
      )
      setSaving(false)
    }
  }

  return (
    <Drawer
      title="Nuevo producto"
      onClose={requestClose}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] text-brown-500">
            <span className="text-rust-600">*</span> Campos obligatorios
          </span>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={requestClose}
              disabled={saving}
              className="h-9 rounded bg-cream-100 px-4 text-[12.5px] font-semibold text-brown-700 transition-colors hover:bg-cream-200 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={saving}
              className="h-9 rounded bg-rust-600 px-4 text-[12.5px] font-semibold text-cream-50 transition-colors hover:bg-rust-700 disabled:opacity-60"
            >
              {saving ? 'Guardando…' : 'Guardar producto'}
            </button>
          </div>
        </div>
      }
    >
      <form id="product-form" noValidate onSubmit={handleSubmit}>
        {serverError && (
          <div className="mb-4 rounded bg-stock-red-bg px-3 py-2 text-[11.5px] text-wine-600">
            {serverError}
          </div>
        )}

        <SectionLabel>Datos generales</SectionLabel>

        <div className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11.5px] font-semibold text-brown-600">
              Nombre <span className="text-rust-600">*</span>
            </span>
            <input
              ref={nameRef}
              type="text"
              value={form.nombre}
              onChange={(event) => update('nombre', event.target.value)}
              placeholder="Ej: Taladro Percutor 750W"
              aria-invalid={Boolean(errors.nombre)}
              className={`${inputClassName} ${
                errors.nombre ? 'ring-2 ring-wine-600/25' : ''
              }`}
            />
            <FieldError>{errors.nombre}</FieldError>
          </label>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11.5px] font-semibold text-brown-600">
                Código <span className="text-rust-600">*</span>
              </span>
              <input
                type="text"
                value={form.codigo}
                onChange={(event) => update('codigo', event.target.value)}
                placeholder="Ej: TAL-3300"
                aria-invalid={Boolean(errors.codigo)}
                className={`${inputClassName} ${
                  errors.codigo ? 'ring-2 ring-wine-600/25' : ''
                }`}
              />
              <FieldError>{errors.codigo}</FieldError>
            </label>

            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[11.5px] font-semibold text-brown-600">
                Categoría <span className="text-rust-600">*</span>
              </span>
              <Dropdown
                label="Categoría"
                value={form.categoria}
                onChange={(value) => update('categoria', value)}
                options={categories}
                placeholder="Elegir categoría"
                align="right"
                className="w-full"
                buttonClassName={`h-10 text-[12.5px] ${
                  errors.categoria ? 'ring-2 ring-wine-600/25' : ''
                }`}
              />
              <FieldError>{errors.categoria}</FieldError>
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11.5px] font-semibold text-brown-600">
              Descripción{' '}
              <span className="font-medium text-brown-400">(opcional)</span>
            </span>
            <textarea
              value={form.descripcion}
              onChange={(event) => update('descripcion', event.target.value)}
              placeholder="Detalles, medidas, material..."
              className="min-h-[74px] w-full resize-y rounded bg-cream-100 px-3 py-2.5 text-[12.5px] text-brown-900 outline-none transition placeholder:text-brown-400 focus:bg-white focus:ring-2 focus:ring-rust-500/20"
            />
          </label>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11.5px] font-semibold text-brown-600">
              Precio costo <span className="text-rust-600">*</span>
            </span>
            <span className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-brown-500">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.precioCosto}
                onChange={(event) => update('precioCosto', event.target.value)}
                placeholder="0.00"
                aria-invalid={Boolean(errors.precioCosto)}
                className={`${inputClassName} pl-7 ${
                  errors.precioCosto ? 'ring-2 ring-wine-600/25' : ''
                }`}
              />
            </span>
            <FieldError>{errors.precioCosto}</FieldError>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11.5px] font-semibold text-brown-600">
              Precio venta <span className="text-rust-600">*</span>
            </span>
            <span className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-brown-500">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.precioVenta}
                onChange={(event) => update('precioVenta', event.target.value)}
                placeholder="0.00"
                aria-invalid={Boolean(errors.precioVenta)}
                className={`${inputClassName} pl-7 ${
                  errors.precioVenta ? 'ring-2 ring-wine-600/25' : ''
                }`}
              />
            </span>
            <FieldError>{errors.precioVenta}</FieldError>
          </label>
        </div>

        <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {[
            ['stockActual', 'Stock actual'],
            ['stockMinimo', 'Stock mínimo'],
            ['stockMaximo', 'Stock máximo'],
          ].map(([field, label]) => (
            <label key={field} className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[11.5px] font-semibold text-brown-600">
                {label} <span className="text-rust-600">*</span>
              </span>
              <span className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form[field]}
                  onChange={(event) => update(field, event.target.value)}
                  placeholder="0"
                  aria-invalid={Boolean(errors[field])}
                  className={`${inputClassName} pr-9 ${
                    errors[field] ? 'ring-2 ring-wine-600/25' : ''
                  }`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10.5px] text-brown-500">
                  un.
                </span>
              </span>
              <FieldError>{errors[field]}</FieldError>
            </label>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <span className="text-[11.5px] font-semibold text-brown-600">
            Estado
          </span>
          <div className="inline-flex w-full self-start rounded bg-cream-100 p-0.5 sm:w-auto">
            {[
              ['activo', 'Activo'],
              ['inactivo', 'Inactivo'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => update('activo', value)}
                className={`h-8 flex-1 rounded px-4 text-xs font-semibold transition-colors sm:flex-none ${
                  form.activo === value
                    ? 'bg-rust-600 text-cream-50'
                    : 'text-brown-500 hover:text-brown-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Drawer>
  )
}
