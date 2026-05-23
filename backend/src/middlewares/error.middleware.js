
// clase base para errores operacionales (esperados)
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
        this.isOperational = true
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado') {
        super(message, 404)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 401)
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Sin permisos') {
        super(message, 403)
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Datos inválidos', errors = []) {
        super(message, 400)
        this.errors = errors
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Conflicto con datos existentes') {
        super(message, 409)
    }
}

// middleware que express usa cuando se llama a next(error)
export function errorHandler(err, _req, res, _next) {
    // error operacional
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            error: err.message,
            ...(err.errors && { details: err.errors }),
            })
    }

    // error de Prisma, violacion de unique constraint
    if (err.code === 'P2002') {
        return res.status(409).json({
            error: `El campo '${err.meta?.target}' ya existe`,
        })
    }

    // error inesperado
    console.error('Error inesperado:', err)
    res.status(500).json({ error: 'Error interno del servidor' })
}