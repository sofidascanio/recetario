import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import styles from './Header.module.css'
import { useTheme } from '../../hooks/useTheme.js'
import NotificationBell from '../ui/NotificationBell.jsx'

export default function Header() {
    const { user, logout } = useAuth()

    const { theme, toggle } = useTheme()

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link to="/" className={styles.brand}>
                    Recetario
                </Link>

                <nav className={styles.actions}>
                    <button className={styles.themeBtn}
                            onClick={toggle}
                            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
                        <span className="material-symbols-outlined">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                    {user && <NotificationBell />}
                    {user ? (
                        <>
                            <Link to={`/profile/${user.username}`}
                                className={styles.avatar}
                                aria-label="Mi perfil">
                            {user.avatarUrl
                                ? <img src={user.avatarUrl} alt={user.displayName} />
                                : <span className={styles.avatarInitial}>
                                    {user.displayName[0].toUpperCase()}
                                </span>
                            }
                            </Link>
                            <button
                                className={styles.logoutBtn}
                                onClick={logout}
                                aria-label="Cerrar sesión"
                                title="Cerrar sesión">
                                <span className="material-symbols-outlined">logout</span>
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className={styles.loginBtn}>
                            Iniciar sesión
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    )
}