import * as commentService from '../services/comment.service.js'

export async function getComments(req, res, next) {
    try {
        const comments = await commentService.getComments(req.params.id)
        res.json(comments)
    } catch (err) { next(err) }
}

export async function addComment(req, res, next) {
    try {
        const comment = await commentService.addComment(
            req.params.id, req.user.id, req.body.content
        )
        res.status(201).json(comment)
    } catch (err) { next(err) }
}

export async function deleteComment(req, res, next) {
    try {
        await commentService.deleteComment(req.params.commentId, req.user.id)
        res.status(204).send()
    } catch (err) { next(err) }
}