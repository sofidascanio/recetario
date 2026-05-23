export const JWT_CONFIG = {
    secret: process.env.JWT_SECRET || (() => {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET es obligatorio en producción')
        }
        console.warn('Usando JWT_SECRET de desarrollo. Definilo en .env')
        return 'dev-secret-no-usar-en-produccion'
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}