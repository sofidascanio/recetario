import prisma from '../config/prisma.js'
import { NotFoundError, ForbiddenError } from '../middlewares/error.middleware.js'

export async function getComments(recipeId) {
    return prisma.comment.findMany({
        where: { recipeId },
            include: {
            author: {
                select: { id: true, username: true, displayName: true, avatarUrl: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    })
}

export async function addComment(recipeId, authorId, content) {
    await assertRecipeExists(recipeId)
    return prisma.comment.create({
        data: { recipeId, authorId, content },
        include: {
            author: {
                select: { id: true, username: true, displayName: true, avatarUrl: true },
            },
        },
    })
}

export async function deleteComment(commentId, userId) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } })
    if (!comment) throw new NotFoundError('Comentario no encontrado')
    if (comment.authorId !== userId) throw new ForbiddenError('Sin permiso')
    await prisma.comment.delete({ where: { id: commentId } })
}

async function assertRecipeExists(recipeId) {
    const r = await prisma.recipe.findUnique({ where: { id: recipeId }, select: { id: true } })
    if (!r) throw new NotFoundError('Receta no encontrada')
}