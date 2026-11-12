/**
 * Shell de card del dashboard: contenedor blanco con el radio y padding
 * estándar del app. `busy` activa el aria-busy del estado cargando.
 */
export default function Card({ busy = false, className = '', children }) {
  return (
    <section
      aria-busy={busy || undefined}
      className={`relative flex min-h-0 flex-col rounded-lg bg-white p-3.5 ${className}`}
    >
      {children}
    </section>
  )
}

/**
 * Header de card: título siempre en una línea + subtítulo (visible en
 * pantallas grandes) + actions a la derecha con ml-auto.
 */
export function CardHeader({ title, sub, className = '', children }) {
  return (
    <header className={`flex items-baseline gap-2.5 ${className}`}>
      <h2 className="whitespace-nowrap text-[13px] font-bold tracking-tight text-brown-900">
        {title}
      </h2>
      {sub && (
        <p className="hidden text-[11px] text-brown-500 min-[900px]:block">{sub}</p>
      )}
      {children}
    </header>
  )
}
