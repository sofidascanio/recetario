import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import styles from './BottomNav.module.css'

const NAV_ITEMS = [
    { to: '/', icon: 'home', label: 'Home', public: true  },
    { to: '/recommendations', icon: 'auto_awesome', label: 'Para vos', public: false },
    { to: '/fridge', icon: 'kitchen', label: 'Heladera', public: false },
]

export default function BottomNav() {
    const { user } = useAuth()

    return (
        <nav className={styles.nav}>
            {NAV_ITEMS.map(item => {
                if (!item.public && !user) return null
                return (
                <NavLink key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                        `${styles.item} ${isActive ? styles.active : ''}` }>
                    <span className={`material-symbols-outlined ${styles.icon}`}>
                        {item.icon}
                    </span>
                    <span className={styles.label}>{item.label}</span>
                </NavLink>
                )
            })}

            {user ? (
                <NavLink to={`/profile/${user.username}`}
                        className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}` }>
                    <span className="material-symbols-outlined">person</span>
                    <span className={styles.label}>Perfil</span>
                </NavLink>
            ) : (
                <NavLink to="/login" className={styles.item}>
                    <span className="material-symbols-outlined">login</span>
                    <span className={styles.label}>Entrar</span>
                </NavLink>
            )}
        </nav>
    )
}