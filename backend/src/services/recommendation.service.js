import prisma from '../config/prisma.js'

// CAPA 1: obtener señales del usuario
async function getUserSignals(userId) {
    // ejecuta todas las queries en paralelo
    const [
        fridgeItems,
        ratings,
        savedRecipes,
        following,
    ] = await Promise.all([
            // ingredientes en la heladera
            prisma.fridgeItem.findMany({
            where: { userId },
            select: { ingredientId: true, expiresAt: true },
        }),

        // recetas puntuadas con 4 o 5 estrellas
        prisma.rating.findMany({
            where: { userId, score: { gte: 4 } },
            include: {
                recipe: {
                    select: {
                        mealId: true,
                        difficulty: true,
                        tags: true,
                        meal: { select: { category: true } },
                    },
                },
            },
        }),

        // recetas guardadas
        prisma.savedRecipe.findMany({
            where: { userId },
            include: {
                recipe: {
                    select: {
                        mealId: true,
                        tags: true,
                        meal: { select: { category: true } },
                    },
                },
            },
        }),

        // ids de usuarios que sigo
        prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        }),
    ])

    return { fridgeItems, ratings, savedRecipes, following }
}

// CAPA 2: contruye perfil de gustos del usuario
function buildTasteProfile(signals) {
    const { ratings, savedRecipes } = signals

    // categorias preferidas (con peso: rating > guardado)
    const categoryScore = {}
    const tagScore = {}
    const difficultyCount = {}

    // procesa ratings positivos (peso 2)
    ratings.forEach(r => {
        const cat = r.recipe.meal?.category
        if (cat) categoryScore[cat] = (categoryScore[cat] || 0) + 2

        r.recipe.tags?.forEach(tag => {
            tagScore[tag] = (tagScore[tag] || 0) + 2
        })

        const diff = r.recipe.difficulty
        difficultyCount[diff] = (difficultyCount[diff] || 0) + 1
    })

    // procesa guardados (peso 1)
    savedRecipes.forEach(s => {
        const cat = s.recipe.meal?.category
        if (cat) categoryScore[cat] = (categoryScore[cat] || 0) + 1

        s.recipe.tags?.forEach(tag => {
            tagScore[tag] = (tagScore[tag] || 0) + 1
        })
    })

    // dificultad favorita
    const preferredDifficulty = Object.entries(difficultyCount)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || null

    // ids de recetas ya vistas (para excluirlas de recomendaciones)
    const seenRecipeIds = [
        ...ratings.map(r => r.recipeId),
        ...savedRecipes.map(s => s.recipeId),
    ]

    return {
        categoryScore,
        tagScore,
        preferredDifficulty,
        seenRecipeIds,
    }
}

// CAPA 3: funciones de scoring individuales
// calcula que porcentaje de ingredientes de la receta tengo en la heladera
function calculateIngredientMatch(recipe, fridgeIngredientIds) {
    if (!recipe.ingredients || recipe.ingredients.length === 0) return 0

    const matches = recipe.ingredients.filter(ri =>
        fridgeIngredientIds.includes(ri.ingredientId)
    ).length

    const percentage = matches / recipe.ingredients.length

    // bonificacion extra si la heladera cubre el 100%
    if (percentage === 1) return 1.2  // bonus por match perfecto
    return percentage
}

// calcula que tan alineada esta la receta con los gustos del usuario
function calculateTasteMatch(recipe, tasteProfile) {
    let score = 0
    const { categoryScore, tagScore } = tasteProfile

    // puntos por categoría
    const cat = recipe.meal?.category
    if (cat && categoryScore[cat]) {
        score += Math.min(categoryScore[cat] / 10, 1)  // normaliza a 0-1
    }

    // puntos por tags en comun
    const matchingTags = recipe.tags?.filter(t => tagScore[t]) || []
    if (matchingTags.length > 0) {
        const tagPoints = matchingTags.reduce((sum, t) => sum + (tagScore[t] || 0), 0)
        score += Math.min(tagPoints / 10, 1)
    }

    // puntos si la dificultad coincide con la preferida
    if (tasteProfile.preferredDifficulty === recipe.difficulty) {
        score += 0.3
    }

    return Math.min(score, 1)  // max 1
}

// calcula que tan popular es la receta entre usuarios que sigo
function calculateSocialScore(recipe, followingIds) {
    if (!recipe.savedBy || followingIds.length === 0) return 0

    const savedByFollowing = recipe.savedBy.filter(s =>
        followingIds.includes(s.userId)
    ).length

    // normaliza: 3+ personas que sigo guardaron esta receta = score maximo
    return Math.min(savedByFollowing / 3, 1)
}

// que tan reciente es la receta (decae con el tiempo)
function calculateFreshnessScore(createdAt) {
    const ageInDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)

    // recetas de los ultimos 7 días tienen score completo
    // decae linealmente hasta 0 a los 90 dias
    if (ageInDays <= 7)  return 1
    if (ageInDays >= 90) return 0
    return 1 - (ageInDays - 7) / (90 - 7)
}

