import * as userService from '../services/user.service.js'

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