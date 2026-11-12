import { useCallback, useEffect, useState } from 'react'
import { fetchRecentMovements } from '../services/movementsService'

const INITIAL_STATE = {
  movements: [],
  loading: true,
  error: null,
}

export function useMovements(days = 30) {
  const [state, setState] = useState(INITIAL_STATE)

  useEffect(() => {
    let active = true

    fetchRecentMovements(days)
      .then((movements) => {
        if (active) setState({ movements, loading: false, error: null })
      })
      .catch((error) => {
        if (active) setState({ movements: [], loading: false, error })
      })

    return () => {
      active = false
    }
  }, [days])

  const reload = useCallback(() => {
    setState(INITIAL_STATE)

    fetchRecentMovements(days)
      .then((movements) => {
        setState({ movements, loading: false, error: null })
      })
      .catch((error) => {
        setState({ movements: [], loading: false, error })
      })
  }, [days])

  return { ...state, reload }
}
