import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import * as uploadController from '../controllers/upload.controller.js'

const router = Router()

// todos los endpoints de upload requieren autenticacion
router.use(authenticate)

// GET /api/v1/upload/signature?type=recipe|step|avatar
router.get('/signature', uploadController.getSignature)

// POST /api/v1/upload/confirm
router.post('/confirm', uploadController.confirmUpload)

export default router