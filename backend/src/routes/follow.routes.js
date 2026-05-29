import { Router } from 'express'
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js'
import * as followController from '../controllers/follow.controller.js'

const router = Router()

// feed personal
router.get('/feed', authenticate, followController.getFeed)

// seguir / dejar de seguir
router.post('/:username/follow', authenticate, followController.follow)
router.delete('/:username/follow', authenticate, followController.unfollow)
router.get('/:username/follow', authenticate, followController.getStatus)

// listas
router.get('/:username/followers', followController.getFollowers)
router.get('/:username/following', followController.getFollowing)

export default router