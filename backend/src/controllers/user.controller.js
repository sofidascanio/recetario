import * as userService from '../services/user.service.js'
import { validate } from '../middlewares/validate.middleware.js'
import { ForbiddenError } from '../middlewares/error.middleware.js'
import { z } from 'zod'

export async function getProfile(req, res, next) {
    try {
        const user = await userService.getUserByUsername(req.params.username)
        res.json(user)
    } catch (err) { next(err) }
}

export async function getUserRecipes(req, res, next) {
    try {
        const recipes = await userService.getUserRecipes(req.params.username, req.user?.id)
        res.json({ data: recipes })
    } catch (err) { next(err) }
}

export async function updateProfile(req, res, next) {
    try {
        const user = await userService.updateProfile(req.user.id, req.body)
        res.json(user)
    } catch (err) { next(err) }
}

export async function getSavedRecipes(req, res, next) {
  try {
    const page  = Number(req.query.page)  || 1
    const limit = Number(req.query.limit) || 12

    // el parametro :username tiene que coincidir con el usuario autenticado
    const target = await userService.getUserByUsername(req.params.username)
    if (target.id !== req.user.id) {
        throw new ForbiddenError('Solo podés ver tus propias recetas guardadas')
    }

    const result = await userService.getSavedRecipes(req.user.id, { page, limit })
    res.json(result)
  } catch (err) { next(err) }
}