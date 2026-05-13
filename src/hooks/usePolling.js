import { useState, useEffect, useRef, useCallback } from 'react'

export function usePolling(fetchFn, interval = 2000, deps = []) {
  const [data, setData]     = useState(null)
  const [error, setError]   = useState(null)
  const [loading, setLoading] = useState(true)
  const timerRef            = useRef(null)
  const mountedRef          = useRef(true)

  const fetch = useCallback(async () => {
    try {
      const result = await fetchFn()
      if (mountedRef.current) { setData(result); setError(null) }
    } catch (e) {
      if (mountedRef.current) setError(e)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, deps)

  useEffect(() => {
    mountedRef.current = true
    fetch()
    timerRef.current = setInterval(fetch, interval)
    return () => {
      mountedRef.current = false
      clearInterval(timerRef.current)
    }
  }, [fetch, interval])

  return { data, error, loading, refetch: fetch }
}