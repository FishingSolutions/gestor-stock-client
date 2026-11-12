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

  // Stock inicial: la base lo registra como movimiento (ENTRADA 0 → stock)
  // vía RPC transaccional; sin esto el alta no aparece en movimientos
  const initialStock = Number(stockActual) || 0
  if (initialStock > 0) {
    const { error: movementError } = await supabase.rpc('registrar_stock_inicial', {
      p_id_producto: data.id_producto,
      p_cantidad: initialStock,
    })
    if (movementError) {
      throw new Error(
        `El producto se creó, pero falló el registro del stock inicial: ${movementError.message}`,
      )
    }
  }

  return data
}

/**
 * Ajuste de stock vía RPC de Supabase (security definer): el servidor
 * calcula stock_anterior/resultante desde el stock real de la base,
 * actualiza producto.stock_actual e inserta el movimiento en una
 * transacción. El cliente solo declara tipo, magnitud y motivo.
 */
export async function registrarAjusteStock({ idProducto, tipo, cantidad, motivo }) {
  const { error } = await supabase.rpc('ajustar_stock', {
    p_id_producto: idProducto,
    p_tipo: tipo,
    p_cantidad: cantidad,
    p_motivo: motivo,
  })
  if (error) throw error
}

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
) {
  const { data, error } = await supabase
    .from('producto')
    .update({
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio_costo: Number(precioCosto) || 0,
      precio_venta: Number(precioVenta) || 0,
      stock_actual: Number(stockActual) || 0,
      stock_minimo: Number(stockMinimo) || 0,
      stock_maximo: Number(stockMaximo) || 0,
      activo: Boolean(activo),
      id_categoria: idCategoria || null,
    })
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
