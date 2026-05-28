import * as fridgeService from '../services/fridge.service.js'

export async function getFridge(req, res, next) {
    try {
        const items = await fridgeService.getFridgeItems(req.user.id)
        res.json(items)
    } catch (err) { next(err) }
}

export async function addItem(req, res, next) {
    try {
        const item = await fridgeService.addFridgeItem(req.user.id, req.body)
        res.status(201).json(item)
    } catch (err) { next(err) }
}

export async function updateItem(req, res, next) {
    try {
        const item = await fridgeService.updateFridgeItem(
        req.params.itemId, req.user.id, req.body
        )
        res.json(item)
    } catch (err) { next(err) }
}

export async function deleteItem(req, res, next) {
    try {
        await fridgeService.deleteFridgeItem(req.params.itemId, req.user.id)
        res.status(204).send()
    } catch (err) { next(err) }
}

export async function searchIngredients(req, res, next) {
    try {
        const results = await fridgeService.searchIngredients(req.query.q || '')
        res.json(results)
    } catch (err) { next(err) }
}

export async function createIngredient(req, res, next) {
    try {
        const ingredient = await fridgeService.createIngredient(req.body.name)
        res.status(201).json(ingredient)
    } catch (err) { next(err) }
}