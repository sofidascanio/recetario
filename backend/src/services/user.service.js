import prisma from '../config/prisma.js'
import { NotFoundError } from '../middlewares/error.middleware.js'

export async function getUserByUsername(username) {
    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true, username: true, displayName: true,
            avatarUrl: true, bio: true, isVerified: true, createdAt: true,
            _count: { select: { recipes: true, followers: true, following: true } },
        },
    })
    if (!user) throw new NotFoundError('Usuario no encontrado')
    return user
}

export async function getUserRecipes(username, currentUserId) {
    const user = await prisma.user.findUnique({
        where: { username }, select: { id: true },
    })
    if (!user) throw new NotFoundError('Usuario no encontrado')

    const isOwn = user.id === currentUserId

    return prisma.recipe.findMany({
        where: {
            authorId: user.id,
            ...(!isOwn && { isPublic: true }),
        },
        include: {
            meal: { select: { id: true, name: true, category: true } },
            _count: { select: { savedBy: true, ratings: true } },
        },
        orderBy: { createdAt: 'desc' },
    })
}