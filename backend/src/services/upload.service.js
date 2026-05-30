import crypto from 'crypto'
import cloudinary from '../config/cloudinary.js'
import { AppError } from '../middlewares/error.middleware.js'

// tipos de upload permitidos con sus transformaciones
const UPLOAD_CONFIGS = {
    recipe: {
        folder: 'recetario/recipes',
        transformation: [
            { width: 1200, height: 800, crop: 'fill', gravity: 'auto' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },  // webp en browsers que lo soportan
        ],
        maxBytes: 10 * 1024 * 1024,  // 10MB
    },
    step: {
        folder: 'recetario/steps',
        transformation: [
            { width: 800, height: 600, crop: 'fill', gravity: 'auto' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
        ],
        maxBytes: 5 * 1024 * 1024,  // 5MB
    },
    avatar: {
        folder: 'recetario/avatars',
        transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
        ],
        maxBytes: 5 * 1024 * 1024,  // 5MB
    },
}

// genera la firma que el cliente necesita para subir directo a cloudinary
export function generateSignature(uploadType) {
    const config = UPLOAD_CONFIGS[uploadType]
    if (!config) {
        throw new AppError(`Tipo de upload inválido: ${uploadType}`, 400)
    }

    const timestamp = Math.round(Date.now() / 1000)

    // parametros que se firman, tienen que coincidir exactamente con lo que el cliente manda a cloudinary
    const paramsToSign = {
        folder:    config.folder,
        timestamp,
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    }

    // construye el string a firmar (params ordenados alfabeticamente)
    const signatureString = Object.keys(paramsToSign)
        .sort()
        .map(key => `${key}=${paramsToSign[key]}`)
        .join('&') + process.env.CLOUDINARY_API_SECRET

    const signature = crypto
        .createHash('sha256')
        .update(signatureString)
        .digest('hex')

    return {
        signature,
        timestamp,
        folder: config.folder,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
        transformation: config.transformation,
        maxBytes: config.maxBytes,
    }
}

// elimina imagen de cloudinary por su public_id
export async function deleteImage(publicId) {
    if (!publicId) return
    try {
        await cloudinary.uploader.destroy(publicId)
    } catch (err) {
        // para que un error de cloudinary no rompa el flujo principal
        console.error('Error al eliminar imagen de Cloudinary:', err)
    }
}

// extrae el public_id de una url de Cloudinary
// Ej: https://res.cloudinary.com/demo/image/upload/v123/recetario/recipes/abc.jpg -> recetario/recipes/abc
export function extractPublicId(url) {
    if (!url) return null
    try {
        const parts = url.split('/upload/')
        if (parts.length < 2) return null
        // quita la version (v123/) y la extension
        const withoutVersion = parts[1].replace(/^v\d+\//, '')
        return withoutVersion.replace(/\.[^/.]+$/, '')
    } catch {
        return null
    }
}