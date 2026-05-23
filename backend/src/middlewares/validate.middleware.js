import { ValidationError } from './error.middleware.js'

// Factory: recibe un schema de Zod, devuelve un middleware
export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
        const errors = result.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message,
        }))

        return next(new ValidationError('Datos inválidos', errors))
    }

    // reemplaza req.body con los datos validados y sanitizados
    req.body = result.data

    next()
  }
}