import { createContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser]       = useState(null)
    const [loading, setLoading] = useState(true)

    // al montar, verifica si hay un token guardado
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            setLoading(false)
            return
        }
        api.get('/auth/me')
            .then(data => setUser(data))
            .catch(() => localStorage.removeItem('token'))
            .finally(() => setLoading(false))
    }, [])

    const login = useCallback(async (username, password) => {
        const data = await api.post('/auth/login', { username, password })
        localStorage.setItem('token', data.token)
        setUser(data.user)
        return data.user
    }, [])

    const register = useCallback(async (formData) => {
        const data = await api.post('/auth/register', formData)
        localStorage.setItem('token', data.token)
        setUser(data.user)
        return data.user
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('token')
        setUser(null)
    }, [])

    // refresca usuario y actualiza el contexto
    // para despues del editProfile, el header/avatar reflejen cambios sin recargar la pagina
    const refreshUser = useCallback(async () => {
        try {
            const data = await api.get('/auth/me')
            setUser(data)
            return data
        } catch {
            // token expirado u otro error, logout limpio
            localStorage.removeItem('token')
            setUser(null)
        }
    }, [])

    const value = { user, loading, login, register, logout, refreshUser }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}