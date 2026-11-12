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
    idCategoria: row.id_categoria,
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

export async function createProduct({
  codigo,
  nombre,
  descripcion,
  precioCosto,
  precioVenta,
  stockActual,
  stockMinimo,
  stockMaximo,
  activo,
  idCategoria,
}) {
  const { data, error } = await supabase
    .from('producto')
    .insert({
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio_costo: Number(precioCosto) || 0,
      precio_venta: Number(precioVenta) || 0,
      stock_actual: Number(stockActual) || 0,
      stock_minimo: Number(stockMinimo) || 0,
      stock_maximo: Number(stockMaximo) || 0,
      activo: activo === 'activo',
      id_categoria: idCategoria,
    })
    .select('id_producto')
    .single()

  if (error) throw error
  return data
}

/**
 * Actualiza un producto vía Supabase.
 *
 * `options.updateStock = false` permite guardar los demás campos sin tocar
 * `stock_actual`; en ese caso el stock lo modifica la RPC de movimientos.
 */
export async function updateProduct(
  id,
  {
    codigo,
    nombre,
    descripcion,
    precioCosto,
    precioVenta,
    stockActual,
    stockMinimo,
    stockMaximo,
    activo,
    idCategoria,
  },
  { updateStock = true } = {},
) {
  const payload = {
    codigo: codigo.trim(),
    nombre: nombre.trim(),
    descripcion: descripcion.trim(),
    precio_costo: Number(precioCosto) || 0,
    precio_venta: Number(precioVenta) || 0,
    stock_minimo: Number(stockMinimo) || 0,
    stock_maximo: Number(stockMaximo) || 0,
    activo: Boolean(activo),
    id_categoria: idCategoria || null,
  }

  if (updateStock) {
    payload.stock_actual = Number(stockActual) || 0
  }

  const { data, error } = await supabase
    .from('producto')
    .update(payload)
    .eq('id_producto', id)
    .select('id_producto')
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('producto').delete().eq('id_producto', id)
  if (error) throw error
}
