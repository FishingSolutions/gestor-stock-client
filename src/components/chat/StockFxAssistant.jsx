import { Bot, MessageCircle, Send, Sparkles, TrendingUp, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMovements } from '../../features/movements/hooks/useMovements'
import { buildSalesRanking } from '../../features/movements/utils/movements'
import { useProducts } from '../../features/products/hooks/useProducts'

const quickQuestions = [
  'Quiero cargar un producto',
  'Dame un panorama del stock',
  '¿Qué productos debería reponer?',
  '¿Qué se mueve más?',
  '¿Cómo registro un movimiento?',
]

const numberFormat = new Intl.NumberFormat('es-AR')

function normalize(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function productNames(products, limit = 3) {
  const names = products.slice(0, limit).map((product) => product.nombre)
  if (!names.length) return ''
  if (products.length > limit) return `${names.join(', ')} y ${products.length - limit} más`
  return names.join(', ')
}

function buildContext(products, movements) {
  const activeProducts = products.filter((product) => product.activo)
  const lowStock = activeProducts
    .filter(
      (product) =>
        Number(product.stockMinimo) > 0 &&
        Number(product.stockActual) <= Number(product.stockMinimo),
    )
    .sort((a, b) => {
      const aRatio = Number(a.stockActual) / Number(a.stockMinimo)
      const bRatio = Number(b.stockActual) / Number(b.stockMinimo)
      return aRatio - bRatio
    })
  const totalUnits = activeProducts.reduce(
    (total, product) => total + (Number(product.stockActual) || 0),
    0,
  )
  const ranking = buildSalesRanking(movements)
  const saleProductIds = new Set(
    movements
      .filter((movement) => movement.tipoRaw === 'SALIDA')
      .map((movement) => movement.idProducto),
  )

  return {
    activeProducts,
    lowStock,
    totalUnits,
    ranking,
    withoutSales: activeProducts.filter((product) => !saleProductIds.has(product.id)),
    movements,
  }
}

function getReply(question, context, hasData) {
  const value = normalize(question)

  if (value.includes('cargar') || value.includes('agregar') || value.includes('alta de producto')) {
    return {
      content:
        'Para cargar un producto, entrá a Productos y tocá “Nuevo producto”. Completá nombre, SKU, categoría, precio de costo, precio de venta y los niveles de stock. El SKU debe ser único para identificarlo sin confusiones.',
      actions: [{ label: 'Ir a Productos', to: '/productos' }],
    }
  }

  if (value.includes('registrar') || value.includes('movimiento') || value.includes('entrada') || value.includes('salida') || value.includes('ajuste')) {
    return {
      content:
        'Desde Movimientos podés seleccionar el producto, elegir Entrada, Salida o Ajuste, indicar la cantidad y justificar el motivo. El sistema registra el historial y actualiza el stock sin permitir salidas negativas.',
      actions: [{ label: 'Ir a Movimientos', to: '/movimientos' }],
    }
  }

  if (!hasData) {
    return {
      content:
        'Todavía estoy cargando la información del inventario. Mientras tanto puedo orientarte sobre productos, SKU y movimientos.',
    }
  }

  if (value.includes('panorama') || value.includes('resumen') || value.includes('negocio') || value.includes('como va')) {
    const lowStockText = context.lowStock.length
      ? `${context.lowStock.length} necesitan reposición: ${productNames(context.lowStock)}.`
      : 'No hay productos por debajo del stock mínimo.'
    return {
      content: `Panorama actual: tenés ${context.activeProducts.length} productos activos y ${numberFormat.format(context.totalUnits)} unidades en stock. En los últimos 30 días se registraron ${context.movements.length} movimientos. ${lowStockText}`,
      actions: [{ label: 'Ver Dashboard', to: '/' }],
    }
  }

  if (value.includes('reponer') || value.includes('comprar') || value.includes('stock bajo') || value.includes('faltante')) {
    if (!context.lowStock.length) {
      return {
        content:
          'Por ahora no hay productos activos por debajo de su stock mínimo. Podés seguir controlando el detalle desde el Dashboard.',
        actions: [{ label: 'Ver Dashboard', to: '/' }],
      }
    }

    return {
      content: `Te sugiero revisar primero: ${context.lowStock
        .slice(0, 3)
        .map((product) => `${product.nombre} (${product.stockActual} disponibles, mínimo ${product.stockMinimo})`)
        .join('; ')}. Son los artículos que ya alcanzaron o quedaron por debajo de su mínimo.`,
      actions: [{ label: 'Ver Productos', to: '/productos' }],
    }
  }

  if (value.includes('vende') || value.includes('mueve mas') || value.includes('mas vendido')) {
    if (!context.ranking.length) {
      return {
        content:
          'Todavía no hay salidas registradas en los últimos 30 días. Cuando se registren movimientos de salida, voy a poder mostrar qué productos tuvieron mayor rotación.',
      }
    }

    return {
      content: `Según las salidas registradas en los últimos 30 días, los productos con mayor movimiento son: ${context.ranking
        .slice(0, 3)
        .map((product) => `${product.name} (${product.sold} un.)`)
        .join(', ')}. Podés usar este dato como apoyo para planificar reposición.`,
      actions: [{ label: 'Ver Movimientos', to: '/movimientos' }],
    }
  }

  if (value.includes('no se vende') || value.includes('no se mueve') || value.includes('sin salida')) {
    if (!context.withoutSales.length) {
      return {
        content:
          'Todos los productos activos tuvieron al menos una salida registrada en los últimos 30 días.',
      }
    }

    return {
      content: `No veo salidas registradas en los últimos 30 días para: ${productNames(context.withoutSales)}. Esto no confirma que no se vendan, pero sí indica que conviene revisar esos artículos y sus movimientos.`,
    }
  }

  if (value.includes('sku') || value.includes('codigo')) {
    return {
      content:
        'El SKU es el código único de un producto. Sirve para buscarlo rápido, registrar movimientos correctamente y diferenciar productos con nombres parecidos.',
    }
  }

  if (value.includes('categoria')) {
    return {
      content:
        'Las categorías ordenan el inventario y permiten filtrar productos. Ejemplos: Bebidas, Limpieza, Lácteos o Almacén.',
    }
  }

  if (value.includes('historial')) {
    return {
      content:
        'El historial guarda cada entrada, salida o ajuste, con producto, cantidad, fecha, usuario responsable y motivo. Esto permite mantener la trazabilidad del stock.',
      actions: [{ label: 'Ir a Movimientos', to: '/movimientos' }],
    }
  }

  return {
    content:
      'Puedo ayudarte a cargar productos, registrar movimientos, revisar qué reponer, resumir el estado del inventario y analizar las salidas de los últimos 30 días.',
  }
}

export default function StockFxAssistant() {
  const navigate = useNavigate()
  const { products, loading: productsLoading, error: productsError } = useProducts()
  const { movements, loading: movementsLoading, error: movementsError } = useMovements()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content:
        '¡Hola! Soy el asistente de StockFX. Puedo orientarte para usar el sistema y darte un resumen del inventario.',
    },
  ])
  const bottomRef = useRef(null)
  const context = useMemo(() => buildContext(products, movements), [products, movements])
  const hasData = !productsLoading && !movementsLoading && !productsError && !movementsError

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const sendMessage = (value = input) => {
    const question = value.trim()
    if (!question) return

    const reply = getReply(question, context, hasData)
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: 'user', content: question },
      { id: crypto.randomUUID(), role: 'assistant', ...reply },
    ])
    setInput('')
  }

  const goTo = (to) => {
    navigate(to)
    setOpen(false)
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <section className="flex h-[min(590px,calc(100dvh-130px))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-cream-300 bg-alabaster shadow-2xl shadow-espresso/20">
          <header className="flex items-center gap-3 bg-espresso px-4 py-3 text-cream-50">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rust-600">
              <Bot size={19} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">Asistente StockFX</p>
              <p className="text-[11px] text-cream-300">
                {hasData ? 'Ayuda y resumen del inventario' : 'Cargando datos del inventario...'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar asistente"
              className="rounded-lg p-1.5 text-cream-200 transition hover:bg-white/10 hover:text-cream-50"
            >
              <X size={18} />
            </button>
          </header>

          <div className="scrollbar-custom flex-1 space-y-3 overflow-y-auto px-3 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <p
                  className={`max-w-[88%] whitespace-pre-line rounded-2xl px-3 py-2 text-[12px] leading-relaxed ${
                    message.role === 'user'
                      ? 'rounded-br-md bg-rust-600 text-cream-50'
                      : 'rounded-bl-md bg-cream-100 text-brown-700'
                  }`}
                >
                  {message.content}
                </p>
                {message.actions?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.actions.map((action) => (
                      <button
                        key={action.to}
                        type="button"
                        onClick={() => goTo(action.to)}
                        className="rounded-full bg-espresso px-3 py-1.5 text-[11px] font-semibold text-cream-50 transition hover:bg-espresso-light"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="rounded-xl border border-cream-300 bg-white p-2.5">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-brown-600">
                <TrendingUp size={14} className="text-rust-600" />
                Consultas sugeridas
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question)}
                    className="rounded-full border border-cream-300 bg-cream-50 px-2.5 py-1.5 text-left text-[10.5px] font-medium text-brown-600 transition hover:border-rust-500 hover:text-rust-600"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage()
            }}
            className="flex gap-2 border-t border-cream-300 bg-white p-3"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ej: ¿Qué productos debería reponer?"
              className="min-w-0 flex-1 rounded-xl bg-cream-100 px-3 py-2 text-[12px] text-brown-900 outline-none placeholder:text-brown-400 focus:ring-2 focus:ring-rust-500/20"
            />
            <button
              type="submit"
              aria-label="Enviar consulta"
              disabled={!input.trim()}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rust-600 text-cream-50 transition hover:bg-rust-700 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Send size={16} />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente'}
        className="group flex items-center gap-2 rounded-full bg-rust-600 px-4 py-3 text-cream-50 shadow-lg shadow-rust-600/30 transition hover:bg-rust-700"
      >
        {open ? <X size={19} /> : <MessageCircle size={19} />}
        <span className="text-[12px] font-bold">¿Necesitás ayuda?</span>
        {!open && <Sparkles size={14} className="text-cream-200" />}
      </button>
    </div>
  )
}
