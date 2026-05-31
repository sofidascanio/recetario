import { useNavigate } from 'react-router-dom'
import styles from './NotificationPanel.module.css'

const TYPE_ICON = {
    COMMENT: 'comment',
    FOLLOW: 'person_add',
    SAVE: 'bookmark',
    RATING: 'star',
    SYSTEM: 'info',
}

const TYPE_COLOR = {
    COMMENT: 'primary',
    FOLLOW: 'secondary',
    SAVE: 'primary',
    RATING: 'tertiary',
    SYSTEM: 'outline',
}

export default function NotificationPanel({
        notifications,
        loading,
        unreadCount,
        onMarkAllRead,
        onMarkRead,
        onDelete,
        onClose,
    }) {
    const navigate = useNavigate()

    function handleClick(notification) {
        if (!notification.read) {
            onMarkRead(notification.id)
        }
        if (notification.link) {
            navigate(notification.link)
            onClose()
        }
    }

    return (
        <div className={styles.panel} role="dialog" aria-label="Notificaciones">

            {/* header */}
            <div className={styles.header}>
                <h3 className={styles.title}>Notificaciones</h3>
                <div className={styles.headerActions}>
                    {unreadCount > 0 && (
                        <button className={styles.markAllBtn} onClick={onMarkAllRead}>
                            Marcar todo como leído
                        </button>
                    )}
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>

            {/* lista */}
            <div className={styles.list}>
                {loading && (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={styles.skeleton}>
                            <div className={styles.skeletonIcon} />
                            <div className={styles.skeletonBody}>
                                <div className={styles.skeletonLine} style={{ width: '80%' }} />
                                <div className={styles.skeletonLine} style={{ width: '50%' }} />
                            </div>
                        </div>
                    ))
                )}

                {!loading && notifications.length === 0 && (
                    <div className={styles.empty}>
                        <span className="material-symbols-outlined">notifications_none</span>
                        <p>No tenes notificaciones todavía</p>
                    </div>
                )}

                {!loading && notifications.map(notification => (
                    <NotificationItem key={notification.id}
                                    notification={notification}
                                    onClick={() => handleClick(notification)}
                                    onDelete={() => onDelete(notification.id)}/>
                ))}
            </div>

            {/* footer */}
            {notifications.length > 0 && (
                <div className={styles.footer}>
                    <a href="/notifications" className={styles.seeAll} onClick={onClose}>
                        Ver todas las notificaciones
                    </a>
                </div>
            )}
        </div>
    )
}

function NotificationItem({ notification, onClick, onDelete }) {
    const icon = TYPE_ICON[notification.type] || 'notifications'
    const color = TYPE_COLOR[notification.type] || 'outline'

    return (
        <div className={`${styles.item} ${!notification.read ? styles.unread : ''}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onClick()}>
                
            {/* icono del actor */}
            <div className={styles.itemLeft}>
                {notification.actor?.avatarUrl
                    ? <img src={notification.actor.avatarUrl} alt="" className={styles.actorAvatar} />
                    : (
                        <div className={`${styles.iconCircle} ${styles[`icon_${color}`]}`}>
                            <span className="material-symbols-outlined">{icon}</span>
                        </div>
                    )
                }
                {/* icono de tipo sobre el avatar */}
                {notification.actor?.avatarUrl && (
                    <div className={`${styles.typeIcon} ${styles[`icon_${color}`]}`}>
                        <span className="material-symbols-outlined">{icon}</span>
                    </div>
                )}
            </div>

            {/* contenido */}
            <div className={styles.itemBody}>
                <p className={styles.message}>{notification.message}</p>
                <time className={styles.time}>
                    {formatRelativeTime(notification.createdAt)}
                </time>
            </div>

            {/* acciones */}
            <div className={styles.itemActions}>
                {!notification.read && (
                    <span className={styles.unreadDot} aria-label="Sin leer" />
                )}
                <button className={styles.deleteBtn}
                        onClick={(e) => { e.stopPropagation(); onDelete() }}
                        aria-label="Eliminar notificación">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
        </div>
    )
}

// helper
function formatRelativeTime(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins  = Math.floor(diff / 60_000)
    const hours = Math.floor(diff / 3_600_000)
    const days  = Math.floor(diff / 86_400_000)

    if (mins < 1) return 'Ahora mismo'
    if (mins < 60) return `Hace ${mins} min`
    if (hours < 24) return `Hace ${hours}h`
    if (days < 7) return `Hace ${days} día${days !== 1 ? 's' : ''}`

    return new Date(dateStr).toLocaleDateString('es-AR', {
        day: 'numeric', month: 'short',
    })
}