import { Router } from 'express'
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js'
import * as recController from '../controllers/recommendation.controller.js'

const router = Router()

// feed personalizado, requiere auth (por las señales del usuario)
router.get('/feed', authenticate, recController.getPersonalizedFeed)

// fridge match, requiere auth
router.get('/fridge', authenticate, recController.getFridgeMatch)

// recetas similares, publica
router.get('/similar/:id', optionalAuth, recController.getSimilarRecipes)

// trending, publica
router.get('/trending', optionalAuth, recController.getTrending)

export default router