/**
 * Une clases de Tailwind (u otras) en un solo string, ignorando los valores falsos.
 * Útil para combinar clases base con clases condicionales sin ensuciar el JSX.
 *
 * @param {...(string | false | null | undefined)} classes
 * @returns {string}
 *
 * @example
 * cx('flex items-center', isActive && 'bg-rust-600', className)
 */
export function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}
