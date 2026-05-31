import * as recService from '../services/recommendation.service.js'

export async function getPersonalizedFeed(req, res, next) {
    try {
        const limit = Math.min(Number(req.query.limit) || 12, 30)
        const data = await recService.getPersonalizedFeed(req.user.id, { limit })
        res.json(data)
    } catch (err) { next(err) }
}

export async function getFridgeMatch(req, res, next) {
    try {
        const limit = Math.min(Number(req.query.limit) || 10, 20)
        const data = await recService.getFridgeMatch(req.user.id, { limit })
        res.json(data)
    } catch (err) { next(err) }
}

export async function getSimilarRecipes(req, res, next) {
    try {
        const limit = Math.min(Number(req.query.limit) || 6, 12)
        const data = await recService.getSimilarRecipes(req.params.id, { limit })
        res.json(data)
    } catch (err) { next(err) }
}

export async function getTrending(req, res, next) {
    try {
        const days = Math.min(Number(req.query.days)  || 7,  30)
        const limit = Math.min(Number(req.query.limit) || 10, 20)
        const data = await recService.getTrending({ days, limit })
        res.json(data)
    } catch (err) { next(err) }
}