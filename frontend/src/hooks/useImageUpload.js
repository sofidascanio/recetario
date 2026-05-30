import { useState, useCallback } from 'react'
import api from '../services/api.js'

// archivo aceptados
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function useImageUpload(uploadType = 'recipe') {
    const [uploading, setUploading] = useState(false)
    const [progress,  setProgress]  = useState(0)
    const [error,     setError]     = useState(null)

    const upload = useCallback(async (file) => {
        // valida tipo
        if (!ACCEPTED_TYPES.includes(file.type)) {
            setError('Formato invalido. Usá JPG, PNG, WebP o GIF.')
            return null
        }

        setUploading(true)
        setProgress(0)
        setError(null)

        try {
            // pide firma al backend
            const signatureData = await api.get(`/upload/signature?type=${uploadType}`)
            

            // valida tamaño con el limite que devolvio el backend
            if (file.size > signatureData.maxBytes) {
                const mb = (signatureData.maxBytes / 1024 / 1024).toFixed(0)
                throw new Error(`El archivo es muy grande. Máximo ${mb}MB.`)
            }

            // prepara FormData para cloudinary
            const formData = new FormData()
            formData.append('file', file)
            formData.append('api_key', signatureData.apiKey)
            formData.append('timestamp', signatureData.timestamp)
            formData.append('signature', signatureData.signature)
            formData.append('folder', signatureData.folder)
            formData.append('upload_preset', signatureData.uploadPreset)

            // sube directo a cloudinary (sin pasar por el backend)
            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`

            const response = await fetch(cloudinaryUrl, {
                method: 'POST',
                body: formData,
            })

            // simula progreso (fetch nativo no tiene onUploadProgress)
            setProgress(50)

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error?.message || 'Error al subir la imagen')
            }

            const cloudinaryData = await response.json()
            setProgress(100)

            // notifica al backend (opcional, para logging)
            await api.post('/upload/confirm', {
                publicId: cloudinaryData.public_id,
                url: cloudinaryData.secure_url,
                type: uploadType,
            })

            return {
                url: cloudinaryData.secure_url,
                publicId: cloudinaryData.public_id,
                width: cloudinaryData.width,
                height: cloudinaryData.height,
            }

        } catch (err) {
            setError(err.message || 'Error al subir la imagen')
            return null
        } finally {
            setUploading(false)
            setTimeout(() => setProgress(0), 1500)
        }
    }, [uploadType])

    return { upload, uploading, progress, error }
}