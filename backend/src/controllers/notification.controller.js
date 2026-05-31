import * as notificationService from '../services/notification.service.js'
import { sse } from '../config/sse.js'

// stream sse, se mantiene abierto
export function stream(req, res) {
    const userId = req.user.id

    // headers necesarios para sse
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')  // desactiva buffering en Nginx
    res.flushHeaders()

    // registra la conexion
    sse.addConnection(userId, res)

    // evento inicial, confirma conexion y envia unread count
    notificationService.getUnreadCount(userId).then(({ count }) => {
        res.write(`event: connected\ndata: ${JSON.stringify({ unreadCount: count })}\n\n`)
    })

    // heartbeat cada 30s para mantener la conexion viva
    // (los proxies suelen cerrar conexiones inactivas)
    const heartbeat = setInterval(() => {
        try {
            res.write(': heartbeat\n\n')
        } catch {
            clearInterval(heartbeat)
        }
    }, 30_000)

    // limpia cuando el cliente se desconecta
    req.on('close', () => {
        clearInterval(heartbeat)
        sse.removeConnection(userId, res)
    })
}

export async function getNotifications(req, res, next) {
    try {
        const page = Number(req.query.page)  || 1
        const limit = Number(req.query.limit) || 20
        const data = await notificationService.getNotifications(req.user.id, { page, limit })
        res.json(data)
    } catch (err) { next(err) }
}

export async function markAsRead(req, res, next) {
    try {
        // body puede venir vacio (marca todas) o con ids especificos
        const ids = req.body?.ids || []
        const result = await notificationService.markAsRead(req.user.id, ids)
        res.json(result)
    } catch (err) { next(err) }
}

export async function getUnreadCount(req, res, next) {
    try {
        const data = await notificationService.getUnreadCount(req.user.id)
        res.json(data)
    } catch (err) { next(err) }
}

export async function deleteNotification(req, res, next) {
    try {
        await notificationService.deleteNotification(req.user.id, req.params.id)
        res.status(204).send()
    } catch (err) { next(err) }
}