import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import styles from './AuthPage.module.css'

const fields = [
    {
        name: 'displayName',
        label: 'Nombre',
        type: 'text',
        placeholder: 'Elena Martínez',
    },
    {
        name: 'username',
        label: 'Usuario',
        type: 'text',
        placeholder: 'elena_cocina',
    },
    {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'tu@email.com',
    },
    {
        name: 'password',
        label: 'Contraseña',
        type: 'password',
        placeholder: '••••••••',
    },
]


export default function RegisterPage() {
    const { register } = useAuth()
    const navigate  = useNavigate()
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setErrors({})
        setLoading(true)

        const form = new FormData(e.target)
        const data = {
            email: form.get('email'),
            username: form.get('username'),
            displayName: form.get('displayName'),
            password: form.get('password'),
        }

        try {
            await register(data)
            navigate('/', { replace: true })
        } catch (err) {
            // backend devuelve { error, details }, mapea por campo
            if (err?.details) {
                const fieldErrors = {}
                err.details.forEach(d => { fieldErrors[d.field] = d.message })
                setErrors(fieldErrors)
            } else {
                setErrors({ _global: err?.error || 'Error al registrarse' })
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>Crear cuenta</h1>
                <p className={styles.subtitle}>Empezá a compartir recetas hoy</p>

                {errors._global && (
                    <div className={styles.errorBanner} role="alert">
                        {errors._global}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {fields.map(field => (
                        <div key={field.name} className={styles.field}>
                            <label htmlFor={field.name}>{field.label}</label>
                            <input id={field.name}
                                    name={field.name}
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    required
                                    aria-invalid={!!errors[field.name]}
                            />
                            {errors[field.name] && (
                                <span className={styles.fieldError}>{errors[field.name]}</span>
                            )}
                        </div>
                    ))}

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                    </button>
                </form>

                <p className={styles.footer}>
                    ¿Ya tenes cuenta?{' '}
                    <Link to="/login">Iniciá sesión</Link>
                </p>
            </div>
        </div>
    )
}