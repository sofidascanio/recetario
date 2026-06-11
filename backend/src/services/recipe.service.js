import prisma from '../config/prisma.js'
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '../middlewares/error.middleware.js'
import * as notificationService from './notification.service.js'

export async function createRecipe(authorId, data) {
    const { ingredients, steps, ...recipeData } = data
    const recipe = await prisma.recipe.create({
        data: {
            ...recipeData,
            authorId,
            ingredients: { create: ingredients },
            steps: { create: steps },
        },
        include: recipeIncludes(),
    })
    return recipe
}

export async function listRecipes(filters, currentUserId) {
    const { page, limit, category, mealId, difficulty, search, authorId, tags, sortBy } = filters
    const skip = (page - 1) * limit

    // visibilidad
    let visibilityFilter
    if (!currentUserId) {
        visibilityFilter = { isPublic: true }
    } else if (authorId && authorId === currentUserId) {
        visibilityFilter = {}
    } else {
        visibilityFilter = { OR: [{ isPublic: true }, { authorId: currentUserId }] }
    }

    const conditions = []

    if (Object.keys(visibilityFilter).length > 0) {
        conditions.push(visibilityFilter)
    }

    if (search) {
        conditions.push({
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { has: search.toLowerCase() } },
            ],
        })
    }

    const where = conditions.length > 1
        ? { AND: conditions }
        : conditions[0] ?? {}

    if (category) where.meal = { category }
    if (mealId) where.mealId = mealId   // filtro por comida específica (Meal.id)
    if (difficulty) where.difficulty = difficulty
    if (authorId) where.authorId  = authorId
    if (tags) {
        const tagList = tags.split(',').map(t => t.trim().toLowerCase())
        where.tags = { hasSome: tagList }
    }

    const orderBy = {
        recent: { createdAt: 'desc' },
        popular: { savedBy:   { _count: 'desc' } },
        rating:{ ratings:   { _count: 'desc' } },
    }[sortBy]

    const [total, recipes] = await Promise.all([
        prisma.recipe.count({ where }),
        prisma.recipe.findMany({
            where, skip, take: limit, orderBy,
            include: recipeCardIncludes(currentUserId),
        }),
    ])

    return {
        data: recipes,
        pagination: {
            total, page, limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1,
        },
    }
}

export async function getRecipeById(recipeId, currentUserId) {
    const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
        include: recipeIncludes(currentUserId),
    })
    if (!recipe) throw new NotFoundError('Receta no encontrada')
    if (!recipe.isPublic && recipe.authorId !== currentUserId)
        throw new ForbiddenError('Esta receta es privada')

    const ratingData = await prisma.rating.aggregate({
        where: { recipeId },
        _avg: { score: true },
        _count:{ score: true },
    })
    return {
        ...recipe,
        averageRating: ratingData._avg.score
            ? Math.round(ratingData._avg.score * 10) / 10
            : null,
        ratingCount: ratingData._count.score,
    }
}

export async function updateRecipe(recipeId, authorId, data) {
    await assertAuthor(recipeId, authorId)
    const { ingredients, steps, ...recipeData } = data
    const recipe = await prisma.$transaction(async (tx) => {
        if (ingredients) await tx.recipeIngredient.deleteMany({ where: { recipeId } })
        if (steps) await tx.recipeStep.deleteMany({ where: { recipeId } })
        return tx.recipe.update({
            where: { id: recipeId },
            data: {
                ...recipeData,
                ...(ingredients && { ingredients: { create: ingredients } }),
                ...(steps && { steps: { create: steps } }),
            },
            include: recipeIncludes(),
        })
    })
    return recipe
}

export async function deleteRecipe(recipeId, authorId) {
    await assertAuthor(recipeId, authorId)
    await prisma.recipe.delete({ where: { id: recipeId } })
}

// toggle guardar/quitar, devuelve { saved: boolean }
export async function toggleSaveRecipe(recipeId, userId) {
    await assertRecipeExists(recipeId)
    const existing = await prisma.savedRecipe.findUnique({
        where: { userId_recipeId: { userId, recipeId } },
    })
    if (existing) {
        await prisma.savedRecipe.delete({ where: { userId_recipeId: { userId, recipeId } } })
        return { saved: false }
    }
    await prisma.savedRecipe.create({ data: { recipeId, userId } })
    const recipe = await prisma.recipe.findUnique({
        where:  { id: recipeId },
        select: { authorId: true, title: true },
    })
    notificationService.notifySave({
        recipeAuthorId: recipe.authorId,
        actorId: userId, recipeId, recipeTitle: recipe.title,
    }).catch(console.error)
    return { saved: true }
}

