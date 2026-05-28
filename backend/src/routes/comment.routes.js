import { Router } from 'express'
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js'
import * as commentController from '../controllers/comment.controller.js'
import { z } from 'zod'
import { validate } from '../middlewares/validate.middleware.js'

const commentSchema = z.object({
    content: z.string().min(1).max(1000).trim(),
})

const router = Router({ mergeParams: true }) // para acceder a :id del padre

router.get('/', optionalAuth, commentController.getComments)
router.post('/', authenticate, validate(commentSchema), commentController.addComment)
router.delete('/:commentId', authenticate, commentController.deleteComment)

export default router