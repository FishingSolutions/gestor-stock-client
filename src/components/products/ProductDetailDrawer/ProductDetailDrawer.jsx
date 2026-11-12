import { useState } from 'react'
import Drawer from '../../ui/Drawer/Drawer'
import Dropdown from '../../ui/Dropdown/Dropdown'
import ConfirmDialog from '../../ui/ConfirmDialog/ConfirmDialog'
import ActiveBadge from '../ActiveBadge/ActiveBadge'
import StockMeter from '../StockMeter/StockMeter'
import StockTag from '../StockTag/StockTag'
import { getStockLevel } from '../../../features/products/utils/stock'
import {
  deleteProduct,
  registrarAjusteStock,
  updateProduct,
} from '../../../features/products/services/productsService'

const inputClassName =
  'h-10 w-full rounded bg-cream-100 px-3 text-[12.5px] text-brown-900 outline-none transition placeholder:text-brown-400 focus:bg-white focus:ring-2 focus:ring-rust-500/20'

const numberFormat = new Intl.NumberFormat('es-AR')

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

/**
 * Drawer de detalle/edición de un producto (mismo estilo que "Nuevo producto").
 * Editar y eliminar quedan reservados al rol ADMINISTRADOR (canManage).
 *
 * @param {object}   props
 * @param {object}   props.product         Producto ya mapeado del service.
 * @param {Array}    props.categories      Opciones de categoría [{value, label}].
 * @param {boolean}  [props.canManage=false] True si el rol es ADMINISTRADOR:
 *                                         habilita Editar y Eliminar producto.
 * @param {'view' | 'edit'} [props.initialMode='view']
 * @param {Function} props.onClose
 * @param {Function} [props.onUpdated]     Tras guardar cambios.
 * @param {Function} [props.onDeleted]     Tras eliminar.
 */
