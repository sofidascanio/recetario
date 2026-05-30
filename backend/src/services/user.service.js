import prisma from '../config/prisma.js'
import { NotFoundError } from '../middlewares/error.middleware.js'
import { extractPublicId, deleteImage } from './upload.service.js'

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

export async function updateProfile(userId, data) {
    const { displayName, bio, avatarUrl } = data

    // si hay nueva imagen de avatar, elimina la anterior en cloudinary
    if (avatarUrl) {
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { avatarUrl: true },
        })
        if (currentUser?.avatarUrl) {
            const oldPublicId = extractPublicId(currentUser.avatarUrl)
            await deleteImage(oldPublicId)
        }
    }

    return prisma.user.update({
        where: { id: userId },
        data: {
            ...(displayName && { displayName }),
            ...(bio !== undefined && { bio }),
            ...(avatarUrl && { avatarUrl }),
        },
        select: {
            id: true, email: true, username: true,
            displayName: true, avatarUrl: true, bio: true,
        },
    })
}