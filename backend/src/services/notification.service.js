import prisma from '../config/prisma.js'
import { sse } from '../config/sse.js'

// crea y emite una notificacion
export async function createNotification({
        userId, // destinatario
        actorId, // quien la genera
        type,
        recipeId,
        commentId,
        data,
    }) {
    // No notificar acciones propias
    if (userId === actorId) return null

    const notification = await prisma.notification.create({
        data: {
            userId,
            actorId,
            type,
            recipeId: recipeId  || null,
            commentId: commentId || null,
            data: data || {},
        },
        include: {
            actor: {
                select: { id: true, username: true, displayName: true, avatarUrl: true },
            },
            recipe: { select: { id: true, title: true } },
        },
    })

    // emite en tiempo real si el usuario esta conectado
    sse.emit(userId, 'notification', formatNotification(notification))

    return notification
}

// helpers para crear tipos especificos de notificacion
// se llaman desde los services
export async function notifyComment({ recipeAuthorId, actorId, recipeId, recipeTitle, commentPreview }) {
    return createNotification({
        userId: recipeAuthorId,
        actorId,
        type:'COMMENT',
        recipeId,
        data: { recipeTitle, commentPreview: commentPreview.slice(0, 100) },
    })
}

export async function notifyFollow({ targetUserId, actorId, actorName }) {
    return createNotification({
        userId: targetUserId,
        actorId,
        type: 'FOLLOW',
        data: { actorName },
    })
}

export async function notifySave({ recipeAuthorId, actorId, recipeId, recipeTitle }) {
    return createNotification({
        userId:  recipeAuthorId,
        actorId,
        type: 'SAVE',
        recipeId,
        data: { recipeTitle },
    })
}

export async function notifyRating({ recipeAuthorId, actorId, recipeId, recipeTitle, score }) {
    return createNotification({
        userId:  recipeAuthorId,
        actorId,
        type: 'RATING',
        recipeId,
        data: { recipeTitle, score },
    })
}

export async function notifySystem({ userId, message, link }) {
    return createNotification({
        userId,
        actorId:  null,
        type: 'SYSTEM',
        data: { message, link },
    })
}

// queries
export async function getNotifications(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit

    const [total, notifications, unreadCount] = await Promise.all([
        prisma.notification.count({ where: { userId } }),
        prisma.notification.findMany({
            where:   { userId },
            include: {
                actor:  { select: { id: true, username: true, displayName: true, avatarUrl: true } },
                recipe: { select: { id: true, title: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.notification.count({ where: { userId, read: false } }),
    ])

    return {
        data: notifications.map(formatNotification),
        pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        },
        unreadCount,
    }
}

export async function markAsRead(userId, notificationIds) {
    // si no se pasan ids especificos, marca todas
    const where = notificationIds?.length
        ? { userId, id: { in: notificationIds } }
        : { userId, read: false }

    const { count } = await prisma.notification.updateMany({
        where,
        data: { read: true },
    })

    return { updated: count }
}

export async function getUnreadCount(userId) {
    const count = await prisma.notification.count({
        where: { userId, read: false },
    })
    return { count }
}

export async function deleteNotification(userId, notificationId) {
    // verifica que la notificacion pertenece al usuario
    await prisma.notification.deleteMany({
        where: { id: notificationId, userId },
    })
}

// formatear notificacion para el cliente
export function formatNotification(n) {
    return {
        id:        n.id,
        type:      n.type,
        read:      n.read,
        createdAt: n.createdAt,
        actor:     n.actor,
        recipe:    n.recipe,
        data:      n.data,
        // mensaje pre-formateado
        message:   buildMessage(n),
        // link de accion
        link:      buildLink(n),
    }
}

function buildMessage(n) {
    const actorName = n.actor?.displayName || 'Alguien'
    const data      = n.data || {}

    switch (n.type) {
        case 'COMMENT':
            return `${actorName} comentó tu receta "${data.recipeTitle}"`
        case 'FOLLOW':
            return `${actorName} empezó a seguirte`
        case 'SAVE':
            return `${actorName} guardó tu receta "${data.recipeTitle}"`
        case 'RATING':
            return `${actorName} puntuó tu receta "${data.recipeTitle}" con ${data.score} ★`
        case 'SYSTEM':
            return data.message || 'Notificación del sistema'
        default:
            return 'Nueva notificación'
    }
}

function buildLink(n) {
  switch (n.type) {
        case 'COMMENT':
        case 'SAVE':
        case 'RATING':
            return n.recipe?.id ? `/recipes/${n.recipe.id}` : null
        case 'FOLLOW':
            return n.actor?.username ? `/profile/${n.actor.username}` : null
        case 'SYSTEM':
            return n.data?.link || null
        default:
            return null
    }
}