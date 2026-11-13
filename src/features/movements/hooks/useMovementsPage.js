import { useCallback, useEffect, useState } from 'react'
import {
  fetchMovementStats,
  fetchMovementsPage,
} from '../services/movementsService'

/**
 * Listado paginado para la pantalla de movimientos.
 * Búsqueda con debounce y loading derivado de la clave de request.
 */
export function useMovementsPage({
  tipo = 'all',
  search = '',
  days = 30,
  month = null,
  page = 1,
  pageSize = 10,
} = {}) {
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const [state, setState] = useState({ key: null, items: [], total: 0, error: null })
  const [reloadKey, setReloadKey] = useState(0)

  const key = `${tipo}|${debouncedSearch}|${days}|${month}|${page}|${pageSize}|${reloadKey}`

  useEffect(() => {
    let active = true

    fetchMovementsPage({
      tipo,
      search: debouncedSearch,
      days,
      month,
      limit: pageSize,
      page,
    })
      .then((data) => {
        if (active) setState({ key, items: data.items, total: data.total, error: null })
      })
      .catch((error) => {
        if (active) setState({ key, items: [], total: 0, error })
      })

    return () => {
      active = false
    }
  }, [key, tipo, debouncedSearch, days, month, page, pageSize])

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  return {
    items: state.items,
    total: state.total,
    error: state.error,
    loading: state.key !== key,
    reload,
  }
}

/** Totales del período o mes, para los KPIs. */
export function useMovementStats({ days = 30, month = null } = {}) {
  const [state, setState] = useState({ key: null, stats: null, error: null })

  useEffect(() => {
    let active = true

    fetchMovementStats({ days, month })
      .then((stats) => {
        if (active) setState({ key: `${days}|${month}`, stats, error: null })
      })
      .catch((error) => {
        if (active) setState({ key: `${days}|${month}`, stats: null, error })
      })

    return () => {
      active = false
    }
  }, [days, month])

  return {
    stats: state.stats,
    error: state.error,
    loading: state.key !== `${days}|${month}`,
  }
}
