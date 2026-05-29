import * as followService from '../services/follow.service.js'

export async function follow(req, res, next) {
    try {
        await followService.followUser(req.user.id, req.params.username)
        res.status(201).json({ message: 'Ahora seguis a este usuario' })
    } catch (err) { next(err) }
}

export async function unfollow(req, res, next) {
    try {
        await followService.unfollowUser(req.user.id, req.params.username)
        res.status(204).send()
    } catch (err) { next(err) }
}

export async function getStatus(req, res, next) {
    try {
        const status = await followService.getFollowStatus(req.user.id, req.params.username)
        res.json(status)
    } catch (err) { next(err) }
}

export async function getFollowers(req, res, next) {
    try {
        const followers = await followService.getFollowers(req.params.username)
        res.json(followers.map(f => f.follower))
    } catch (err) { next(err) }
}

export async function getFollowing(req, res, next) {
    try {
        const following = await followService.getFollowing(req.params.username)
        res.json(following.map(f => f.following))
    } catch (err) { next(err) }
}

export async function getFeed(req, res, next) {
    try {
        const page  = Number(req.query.page)  || 1
        const limit = Number(req.query.limit) || 12
        const feed  = await followService.getFeed(req.user.id, { page, limit })
        res.json(feed)
    } catch (err) { next(err) }
}