import prisma from '../config/prisma.js'
import { NotFoundError, ConflictError } from '../middlewares/error.middleware.js'

const ITEM_INCLUDE = {
  ingredient: { select: { id: true, name: true, imageUrl: true } },
}

export async function getFridgeItems(userId) {
    return prisma.fridgeItem.findMany({
        where: { userId },
        include: ITEM_INCLUDE,
        orderBy: [
            // primero los que vencen antes
            { expiresAt: 'asc' },
            { addedAt: 'desc' },
        ],
    })
}

export async function addFridgeItem(userId, data) {
    try {
        return await prisma.fridgeItem.create({
            data: { ...data, userId },
            include: ITEM_INCLUDE,
        })
    } catch (err) {
        if (err.code === 'P2002') {
            throw new ConflictError('Ese ingrediente ya esta en tu heladera. Editalo para cambiar la cantidad.')
        }
        throw err
    }
}

export async function updateFridgeItem(itemId, userId, data) {
    await assertOwner(itemId, userId)
    return prisma.fridgeItem.update({
        where: { id: itemId },
        data,
        include: ITEM_INCLUDE,
    })
}

export async function deleteFridgeItem(itemId, userId) {
    await assertOwner(itemId, userId)
    await prisma.fridgeItem.delete({ where: { id: itemId } })
}

export async function searchIngredients(query) {
    return prisma.ingredient.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        take: 10,
        orderBy: { name: 'asc' },
    })
}

export async function createIngredient(name) {
    return prisma.ingredient.upsert({
        where: { name: name.trim() },
        update: {},
        create: { name: name.trim() },
    })
}

async function assertOwner(itemId, userId) {
    const item = await prisma.fridgeItem.findUnique({
        where: { id: itemId },
        select: { userId: true },
    })
    if (!item) throw new NotFoundError('Ítem no encontrado')
    if (item.userId !== userId) throw new NotFoundError('Ítem no encontrado')
}