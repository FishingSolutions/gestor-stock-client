import { Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const quickQuestions = [
  '¿Cómo registro una salida?',
  '¿Qué significa stock bajo?',
  '¿Cómo agrego un producto?',
  '¿Qué es un SKU?',
]

function normalize(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getReply(question) {
  const value = normalize(question)

  if (value.includes('salida') || value.includes('entrada') || value.includes('ajuste')) {
    return 'Entrá a Movimientos, elegí el producto, seleccioná Entrada, Salida o Ajuste, indicá la cantidad y escribí el motivo. El sistema actualiza el stock y guarda el registro en el historial.'
  }

  if (value.includes('stock bajo') || value.includes('faltante') || value.includes('minimo')) {
    return 'Un producto aparece como Stock Bajo cuando su stock actual es menor o igual al stock mínimo definido. Podés revisarlo desde el Dashboard o la sección Stock Bajo.'
  }

  if (value.includes('producto') || value.includes('agregar') || value.includes('alta')) {
    return 'Desde Productos, seleccioná Nuevo producto. Completá nombre, SKU, categoría, precios y niveles de stock. Al guardar, el producto aparecerá en el listado.'
  }

  if (value.includes('sku') || value.includes('codigo')) {
    return 'El SKU es el código único que identifica un producto. Sirve para buscarlo rápido y evitar confusiones entre artículos similares.'
  }

  if (value.includes('categoria')) {
    return 'Las categorías ayudan a ordenar el inventario y filtrar productos. Por ejemplo: Bebidas, Limpieza, Lácteos o Almacén.'
  }

  if (value.includes('historial') || value.includes('movimiento')) {
    return 'El historial muestra cada entrada, salida o ajuste registrado, junto con su cantidad, fecha, motivo y usuario responsable.'
  }

  return 'Puedo ayudarte con productos, movimientos, SKU, categorías y stock bajo. Probá con una de las preguntas sugeridas.'
}

export default function StockFxAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: '¡Hola! Soy el asistente de StockFX. ¿Qué necesitás consultar?',
    },
  ])
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const sendMessage = (value = input) => {
    const question = value.trim()
    if (!question) return

    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: 'user', content: question },
      { id: crypto.randomUUID(), role: 'assistant', content: getReply(question) },
    ])
    setInput('')
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <section className="flex h-[min(560px,calc(100dvh-130px))] w-[min(360px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-cream-300 bg-alabaster shadow-2xl shadow-espresso/20">
          <header className="flex items-center gap-3 bg-espresso px-4 py-3 text-cream-50">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rust-600">
              <Bot size={19} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">Asistente StockFX</p>
              <p className="text-[11px] text-cream-300">Ayuda rápida para usar el sistema</p>
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
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <p
                  className={`max-w-[86%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed ${
                    message.role === 'user'
                      ? 'rounded-br-md bg-rust-600 text-cream-50'
                      : 'rounded-bl-md bg-cream-100 text-brown-700'
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question)}
                    className="rounded-full border border-cream-300 bg-white px-3 py-1.5 text-left text-[11px] font-medium text-brown-600 transition hover:border-rust-500 hover:text-rust-600"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
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
              placeholder="Escribí tu consulta..."
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
