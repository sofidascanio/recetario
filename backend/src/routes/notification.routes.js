import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import * as notificationController from '../controllers/notification.controller.js'

const router = Router()

router.use(authenticate)

// stream sse, conexion persistente
router.get('/stream', notificationController.stream)

router.get('/', notificationController.getNotifications)
router.get('/unread-count', notificationController.getUnreadCount)
router.patch('/read', notificationController.markAsRead)
router.delete('/:id', notificationController.deleteNotification)

export default router