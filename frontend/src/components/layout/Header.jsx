import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import styles from './Header.module.css'

export default function Header() {
    const { user } = useAuth()

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link to="/" className={styles.brand}>
                    Recetario
                </Link>

                <nav className={styles.actions}>
                    {user ? (
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