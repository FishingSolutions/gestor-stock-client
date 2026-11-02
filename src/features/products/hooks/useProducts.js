import { useCallback, useEffect, useState } from 'react'
import { fetchProducts } from '../services/productsService'

const INITIAL_STATE = {
  products: [],
  loading: true,
  error: null,
}

export function useProducts() {
  const [state, setState] = useState(INITIAL_STATE)

  useEffect(() => {
    let active = true

    fetchProducts()
      .then((products) => {
        if (active) setState({ products, loading: false, error: null })
      })
      .catch((error) => {
        if (active) setState({ products: [], loading: false, error })
      })

    return () => {
      active = false
    }
  }, [])

  const reload = useCallback(() => {
    setState(INITIAL_STATE)

    fetchProducts()
      .then((products) => {
        setState({ products, loading: false, error: null })
      })
      .catch((error) => {
        setState({ products: [], loading: false, error })
      })
  }, [])

  return { ...state, reload }
}
