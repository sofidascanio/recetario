import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { useNotifications } from '../../hooks/useNotifications.js'
import { notificationsService } from '../../services/notifications.service.js'
import styles from './NotificationsPage.module.css'

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

const FILTERS = [
    { value: 'all', label: 'Todas', icon: 'apps' },
    { value: 'unread', label: 'No leídas', icon: 'mark_email_unread' },
    { value: 'COMMENT', label: 'Comentarios', icon: 'comment' },
    { value: 'FOLLOW', label: 'Seguidores', icon: 'person_add' },
    { value: 'SAVE', label: 'Guardados', icon: 'bookmark' },
    { value: 'RATING', label: 'Puntuaciones',icon: 'star' },
]

export default function NotificationsPage() {
    const { user } = useAuth()

    // el hook global se para sincronizar el unreadCount del header
    // esta pagina maneja su propia lista paginada/filtrada
    const { markAsRead: markGlobal, markAllRead: markAllGlobal, remove: removeGlobal } = useNotifications()

    const [notifications, setNotifications] = useState([])
    const [pagination, setPagination] = useState(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [filter, setFilter] = useState('all')

    const loadPage = useCallback(async (pageNum, currentFilter) => {
        setLoading(true)
        try {
            const data = await notificationsService.getAll(pageNum, 20)

            let filtered = data.data
            if (currentFilter === 'unread') {
                filtered = filtered.filter(n => !n.read)
            } else if (currentFilter !== 'all') {
                filtered = filtered.filter(n => n.type === currentFilter)
            }

            setNotifications(filtered)
            setPagination(data.pagination)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadPage(page, filter)
    }, [page, filter, loadPage])

    // resetea a pagina 1 cuando cambia el filtro
    function handleFilterChange(value) {
        setFilter(value)
        setPage(1)
    }

    async function handleMarkRead(id) {
        await markGlobal([id])
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
    }

    async function handleMarkAllRead() {
        await markAllGlobal()
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    async function handleDelete(id) {
        await removeGlobal(id)
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    function handleClick(notification) {
        if (!notification.read) handleMarkRead(notification.id)
    }

    const unreadInPage = notifications.filter(n => !n.read).length

    return (
        <div className={styles.page}>

            {/* header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Notificaciones</h1>
                    <p className={styles.subtitle}>
                        {pagination?.total
                            ? `${pagination.total} notificaci${pagination.total !== 1 ? 'ones' : 'ón'} en total`
                            : 'Tu actividad reciente'
                        }
                    </p>
                </div>
                {unreadInPage > 0 && (
                    <button className={styles.markAllBtn} onClick={handleMarkAllRead}>
                        <span className="material-symbols-outlined">done_all</span>
                        Marcar todo como leído
                    </button>
                )}
            </div>

            {/* filtros */}
            <div className={styles.filters}>
                {FILTERS.map(f => (
                    <button key={f.value}
                            className={`${styles.filterChip} ${filter === f.value ? styles.filterActive : ''}`}
                            onClick={() => handleFilterChange(f.value)}>
                        <span className="material-symbols-outlined">{f.icon}</span>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* lista */}
            <div className={styles.list}>
                {loading && (
                    Array.from({ length: 5 }).map((_, i) => <ItemSkeleton key={i} />)
                )}

                {!loading && notifications.length === 0 && (
                    <EmptyState filter={filter} />
                )}

                {!loading && notifications.map(notification => (
                    <NotificationRow key={notification.id}
                                    notification={notification}
                                    onClick={() => handleClick(notification)}
                                    onDelete={() => handleDelete(notification.id)}/>
                ))}
            </div>

            {/* paginacion */}
            {pagination?.totalPages > 1 && (
                <div className={styles.pagination}>
                    <button className={styles.pageBtn}
                            onClick={() => setPage(p => p - 1)}
                            disabled={page === 1}>
                        ← Anterior
                    </button>
                    <span className={styles.pageInfo}>
                        Página {page} de {pagination.totalPages}
                    </span>
                    <button className={styles.pageBtn}
                            onClick={() => setPage(p => p + 1)}
                            disabled={!pagination.hasNext}>
                        Siguiente →
                    </button>
                </div>
            )}
        </div>
    )
}

// fila de notificacion 
function NotificationRow({ notification, onClick, onDelete }) {
    const icon = TYPE_ICON[notification.type] || 'notifications'
    const color = TYPE_COLOR[notification.type] || 'outline'

    const content = (
        <>
            {/* avatar/icono */}
            <div className={styles.itemLeft}>
                {notification.actor?.avatarUrl
                    ? <img src={notification.actor.avatarUrl} alt="" className={styles.actorAvatar} />
                    : (
                        <div className={`${styles.iconCircle} ${styles[`icon_${color}`]}`}>
                        <span className="material-symbols-outlined">{icon}</span>
                        </div>
                    )
                }
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

            {/* estado */}
            <div className={styles.itemActions}>
                {!notification.read && <span className={styles.unreadDot} aria-label="Sin leer" />}
                <button className={styles.deleteBtn}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete() }}
                        aria-label="Eliminar notificación">
                    <span className="material-symbols-outlined">delete</span>
                </button>
            </div>
        </>
    )

    const className = `${styles.item} ${!notification.read ? styles.unread : ''}`

    // si tiene link, navega, si no, solo marca como leida
    if (notification.link) {
        return (
            <Link to={notification.link} className={className} onClick={onClick}>
                {content}
            </Link>
        )
    }

    return (
        <div className={className} onClick={onClick} role="button" tabIndex={0}>
            {content}
        </div>
    )
}

// estados 
function EmptyState({ filter }) {
    const messages = {
        all: { icon: 'notifications_none', text: 'No tenés notificaciones todavía' },
        unread: { icon: 'mark_email_read', text: 'No tenés notificaciones sin leer' },
        COMMENT: { icon: 'comment', text: 'Nadie comentó tus recetas todavía' },
        FOLLOW: { icon: 'person_add', text: 'Nadie te sigue todavía' },
        SAVE: { icon: 'bookmark', text: 'Nadie guardó tus recetas todavía' },
        RATING: { icon: 'star',  text: 'Nadie puntuó tus recetas todavía' },
    }
    const { icon, text } = messages[filter] || messages.all

    return (
        <div className={styles.empty}>
            <span className="material-symbols-outlined">{icon}</span>
            <p>{text}</p>
        </div>
    )
}

function ItemSkeleton() {
    return (
        <div className={styles.skeleton}>
            <div className={styles.skeletonIcon} />
            <div className={styles.skeletonBody}>
                <div className={styles.skeletonLine} style={{ width: '70%' }} />
                <div className={styles.skeletonLine} style={{ width: '40%' }} />
            </div>
        </div>
    )
}

function formatRelativeTime(dateStr) {
    const diff  = Date.now() - new Date(dateStr).getTime()
    const mins  = Math.floor(diff / 60_000)
    const hours = Math.floor(diff / 3_600_000)
    const days  = Math.floor(diff / 86_400_000)

    if (mins < 1)   return 'Ahora mismo'
    if (mins < 60)  return `Hace ${mins} min`
    if (hours < 24) return `Hace ${hours}h`
    if (days < 7)   return `Hace ${days} día${days !== 1 ? 's' : ''}`

    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}