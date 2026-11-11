export function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}
