import { supabase } from '../../../lib/supabase'

const PRODUCT_FIELDS =
  'id_producto, codigo, nombre, descripcion, precio_costo, precio_venta, stock_actual, stock_minimo, stock_maximo, activo, id_categoria'

const BATCH_SIZE = 1000

async function fetchAllProducts() {
  const rows = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('producto')
      .select(PRODUCT_FIELDS)
      .order('id_producto', { ascending: false })
      .range(from, from + BATCH_SIZE - 1)

    if (error) throw error

    const batch = data ?? []
    rows.push(...batch)

    if (batch.length < BATCH_SIZE) break
    from += BATCH_SIZE
  }

  return rows
}

export async function fetchProducts() {
  const [rows, categoriesResult] = await Promise.all([
    fetchAllProducts(),
    supabase.from('categoria').select('id_categoria, nombre'),
  ])

  const categoriesById = new Map(
    (categoriesResult.data ?? []).map((category) => [
      category.id_categoria,
      category.nombre,
    ]),
  )

  return rows.map((row) => ({
    id: row.id_producto,
    codigo: row.codigo,
    nombre: row.nombre,
    descripcion: row.descripcion,
    categoria:
      categoriesById.get(row.id_categoria) || 'Sin categoría',
    precioCosto: Number(row.precio_costo) || 0,
    precioVenta: Number(row.precio_venta) || 0,
    stockActual: Number(row.stock_actual) || 0,
    stockMinimo: Number(row.stock_minimo) || 0,
    stockMaximo: Number(row.stock_maximo) || 0,
    activo: row.activo !== false,
  }))
}