// popularidad general (ratings y guardados)
function calculatePopularityScore(recipe) {
    const savedCount  = recipe._count?.savedBy  || 0
    const ratingCount = recipe._count?.ratings  || 0

    // normaliza: 50 guardados o 20 ratings = score maximo
    const savedScore  = Math.min(savedCount  / 50, 1)
    const ratingScore = Math.min(ratingCount / 20, 1)

    return (savedScore + ratingScore) / 2
}

// CAPA 4: score compuesto final
const WEIGHTS = {
    ingredientMatch: 0.40,
    tasteMatch: 0.25,
    socialScore: 0.20,
    freshnessScore: 0.10,
    popularityScore: 0.05,
}

function calculateFinalScore(recipe, signals, tasteProfile, followingIds) {
    const fridgeIngredientIds = signals.fridgeItems.map(f => f.ingredientId)

    const scores = {
        ingredientMatch: calculateIngredientMatch(recipe, fridgeIngredientIds),
        tasteMatch: calculateTasteMatch(recipe, tasteProfile),
        socialScore: calculateSocialScore(recipe, followingIds),
        freshnessScore: calculateFreshnessScore(recipe.createdAt),
        popularityScore: calculatePopularityScore(recipe),
    }

    const finalScore = Object.entries(WEIGHTS).reduce(
        (total, [key, weight]) => total + scores[key] * weight, 0
    )

    return { finalScore, scores }
}

// CAPA 5: endpoints publicos
// feed principal con recomendaciones personalizadas
export async function getPersonalizedFeed(userId, { limit = 12 } = {}) {
    const signals = await getUserSignals(userId)
    const tasteProfile = buildTasteProfile(signals)
    const followingIds = signals.following.map(f => f.followingId)

    // candidatos: recetas publicas que el usuario no vio
    const candidates = await prisma.recipe.findMany({
        where: {
            isPublic:  true,
            authorId:  { not: userId },  // excluye propias
            id:        { notIn: tasteProfile.seenRecipeIds },
        },
        include: {
            author: {
                select: { id: true, username: true, displayName: true, avatarUrl: true },
            },
            meal: { select: { id: true, name: true, category: true } },
            ingredients: { select: { ingredientId: true } },
            savedBy: {
                where: { userId: { in: followingIds.length > 0 ? followingIds : ['__none__'] } },
                select: { userId: true },
            },
            _count: { select: { savedBy: true, ratings: true, comments: true } },
        },
        // trae mas candidatos de los necesarios para poder rankear
        take: limit * 5,
        orderBy: { createdAt: 'desc' },
    })

    // calcula score para cada candidato y rankear
    const ranked = candidates
        .map(recipe => {
            const { finalScore, scores } = calculateFinalScore(
                recipe, signals, tasteProfile, followingIds
            )
            return { ...recipe, _score: finalScore, _scores: scores }
        })
        .sort((a, b) => b._score - a._score)
        .slice(0, limit)

    return {
        data: ranked,
        meta: {
            basedOn: {
                fridgeItems:  signals.fridgeItems.length,
                ratings:      signals.ratings.length,
                savedRecipes: signals.savedRecipes.length,
                following:    signals.following.length,
            },
        },
    }
}

// Solo fridge match — más rápido, sin scoring complejo
export async function getFridgeMatch(userId, { limit = 10 } = {}) {
    const fridgeItems = await prisma.fridgeItem.findMany({
        where: { userId },
        select: { ingredientId: true, expiresAt: true },
    })

    if (fridgeItems.length === 0) {
        return { data: [], message: 'Tu heladera está vacía' }
    }

    const fridgeIngredientIds = fridgeItems.map(f => f.ingredientId)

    // prioriza ingredientes proximos a vencer
    const expiringIds = fridgeItems
        .filter(f => {
            if (!f.expiresAt) return false
            const daysLeft = (new Date(f.expiresAt) - Date.now()) / (1000 * 60 * 60 * 24)
            return daysLeft >= 0 && daysLeft <= 3
        })
        .map(f => f.ingredientId)

    const candidates = await prisma.recipe.findMany({
        where: {
            isPublic: true,
            // al menos un ingrediente de la receta esta en la heladera
            ingredients: {
                some: { ingredientId: { in: fridgeIngredientIds } },
            },
        },
        include: {
            author: {
                select: { id: true, username: true, displayName: true, avatarUrl: true },
            },
            meal: { select: { id: true, name: true, category: true } },
            ingredients: {
                include: { ingredient: { select: { id: true, name: true } } },
            },
            _count: { select: { savedBy: true, ratings: true } },
        },
        take: 100,
    })

    const withScore = candidates
        .map(recipe => {
            const total   = recipe.ingredients.length
            if (total === 0) return null

            const matched = recipe.ingredients.filter(ri =>
                fridgeIngredientIds.includes(ri.ingredientId)
            )

            const missing = recipe.ingredients.filter(ri =>
                !fridgeIngredientIds.includes(ri.ingredientId)
            )

            const matchPercentage = Math.round((matched.length / total) * 100)

            // bonus si usa ingredientes que vencen pronto
            const usesExpiring = matched.some(ri =>
                expiringIds.includes(ri.ingredientId)
            )

            return {
                ...recipe,
                matchPercentage,
                matchCount: matched.length,
                totalIngredients: total,
                missingIngredients: missing.map(ri => ri.ingredient.name),
                usesExpiring,
                // score: match % + bonus por ingredientes a vencer
                _score: matchPercentage + (usesExpiring ? 20 : 0),
            }
        })
        .filter(Boolean)
        .filter(r => r.matchPercentage > 0)
        .sort((a, b) => b._score - a._score)
        .slice(0, limit)

    return {
        data: withScore,
        meta: {
            fridgeIngredients: fridgeIngredientIds.length,
            expiringIngredients: expiringIds.length,
        },
    }
}

