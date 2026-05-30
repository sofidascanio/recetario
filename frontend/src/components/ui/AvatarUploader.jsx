import { useRef } from 'react'
import { useImageUpload } from '../../hooks/useImageUpload.js'
import styles from './AvatarUploader.module.css'

export default function AvatarUploader({ currentUrl, displayName, onChange }) {
    const { upload, uploading, error } = useImageUpload('avatar')
    const inputRef = useRef(null)

    async function handleFile(e) {
        const file = e.target.files[0]
        if (!file) return
        const result = await upload(file)
        if (result) onChange(result.url)
    }

    return (
        <div className={styles.wrapper}>
            <div className={`${styles.avatar} ${uploading ? styles.loading : ''}`}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Cambiar foto de perfil">
                    {currentUrl
                    ? <img src={currentUrl} alt={displayName} />
                    : (
                        <span className={styles.initial}>
                        {displayName?.[0]?.toUpperCase()}
                        </span>
                    )
                    }

                    {/* overlay de camara */}
                    <div className={styles.overlay}>
                        {uploading
                            ? <span className={styles.spinner} />
                            : <span className="material-symbols-outlined">photo_camera</span>
                        }
                    </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <input ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFile}
                style={{ display: 'none' }}/>
        </div>
    )
}