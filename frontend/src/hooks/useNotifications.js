import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth.js'
import { notificationsService } from '../services/notifications.service.js'

export function useNotifications() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [connected, setConnected] = useState(false)
    const eventSourceRef = useRef(null)

    // carga notificaciones iniciales
    const loadNotifications = useCallback(async () => {
        if (!user) return
            setLoading(true)
        try {
            const data = await notificationsService.getAll()
            setNotifications(data.data)
            setUnreadCount(data.unreadCount)
        } catch (err) {
            console.error('Error cargando notificaciones:', err)
        } finally {
            setLoading(false)
        }
    }, [user])

    // conecta al stream sse
    useEffect(() => {
        if (!user) return

        loadNotifications()

        const token = localStorage.getItem('token')
        if (!token) return

        // EventSource no soporta headers customizados, asi que pasa el token como query param
        const url = `${import.meta.env.VITE_API_URL}/notifications/stream?token=${token}`

        const eventSource = new EventSource(url)
        eventSourceRef.current = eventSource

            eventSource.addEventListener('connected', (e) => {
            const data = JSON.parse(e.data)
            setUnreadCount(data.unreadCount)
            setConnected(true)
        })

        // nueva notificacion en tiempo real
        eventSource.addEventListener('notification', (e) => {
            const notification = JSON.parse(e.data)

            setNotifications(prev => [notification, ...prev])
            setUnreadCount(prev => prev + 1)

            // vibracion en movil si esta disponible
            navigator.vibrate?.(100)
        })

        eventSource.onerror = () => {
            setConnected(false)
            // EventSource reconecta automaticamente
        }

        return () => {
            eventSource.close()
            setConnected(false)
        }
    }, [user?.id])

    // EventSource con token en query param 
    // necesita actualizar el middleware de auth para soportarlo
    const markAsRead = useCallback(async (ids) => {
        await notificationsService.markAsRead(ids)
        setNotifications(prev =>
            prev.map(n =>
                !ids || ids.includes(n.id) ? { ...n, read: true } : n
            )
        )
        setUnreadCount(0)
    }, [])

    const markAllRead = useCallback(async () => {
        await notificationsService.markAllRead()
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
    }, [])

    const remove = useCallback(async (id) => {
        await notificationsService.delete(id)
        setNotifications(prev => prev.filter(n => n.id !== id))
        setUnreadCount(prev =>
            notifications.find(n => n.id === id && !n.read) ? prev - 1 : prev
        )
    }, [notifications])

    return {
        notifications,
        unreadCount,
        loading,
        connected,
        markAsRead,
        markAllRead,
        remove,
        reload: loadNotifications,
    }
}