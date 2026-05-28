import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import styles from './AuthPage.module.css'

export default function LoginPage() {
    const { login }   = useAuth()
    const navigate    = useNavigate()
    const [error, setError]     = useState(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const form = new FormData(e.target)

        try {
            await login(form.get('email'), form.get('password'))
            navigate('/', { replace: true })
        } catch (err) {
            setError(err?.error || 'Error al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>Bienvenido de vuelta</h1>
                <p className={styles.subtitle}>Iniciá sesión para continuar</p>

                {error && (
                <div className={styles.errorBanner} role="alert">
                    {error}
                </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="email">Email</label>
                        <input id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="tu@email.com"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password">Contraseña</label>
                        <input id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                    >
                        {loading ? 'Iniciando...' : 'Iniciar sesión'}
                    </button>
                </form>

                <p className={styles.footer}>
                    ¿No tenes cuenta?{' '}
                    <Link to="/register">Registrate</Link>
                </p>
            </div>
        </div>
    )
}