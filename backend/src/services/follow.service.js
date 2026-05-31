import prisma from '../config/prisma.js'
import { NotFoundError, ConflictError, AppError, } from '../middlewares/error.middleware.js'
import * as notificationService from './notification.service.js'

export async function followUser(followerId, targetUsername) {
    const target = await prisma.user.findUnique({
        where: { username: targetUsername },
        select: { id: true, displayName: true },
    })

    if (!target) throw new NotFoundError('Usuario no encontrado')
    if (target.id === followerId) throw new AppError('No podes seguirte a vos mismo', 400)

    try {
        await prisma.follow.create({
            data: { followerId, followingId: target.id },
        })
    } catch (err) {
        if (err.code === 'P2002') throw new ConflictError('Ya seguís a este usuario')
        throw err
    }

    // info del follower para la notificacion
    const follower = await prisma.user.findUnique({
        where: { id: followerId },
        select: { displayName: true },
    })

    notificationService.notifyFollow({
        targetUserId: target.id,
        actorId: followerId,
        actorName: follower.displayName,
    }).catch(console.error)
}


export async function unfollowUser(followerId, targetUsername) {
    const target = await prisma.user.findUnique({
        where: { username: targetUsername },
        select: { id: true },
    })

    if (!target) throw new NotFoundError('Usuario no encontrado')

    const follow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId: target.id,
            },
        },
    })

    if (!follow) throw new NotFoundError('No seguis a este usuario')

    await prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId,
                followingId: target.id,
            },
        },
    })
}

export async function getFollowStatus(followerId, targetUsername) {
    const target = await prisma.user.findUnique({
        where: { username: targetUsername },
        select: { id: true },
    })

    if (!target) throw new NotFoundError('Usuario no encontrado')

    const follow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId: target.id,
            },
        },
    })

    return { isFollowing: !!follow }
}

export async function getFollowers(username) {
    const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
    })
    if (!user) throw new NotFoundError('Usuario no encontrado')

    return prisma.follow.findMany({
        where: { followingId: user.id },
        include: {
            follower: {
                select: {
                    id: true, username: true,
                    displayName: true, avatarUrl: true,
                    _count: { select: { recipes: true } },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })
}

export async function getFollowing(username) {
    const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
    })
    if (!user) throw new NotFoundError('Usuario no encontrado')

    return prisma.follow.findMany({
        where: { followerId: user.id },
        include: {
            following: {
                select: {
                    id: true, username: true,
                    displayName: true, avatarUrl: true,
                    _count: { select: { recipes: true } },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })
}

// feed: recetas de usuarios que sigo
export async function getFeed(userId, { page = 1, limit = 12 } = {}) {
    const skip = (page - 1) * limit

    // ids de usuarios que sigo
    const following = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
    })

    if (following.length === 0) {
        return {
        data: [],
            pagination: { total: 0, page, limit, totalPages: 0, hasNext: false, hasPrev: false },
            message: 'Segui a otros usuarios para ver su contenido en el feed',
        }
    }

    const followingIds = following.map(f => f.followingId)

    const where = {
        authorId: { in: followingIds },
        isPublic: true,
    }

    const [total, recipes] = await Promise.all([
        prisma.recipe.count({ where }),
        prisma.recipe.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: {
                        id: true, username: true,
                        displayName: true, avatarUrl: true,
                    },
                },
                meal: { select: { id: true, name: true, category: true } },
                _count: { select: { savedBy: true, ratings: true, comments: true } },
                savedBy: {
                    where: { userId },
                    select: { userId: true },
                },
            },
        }),
    ])

    return {
        data: recipes,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1,
        },
    }
}