import { useState } from 'react'
import { useNotifications } from '../../hooks/useNotifications.js'
import NotificationPanel from './NotificationPanel.jsx'
import styles from './NotificationBell.module.css'

export default function NotificationBell() {
    const [open, setOpen] = useState(false)
    const notif = useNotifications()

    return (
        <div className={styles.wrapper}>
            <button className={styles.bell}
                    onClick={() => setOpen(v => !v)}
                    aria-label={`Notificaciones${notif.unreadCount > 0 ? ` (${notif.unreadCount} sin leer)` : ''}`}>
                <span className="material-symbols-outlined">
                    {notif.unreadCount > 0 ? 'notifications_active' : 'notifications'}
                </span>

                {/* badge de conteo */}
                {notif.unreadCount > 0 && (
                    <span className={styles.badge} aria-hidden="true">
                        {notif.unreadCount > 99 ? '99+' : notif.unreadCount}
                    </span>
                )}

                {/* indicador de conexion sse */}
                <span className={`${styles.dot} ${notif.connected ? styles.dotOnline : styles.dotOffline}`} />
            </button>

            {/* panel desplegable */}
            {open && (
                <>
                    <div className={styles.backdrop} onClick={() => setOpen(false)} />
                        <NotificationPanel notifications={notif.notifications}
                                        loading={notif.loading}
                                        unreadCount={notif.unreadCount}
                                        onMarkAllRead={() => notif.markAllRead()}
                                        onMarkRead={(id) => notif.markAsRead([id])}
                                        onDelete={(id) => notif.remove(id)}
                                        onClose={() => setOpen(false)}/>
                </>
            )}
        </div>
    )
}