export async function saveRecipe(recipeId, userId) {
    await assertRecipeExists(recipeId)
    try {
        await prisma.savedRecipe.create({ data: { recipeId, userId } })
    } catch (err) {
        if (err.code === 'P2002') throw new ConflictError('Ya guardaste esta receta')
        throw err
    }
    const recipe = await prisma.recipe.findUnique({
        where:  { id: recipeId },
        select: { authorId: true, title: true },
    })
    notificationService.notifySave({
        recipeAuthorId: recipe.authorId,
        actorId: userId, recipeId, recipeTitle: recipe.title,
    }).catch(console.error)
}

export async function unsaveRecipe(recipeId, userId) {
    const saved = await prisma.savedRecipe.findUnique({
        where: { userId_recipeId: { userId, recipeId } },
    })
    if (!saved) throw new NotFoundError('No tenes esta receta guardada')
    await prisma.savedRecipe.delete({ where: { userId_recipeId: { userId, recipeId } } })
}

export async function rateRecipe(recipeId, userId, score) {
    await assertRecipeExists(recipeId)
    await prisma.rating.upsert({
        where: { userId_recipeId: { userId, recipeId } },
        update: { score },
        create: { recipeId, userId, score },
    })
    const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
        select: { authorId: true, title: true },
    })
    notificationService.notifyRating({
        recipeAuthorId: recipe.authorId,
        actorId: userId, recipeId, recipeTitle: recipe.title, score,
    }).catch(console.error)
    const agg = await prisma.rating.aggregate({
        where: { recipeId },
        _avg: { score: true },
        _count: { score: true },
    })
    return {
        averageRating: Math.round(agg._avg.score * 10) / 10,
        ratingCount: agg._count.score,
    }
}

export async function getFridgeMatch(userId) {
    const fridgeItems = await prisma.fridgeItem.findMany({
        where:  { userId },
        select: { ingredientId: true },
    })
    if (fridgeItems.length === 0) return { data: [], message: 'Tu heladera esta vacía' }
    const fridgeIngredientIds = fridgeItems.map(f => f.ingredientId)
    const recipes = await prisma.recipe.findMany({
        where: { isPublic: true },
        include: {
            ingredients: { select: { ingredientId: true } },
            author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            meal: { select: { id: true, name: true, category: true } },
            _count: { select: { savedBy: true, ratings: true } },
        },
    })
    const withMatch = recipes
        .map(recipe => {
            const total = recipe.ingredients.length
            if (total === 0) return null
            const matches = recipe.ingredients.filter(ri =>
                fridgeIngredientIds.includes(ri.ingredientId)
            ).length
            return { ...recipe, matchPercentage: Math.round((matches / total) * 100), matchCount: matches, totalIngredients: total }
        })
        .filter(Boolean)
        .filter(r => r.matchPercentage > 0)
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, 20)
    return { data: withMatch }
}

async function assertAuthor(recipeId, authorId) {
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId }, select: { authorId: true } })
    if (!recipe) throw new NotFoundError('Receta no encontrada')
    if (recipe.authorId !== authorId) throw new ForbiddenError('No tenes permiso para modificar esta receta')
}

async function assertRecipeExists(recipeId) {
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId }, select: { id: true } })
    if (!recipe) throw new NotFoundError('Receta no encontrada')
}

function recipeIncludes(currentUserId) {
    return {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        meal: { select: { id: true, name: true, category: true } },
        ingredients: { include: { ingredient: { select: { id: true, name: true, imageUrl: true } } }, orderBy: { order: 'asc' } },
        steps: { orderBy: { order: 'asc' } },
        _count: { select: { savedBy: true, ratings: true, comments: true } },
        ...(currentUserId && {
            savedBy: { where: { userId: currentUserId }, select: { userId: true } },
        }),
    }
}

function recipeCardIncludes(currentUserId) {
    return {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        meal: { select: { id: true, name: true, category: true } },
        _count: { select: { savedBy: true, ratings: true } },
        ...(currentUserId && {
            savedBy: { where: { userId: currentUserId }, select: { userId: true } },
        }),
    }
}