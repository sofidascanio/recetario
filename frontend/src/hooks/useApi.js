import { useState, useEffect, useCallback, useRef } from 'react'

// hook para queries (get), fetching automatico
export function useQuery(apiFn, deps = []) {
    const [data, setData]       = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState(null)

    // useRef para evitar setState en componente desmontado
    const mounted = useRef(true)
    useEffect(() => {
        mounted.current = true
        return () => { mounted.current = false }
    }, [])

    const fetch = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await apiFn()
            if (mounted.current) setData(result)
        } catch (err) {
            if (mounted.current) setError(err)
        } finally {
            if (mounted.current) setLoading(false)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)

    useEffect(() => { fetch() }, [fetch])

    return { data, loading, error, refetch: fetch }
}

// hook para mutaciones (post, patch, delete), ejecucion manual
export function useMutation(apiFn) {
    const [loading, setLoading] = useState(false)
    const [error, setError]     = useState(null)

    const mutate = useCallback(async (...args) => {
        setLoading(true)
        setError(null)
        try {
            const result = await apiFn(...args)
            return result
        } catch (err) {
            setError(err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [apiFn])

    return { mutate, loading, error }
}