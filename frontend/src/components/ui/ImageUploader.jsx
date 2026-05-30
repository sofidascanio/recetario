// src/components/ui/ImageUploader.jsx
import { useRef, useState, useCallback } from 'react'
import { useImageUpload } from '../../hooks/useImageUpload.js'
import styles from './ImageUploader.module.css'

export default function ImageUploader({
        value, // url actual de la imagen
        onChange, // callback(url) cuando se sube una imagen
        uploadType = 'recipe',
        label = 'Imagen',
        aspectRatio = '16/9', // '16/9', '1/1', '4/3'
        placeholder,
    }) {
    const { upload, uploading, progress, error } = useImageUpload(uploadType)
    const inputRef = useRef(null)
    const [dragOver, setDragOver] = useState(false)

    const handleFile = useCallback(async (file) => {
        if (!file) return
        const result = await upload(file)
        if (result) onChange(result.url)
    }, [upload, onChange])

    // click en el area, abre el file picker
    function handleClick() {
        inputRef.current?.click()
    }

    function handleInputChange(e) {
        handleFile(e.target.files[0])
    }

    // drag and drop
    function handleDragOver(e) {
        e.preventDefault()
        setDragOver(true)
    }

    function handleDragLeave() {
        setDragOver(false)
    }

    function handleDrop(e) {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file?.type.startsWith('image/')) handleFile(file)
    }

    function handleRemove(e) {
        e.stopPropagation()
        onChange(null)
    }

    return (
        <div className={styles.wrapper}>
            {label && <span className={styles.label}>{label}</span>}

            <div className={`
                    ${styles.dropZone}
                    ${dragOver  ? styles.dragOver  : ''}
                    ${uploading ? styles.uploading : ''}
                    ${value     ? styles.hasImage  : ''}
                    `}
                style={{ aspectRatio }}
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleClick()}
                aria-label="Subir imagen">
                    {/* preview de la imagen actual */}
                    {value && !uploading && (
                        <>
                            <img src={value} alt="Preview" className={styles.preview} />
                            <div className={styles.imageOverlay}>
                                <button className={styles.changeBtn}
                                        onClick={handleClick}
                                        type="button">
                                    <span className="material-symbols-outlined">photo_camera</span>
                                    Cambiar
                                </button>
                                <button className={styles.removeBtn}
                                        onClick={handleRemove}
                                        type="button"
                                        aria-label="Eliminar imagen">
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </>
                    )}

                    {/* Estado de carga */}
                    {uploading && (
                    <div className={styles.uploadingState}>
                        <div className={styles.progressRing}>
                            <svg viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-primary-fixed)" strokeWidth="2" />
                                <circle
                                cx="18" cy="18" r="15.9"
                                fill="none"
                                stroke="var(--color-primary)"
                                strokeWidth="2.5"
                                strokeDasharray={`${progress} ${100 - progress}`}
                                strokeDashoffset="25"
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dasharray 0.3s ease' }}
                                />
                            </svg>
                            <span className={styles.progressText}>{progress}%</span>
                        </div>
                        <p className={styles.uploadingText}>Subiendo imagen...</p>
                    </div>
                    )}

                    {/* estado vacio */}
                    {!value && !uploading && (
                    <div className={styles.emptyState}>
                        <span className="material-symbols-outlined">add_photo_alternate</span>
                        <p className={styles.emptyTitle}>
                            {dragOver ? '¡Soltá la imagen!' : 'Arrastrá o hacé clic para subir'}
                        </p>
                        {placeholder && (
                            <p className={styles.emptyHint}>{placeholder}</p>
                        )}
                        <p className={styles.emptyFormats}>JPG, PNG, WebP</p>
                    </div>
                    )}

                    {/* input oculto */}
                    <input ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleInputChange}
                        className={styles.hiddenInput}
                        tabIndex={-1}/>
            </div>

            {/* error */}
            {error && (
                <p className={styles.error} role="alert">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </p>
            )}
            </div>
    )
}