import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { authService } from '../../services/auth.service.js'
import ImageUploader from '../../components/ui/ImageUploader.jsx'
import styles from './EditProfilePage.module.css'

export default function EditProfilePage() {
    const { user, refreshUser } = useAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState({
        displayName: user?.displayName ?? '',
        bio: user?.bio         ?? '',
        avatarUrl: user?.avatarUrl   ?? '',
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    function handleChange(e) {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        setError('')
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSuccess(false)

        // validacion minima en cliente (el backend tambien valida con zod)
        if (form.displayName && form.displayName.trim().length < 2) {
            setError('El nombre debe tener al menos 2 caracteres')
            return
        }

        setSaving(true)
        try {
            // solo manda los campos que cambiaron para no pisar con strings vacios
            const payload = {}
            if (form.displayName.trim() !== (user.displayName ?? ''))
                payload.displayName = form.displayName.trim()
            if (form.bio.trim() !== (user.bio ?? ''))
                payload.bio = form.bio.trim()
            if (form.avatarUrl !== (user.avatarUrl ?? ''))
                payload.avatarUrl = form.avatarUrl

            // si no cambio nada, ir directo al perfil sin llamar al backend
            if (Object.keys(payload).length === 0) {
                navigate(`/profile/${user.username}`)
                return
            }

            await authService.updateMe(payload)

            // actualiza el AuthContext para que el header refleje los cambios
            await refreshUser()

            setSuccess(true)

            // pequeño delay para que el usuario vea el feedback antes de navegar
            setTimeout(() => navigate(`/profile/${user.username}`), 800)

        } catch (err) {
            setError(err?.message || err?.error || 'Error al guardar los cambios')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                <div className={styles.header}>
                    <button
                        className={styles.backBtn}
                        onClick={() => navigate(-1)}
                        type="button"
                    >
                        ← Volver
                    </button>
                    <h1 className={styles.title}>Editar perfil</h1>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>

                    {/* avatar */}
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarPreview}>
                            {form.avatarUrl
                                ? <img src={form.avatarUrl} alt="Avatar" className={styles.avatarImg} />
                                : <span className={`material-symbols-outlined ${styles.avatarPlaceholder}`}>person</span>
                            }
                        </div>
                        <div className={styles.avatarUpload}>
                            <p className={styles.avatarLabel}>Foto de perfil</p>
                            <ImageUploader
                                value={form.avatarUrl}
                                onChange={url => setForm(prev => ({ ...prev, avatarUrl: url || '' }))}
                                uploadType="avatar"
                                aspectRatio="1/1"
                            />
                        </div>
                    </div>

                    {/* nombre */}
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="displayName">
                            Nombre
                        </label>
                        <input
                            id="displayName"
                            name="displayName"
                            type="text"
                            className={styles.input}
                            value={form.displayName}
                            onChange={handleChange}
                            placeholder={user?.username}
                            maxLength={50}
                        />
                        <p className={styles.hint}>
                            Si no completas este campo se mostrara tu nombre de usuario.
                        </p>
                    </div>

                    {/* bio */}
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="bio">
                            Biografía
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            className={styles.textarea}
                            value={form.bio}
                            onChange={handleChange}
                            placeholder="Conta un poco sobre vos y tu estilo de cocina..."
                            rows={4}
                            maxLength={300}
                        />
                        <p className={styles.charCount}>
                            {form.bio.length}/300
                        </p>
                    </div>

                    {/* feedback */}
                    {error && (
                        <div className={styles.errorBanner}>
                            <span className="material-symbols-outlined">error</span>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className={styles.successBanner}>
                            <span className="material-symbols-outlined">check_circle</span>
                            ¡Perfil actualizado!
                        </div>
                    )}

                    {/* acciones */}
                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={() => navigate(-1)}
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.saveBtn}
                            disabled={saving}
                        >
                            {saving
                                ? <><span className={styles.spinner} /> Guardando...</>
                                : '✓ Guardar cambios'
                            }
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}