export default function ProductDetailDrawer({
  product,
  categories,
  canManage = false,
  initialMode = 'view',
  onClose,
  onUpdated,
  onDeleted,
}) {
  // Solo ADMINISTRADOR edita: si no puede administrar, el drawer siempre
  // abre (y queda) en modo vista.
  const [mode, setMode] = useState(canManage ? initialMode : 'view')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    nombre: product.nombre,
    codigo: product.codigo,
    categoria: product.idCategoria || '',
    descripcion: product.descripcion || '',
    precioCosto: String(product.precioCosto),
    precioVenta: String(product.precioVenta),
    stockActual: String(product.stockActual),
    stockMinimo: String(product.stockMinimo),
    stockMaximo: String(product.stockMaximo),
    motivoAjuste: '',
    activo: product.activo ? 'activo' : 'inactivo',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [saving, setSaving] = useState(false)

  const level = getStockLevel(product)
  const margen =
    product.precioVenta > 0
      ? Math.round(((product.precioVenta - product.precioCosto) / product.precioVenta) * 100)
      : 0
  const valorizado = product.stockActual * product.precioVenta

  const stockCambio = Number(form.stockActual) !== product.stockActual

  const requestClose = () => {
    if (!saving && !deleting) onClose()
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

    ;[
      ['precioCosto', 'Ingresá el precio de costo'],
      ['precioVenta', 'Ingresá el precio de venta'],
      ['stockActual', 'Ingresá el stock actual'],
      ['stockMinimo', 'Ingresá el stock mínimo'],
      ['stockMaximo', 'Ingresá el stock máximo'],
    ].forEach(([field, message]) => {
      if (form[field] === '') {
        next[field] = message
      } else if (Number(form[field]) < 0) {
        next[field] = 'No puede ser negativo'
      }
    })

    if (stockCambio && !form.motivoAjuste.trim()) {
      next.motivoAjuste = 'Contá el motivo del ajuste'
    }

    return next
  }

  const handleSave = async (event) => {
    event.preventDefault()
    if (saving) return

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    setServerError(null)

    try {
      // Si cambia el stock, el RPC ajustar_stock es el dueño del número:
      // el update de acá no lo toca (envía el stock sin cambios) para no
      // doble-contar, y el movimiento sale con los valores del servidor
      await updateProduct(product.id, {
        ...form,
        idCategoria: form.categoria,
        stockActual: stockCambio ? product.stockActual : Number(form.stockActual),
      })

      if (stockCambio) {
        const nuevoStock = Number(form.stockActual)
        await registrarAjusteStock({
          idProducto: product.id,
          tipo: nuevoStock > product.stockActual ? 'ENTRADA' : 'SALIDA',
          cantidad: Math.abs(nuevoStock - product.stockActual),
          motivo: form.motivoAjuste.trim(),
        })
      }

      onUpdated?.()
      onClose()
    } catch (error) {
      setServerError(
        error?.message || 'No pudimos guardar los cambios. Intentá de nuevo.',
      )
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (deleting) return
    setDeleting(true)

    try {
      await deleteProduct(product.id)
      onDeleted?.()
      onClose()
    } catch (error) {
      setConfirmOpen(false)
      setDeleting(false)
      setServerError(
        error?.message || 'No pudimos eliminar el producto. Intentá de nuevo.',
      )
      setMode('edit')
    }
  }

  return (
    <Drawer
      title={mode === 'edit' ? 'Editar producto' : product.nombre}
      subtitle={mode === 'view' ? `${product.codigo} · ${product.categoria || 'Sin categoría'}` : null}
      onClose={requestClose}
      footer={
        !canManage || mode === 'view' ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="push-left h-9 rounded px-3 text-[12.5px] font-semibold text-wine-600 transition-colors hover:text-wine-700 hover:underline hover:decoration-2 hover:underline-offset-4"
            >
              Eliminar producto
            </button>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={requestClose}
                className="h-9 rounded bg-cream-100 px-4 text-[12.5px] font-semibold text-brown-700 transition-colors hover:bg-cream-200"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => setMode('edit')}
                className="h-9 rounded bg-rust-600 px-4 text-[12.5px] font-semibold text-cream-50 transition-colors hover:bg-rust-700"
              >
                Editar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-brown-500">
              <span className="text-rust-600">*</span> Campos obligatorios
            </span>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => setMode('view')}
                disabled={saving}
                className="h-9 rounded bg-cream-100 px-4 text-[12.5px] font-semibold text-brown-700 transition-colors hover:bg-cream-200 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="product-detail-form"
                disabled={saving}
                className="h-9 rounded bg-rust-600 px-4 text-[12.5px] font-semibold text-cream-50 transition-colors hover:bg-rust-700 disabled:opacity-60"
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        )
      }
    >
      {mode === 'edit' && (
        <form id="product-detail-form" noValidate onSubmit={handleSave}>
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
                type="text"
                value={form.nombre}
                onChange={(event) => update('nombre', event.target.value)}
                aria-invalid={Boolean(errors.nombre)}
                className={`${inputClassName} ${errors.nombre ? 'ring-2 ring-wine-600/25' : ''}`}
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
                  aria-invalid={Boolean(errors.codigo)}
                  className={`${inputClassName} ${errors.codigo ? 'ring-2 ring-wine-600/25' : ''}`}
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
                  buttonClassName={`h-10 text-[12.5px] ${errors.categoria ? 'ring-2 ring-wine-600/25' : ''}`}
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
                  aria-invalid={Boolean(errors.precioCosto)}
                  className={`${inputClassName} pl-7 ${errors.precioCosto ? 'ring-2 ring-wine-600/25' : ''}`}
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
                  aria-invalid={Boolean(errors.precioVenta)}
                  className={`${inputClassName} pl-7 ${errors.precioVenta ? 'ring-2 ring-wine-600/25' : ''}`}
                />
              </span>
              <FieldError>{errors.precioVenta}</FieldError>
            </label>
          </div>

          <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[11.5px] font-semibold text-brown-600">
                Stock actual <span className="text-rust-600">*</span>
              </span>
              <span className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stockActual}
                  onChange={(event) => update('stockActual', event.target.value)}
                  aria-invalid={Boolean(errors.stockActual)}
                  className={`${inputClassName} pr-9 ${errors.stockActual ? 'ring-2 ring-wine-600/25' : ''}`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10.5px] text-brown-500">
                  un.
                </span>
              </span>
              <FieldError>{errors.stockActual}</FieldError>
            </label>

            {[
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
                    aria-invalid={Boolean(errors[field])}
                    className={`${inputClassName} pr-9 ${errors[field] ? 'ring-2 ring-wine-600/25' : ''}`}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10.5px] text-brown-500">
                    un.
                  </span>
                </span>
                <FieldError>{errors[field]}</FieldError>
              </label>
            ))}
          </div>

          {stockCambio && (
            <div className="mt-3">
              <div className="flex items-start gap-2 rounded bg-stock-amber-bg px-3 py-2 text-[11.5px] text-stock-amber">
                <b>
                  Cambiaste el stock ({product.stockActual} →{' '}
                  {Number(form.stockActual)}): se registra un movimiento AJUSTE
                  con el motivo de abajo.
                </b>
              </div>
              <label className="mt-2 flex flex-col gap-1.5">
                <span className="text-[11.5px] font-semibold text-brown-600">
                  Motivo del ajuste <span className="text-rust-600">*</span>
                </span>
                <input
                  type="text"
                  value={form.motivoAjuste}
                  onChange={(event) => update('motivoAjuste', event.target.value)}
                  placeholder="Ej: Recuento de depósito, compra, mermas…"
                  className={`${inputClassName} ${errors.motivoAjuste ? 'ring-2 ring-wine-600/25' : ''}`}
                />
                <FieldError>{errors.motivoAjuste}</FieldError>
              </label>
            </div>
          )}

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
      )}

      {mode === 'view' && (
        <div>
          <SectionLabel>Estado</SectionLabel>
          <div className="flex flex-wrap items-center gap-1.5">
            <ActiveBadge activo={product.activo} />
            <StockTag level={level} />
            <span className="inline-flex items-center rounded-full bg-cream-200 px-2.5 py-0.5 text-[10.5px] font-semibold text-brown-600">
              {product.categoria || 'Sin categoría'}
            </span>
          </div>

          <SectionLabel>Stock</SectionLabel>
          <div className="rounded-lg border border-cream-200 bg-alabaster p-3">
            <div className="flex items-baseline gap-2">
              <b className="text-xl tabular-nums">{product.stockActual}</b>
              <small className="text-[11px] text-brown-500">un.</small>
              <span className="ml-auto text-[11px] tabular-nums text-brown-500">
                mín. {product.stockMinimo} · máx. {product.stockMaximo}
              </span>
            </div>
            <StockMeter product={product} level={level} className="mt-2" />
          </div>

          <SectionLabel>Información</SectionLabel>
          <div>
            {[
              ['Precio costo', `$${numberFormat.format(product.precioCosto)}`],
              ['Precio venta', `$${numberFormat.format(product.precioVenta)}`],
              [
                'Margen',
                `${margen}% · ${numberFormat.format(product.precioVenta - product.precioCosto)}`,
              ],
              ['Valorizado', `$${numberFormat.format(valorizado)}`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-baseline justify-between border-b border-dashed border-cream-200 py-2 text-[12.5px]"
              >
                <b className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-brown-500">
                  {label}
                </b>
                <span className="font-semibold tabular-nums">{value}</span>
              </div>
            ))}
            <div className="flex items-baseline justify-between border-b border-dashed border-cream-200 py-2 text-[12.5px]">
              <b className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-brown-500">
                Descripción
              </b>
              <span className="ml-4 text-left font-medium">
                {product.descripcion || '—'}
              </span>
            </div>
          </div>
        </div>
      )}

      {canManage && (
      <ConfirmDialog
        open={confirmOpen}
        title="¿Eliminar este producto?"
        message={
          <>
            Vas a eliminar <b>{product.nombre}</b> ({product.codigo}). Esta
            acción no se puede deshacer.
          </>
        }
        confirmLabel="Sí, eliminar"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
      )}
    </Drawer>
  )
}
