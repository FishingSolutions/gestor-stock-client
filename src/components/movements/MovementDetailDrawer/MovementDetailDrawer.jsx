import {
  formatFullDateTime,
} from '../../../features/movements/utils/movements'
import Drawer from '../../ui/Drawer/Drawer'

const TIPO_BADGE = {
  ENTRADA: { className: 'mov-badge entrada', label: '↑ Entrada' },
  SALIDA: { className: 'mov-badge salida', label: '↓ Salida' },
  AJUSTE: { className: 'mov-badge ajuste', label: '⚖ Ajuste' },
}

// Título del motivo según el tipo; la descripción es el texto del operador.
const MOTIVO_TITLE = {
  ENTRADA: 'Ingreso de stock',
  SALIDA: 'Salida de stock',
  AJUSTE: 'Ajuste de stock',
}

function pct(value, max) {
  if (!max || max <= 0) return 0
  return Math.max(0, Math.min(100, (value / max) * 100))
}

function Field({ label, children, wide = false }) {
  return (
    <div className={`dv-field ${wide ? 'wide' : ''}`}>
      <b>{label}</b>
      {children}
    </div>
  )
}

/**
 * Drawer de detalle de un movimiento (solo lectura). La regla muestra la
 * escala del producto y el tramo que este movimiento sumó o restó.
 */
export default function MovementDetailDrawer({ movement, onClose }) {
  if (!movement) return null

  const tipo = TIPO_BADGE[movement.tipoRaw] ?? {
    className: 'mov-badge ajuste',
    label: movement.tipoRaw,
  }

  const up = movement.variacion >= 0
  const isAjuste = movement.tipoRaw === 'AJUSTE'
  const toneClass = isAjuste ? 'is-ajuste' : up ? 'is-up' : 'is-down'
  const toneColor = isAjuste
    ? 'var(--color-stock-amber)'
    : up
      ? 'var(--color-stock-green)'
      : 'var(--color-stock-red)'
  const hasScale = movement.productoMax > 0

  const lote = movement.nroLote ?? '—'
  const comprobante = movement.nroComprobante ?? '—'

  return (
    <Drawer
      title={`Movimiento #${movement.id}`}
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg bg-cream-200 px-4 text-[12.5px] font-bold text-brown-700 transition-colors hover:bg-cream-300"
          >
            Cerrar
          </button>
        </div>
      }
      headerRight={
        <span className={`${tipo.className} lg shrink-0`}>{tipo.label}</span>
      }
    >
      <div className="dv-grid">
        <div className="dv-sec-label">Detalle</div>

        <Field label="Producto" wide>
          <span className="dv-name">{movement.productoNombre}</span>
          <span className="dv-sku">
            {movement.productoCodigo}
            {movement.productoCategoria ? ` · ${movement.productoCategoria}` : ''}
          </span>
        </Field>
        <Field label="Fecha y hora">
          <span>{formatFullDateTime(movement.fecha)}</span>
        </Field>
        <Field label="Registrado por">
          <span>{movement.operador}</span>
        </Field>
        <Field label="Cantidad">
          <span
            style={{ color: toneColor }}
            className="font-bold tabular-nums"
          >
            {up ? '+' : '−'}
            {Math.abs(movement.variacion)} un.
          </span>
        </Field>
      </div>

      <div className="dv-sec-label">Cambio de stock</div>
      <div className="dv-kv">
        <b>Stock anterior</b>
        <span>{movement.stockAnterior} un.</span>
      </div>
      <div className="dv-kv">
        <b>Stock resultante</b>
        <span>
          <strong className="font-semibold text-brown-900">
            {movement.stockResultante} un.
          </strong>
        </span>
      </div>

      {hasScale && (
        <div className="dv-regla" aria-hidden="true">
          <div className="bar">
            <div
              className={`fill ${toneClass}`}
              style={{ width: `${pct(movement.stockResultante, movement.productoMax)}%` }}
            />
            <div
              className={`delta ${toneClass}`}
              style={{
                left: `${pct(Math.min(movement.stockAnterior, movement.stockResultante), movement.productoMax)}%`,
                width: `${pct(Math.abs(movement.variacion), movement.productoMax)}%`,
              }}
            />
            <div
              className="tick"
              style={{ left: `${pct(movement.productoMin, movement.productoMax)}%` }}
              title={`Stock mínimo: ${movement.productoMin}`}
            />
            <div
              className="mark"
              style={{ left: `calc(${pct(movement.stockAnterior, movement.productoMax)}% - 1px)` }}
              title={`Stock anterior: ${movement.stockAnterior}`}
            />
            <div
              className={`dot ${toneClass}`}
              style={{ left: `${pct(movement.stockResultante, movement.productoMax)}%` }}
              title={`Stock resultante: ${movement.stockResultante}`}
            />
          </div>
          <div className="lbls">
            <span>
              mín. <b>{movement.productoMin}</b>
            </span>
            <span>
              antes <b>{movement.stockAnterior}</b> → ahora{' '}
              <b>{movement.stockResultante}</b> un.
            </span>
            <span>
              máx. <b>{movement.productoMax}</b>
            </span>
          </div>
        </div>
      )}

      <div className="dv-kv motivo">
        <b>Motivo</b>
        <span className="dv-motivo-text">
          <span className="dv-motivo-title">
            {MOTIVO_TITLE[movement.tipoRaw] ?? 'Movimiento de stock'}
          </span>
          <span className="dv-motivo-desc">{movement.motivo || '—'}</span>
        </span>
      </div>

      <div className="dv-sec-label">Trazabilidad</div>
      <div className="dv-grid">
        <Field label="N° de lote">
          <span>{lote}</span>
        </Field>
        <Field label="N° de comprobante">
          <span>{comprobante}</span>
        </Field>
      </div>
    </Drawer>
  )
}
