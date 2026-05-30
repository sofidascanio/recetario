import * as uploadService from '../services/upload.service.js'

// el cliente pide una firma para poder subir directo a Cloudinary
export function getSignature(req, res, next) {
    try {
        const { type = 'recipe' } = req.query
        const signatureData = uploadService.generateSignature(type)
        res.json(signatureData)
    } catch (err) {
        next(err)
    }
}

// el cliente notifica que termino la subida (para logging o post-procesamiento)
export function confirmUpload(req, res, next) {
    try {
        const { publicId, url, type } = req.body
        // por ahora solo confirma
        console.log(`Upload confirmado: ${type} → ${publicId}`)
        res.json({ success: true, url })
    } catch (err) {
        next(err)
    }
}