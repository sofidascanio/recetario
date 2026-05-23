import jwt from 'jsonwebtoken'
import { JWT_CONFIG } from '../config/jwt.js'
import { UnauthorizedError } from './error.middleware.js'

export function authenticate(req, _res, next) {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
        return next(new UnauthorizedError('Token requerido'))
    }

    const token = authHeader.split(' ')[1]

    try {
        const payload = jwt.verify(token, JWT_CONFIG.secret)
        req.user = { id: payload.sub }
        next()
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new UnauthorizedError('Token expirado'))
        }
        next(new UnauthorizedError('Token inválido'))
    }
}

// middleware opcional, no falla si no hay token
// para rutas publicas que tienen mas info para usuarios logueados
export function optionalAuth(req, _res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) return next()

    try {
        const token = authHeader.split(' ')[1]
        const payload = jwt.verify(token, JWT_CONFIG.secret)
        req.user = { id: payload.sub }
    } catch {
        // ignora el error
    }
    next()
}