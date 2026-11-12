import { useCallback, useEffect, useState } from 'react'
import { fetchMovements } from '../services/movementsService'

/**
 * Movimientos paginados, filtrables por tipo y producto.
 *
 * El estado guarda la "clave" de la request que lo produjo: si cambian los
 * filtros, `loading` se deriva comparando esa clave, sin setear estado sincrónico
 * dentro del efecto.
 */
export function useMovements({
  tipo = 'all',
  idProducto = null,
  page = 1,
  pageSize = 20,
} = {}) {
  const [result, setResult] = useState({
    key: null,
    items: [],
    total: 0,
    error: null,
  })
  const [reloadKey, setReloadKey] = useState(0)

  const requestKey = `${tipo}|${idProducto ?? ''}|${page}|${pageSize}|${reloadKey}`

  useEffect(() => {
    let active = true

    fetchMovements({
      tipo,
      idProducto,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })
      .then((data) => {
        if (!active) return
        setResult({
          key: requestKey,
          items: data?.items ?? [],
          total: data?.total ?? 0,
          error: null,
        })
      })
      .catch((error) => {
        if (!active) return
        setResult({ key: requestKey, items: [], total: 0, error })
      })

    return () => {
      active = false
    }
  }, [requestKey, tipo, idProducto, page, pageSize])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return {
    items: result.items,
    total: result.total,
    error: result.error,
    loading: result.key !== requestKey,
    reload,
  }
}