// recetas similares a una dada
export async function getSimilarRecipes(recipeId, { limit = 6 } = {}) {
    const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
        include: {
            ingredients: { select: { ingredientId: true } },
            meal: { select: { category: true } },
        },
    })

    if (!recipe) return { data: [] }

    const ingredientIds = recipe.ingredients.map(ri => ri.ingredientId)

    // busca recetas que comparten ingredientes o categoría
    const candidates = await prisma.recipe.findMany({
        where: {
            id: { not: recipeId },
            isPublic: true,
            OR: [
                { meal: { category: recipe.meal.category } },
                { ingredients: { some: { ingredientId: { in: ingredientIds } } } },
                { tags: { hasSome: recipe.tags } },
            ],
        },
        include: {
            author: {
                select: { id: true, username: true, displayName: true, avatarUrl: true },
            },
            meal: { select: { id: true, name: true, category: true } },
            ingredients: { select: { ingredientId: true } },
            _count: { select: { savedBy: true, ratings: true } },
        },
        take: 50,
    })

    const withSimilarity = candidates
        .map(candidate => {
            let similarityScore = 0

            // misma categoria
            if (candidate.meal?.category === recipe.meal?.category) {
                similarityScore += 0.4
            }

            // ingredientes en comun
            const candidateIds  = candidate.ingredients.map(ri => ri.ingredientId)
            const commonIngredients = ingredientIds.filter(id => candidateIds.includes(id))
            const ingredientSimilarity = ingredientIds.length > 0
                ? commonIngredients.length / ingredientIds.length
                : 0
            similarityScore += ingredientSimilarity * 0.4

            // tags en comun
            const commonTags = recipe.tags.filter(t => candidate.tags.includes(t))
            const tagSimilarity = recipe.tags.length > 0
                ? commonTags.length / recipe.tags.length
                : 0
            similarityScore += tagSimilarity * 0.2

            return { ...candidate, _similarity: similarityScore }
        })
        .sort((a, b) => b._similarity - a._similarity)
        .slice(0, limit)

    return { data: withSimilarity }
}

// recetas trending, populares en los ultimos 'N' dias
export async function getTrending({ days = 7, limit = 10 } = {}) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // recetas con mas actividad reciente
    const [recentlySaved, recentlyRated] = await Promise.all([
        prisma.savedRecipe.groupBy({
            by: ['recipeId'],
            where: { savedAt: { gte: since } },
            _count: { recipeId: true },
            orderBy: { _count: { recipeId: 'desc' } },
            take: limit * 2,
        }),
        prisma.rating.groupBy({
            by: ['recipeId'],
            where: { createdAt: { gte: since } },
            _avg: { score: true },
            _count: { recipeId: true },
            orderBy: { _count: { recipeId: 'desc' } },
            take: limit * 2,
        }),
    ])

    // combina señales de guardados y ratings
    const scoreMap = {}

    recentlySaved.forEach(item => {
        scoreMap[item.recipeId] = (scoreMap[item.recipeId] || 0)
        + item._count.recipeId * 2
    })

    recentlyRated.forEach(item => {
        const ratingBonus = (item._avg.score || 3) * item._count.recipeId
        scoreMap[item.recipeId] = (scoreMap[item.recipeId] || 0) + ratingBonus
    })

    const topIds = Object.entries(scoreMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([id]) => id)

    if (topIds.length === 0) {
        // fallback: recetas mas recientes si no hay actividad
        return prisma.recipe.findMany({
            where: { isPublic: true },
            include: RECIPE_CARD_INCLUDE,
            orderBy: { createdAt: 'desc' },
            take: limit,
        }).then(data => ({ data, meta: { period: `${days} días`, source: 'fallback' } }))
    }

    const recipes = await prisma.recipe.findMany({
        where: { id: { in: topIds }, isPublic: true },
        include: RECIPE_CARD_INCLUDE,
    })

    // mantiene el orden de topIds
    const ordered = topIds
        .map(id => recipes.find(r => r.id === id))
        .filter(Boolean)

    return {
        data: ordered,
        meta: { period: `${days} días`, source: 'activity' },
    }
}

// helpers compartidos
const RECIPE_CARD_INCLUDE = {
    author: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
    },
    meal: { select: { id: true, name: true, category: true } },
    _count: { select: { savedBy: true, ratings: true, comments: true } },
}