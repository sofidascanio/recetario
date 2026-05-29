import { useState } from 'react'
import { useQuery, useMutation } from '../../hooks/useApi.js'
import { useAuth } from '../../hooks/useAuth.js'
import api from '../../services/api.js'
import styles from './CommentSection.module.css'

export default function CommentSection({ recipeId }) {
    const { user } = useAuth()

    const { data: comments, loading, refetch } = useQuery(
        () => api.get(`/recipes/${recipeId}/comments`),
        [recipeId]
    )

    const { mutate: postComment, loading: posting } = useMutation(
        (content) => api.post(`/recipes/${recipeId}/comments`, { content })
    )

    const { mutate: removeComment } = useMutation(
        (commentId) => api.delete(`/recipes/${recipeId}/comments/${commentId}`)
    )

    const [text, setText] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()
        if (!text.trim()) return
        await postComment(text.trim())
        setText('')
        refetch()
    }

    async function handleDelete(commentId) {
        await removeComment(commentId)
        refetch()
    }

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>
                Comentarios
                {comments?.length > 0 && (
                <span className={styles.count}>{comments.length}</span>
                )}
            </h2>

            {/* Formulario */}
            {user ? (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formAvatar}>
                        {user.avatarUrl
                            ? <img src={user.avatarUrl} alt="" />
                            : <span>{user.displayName[0].toUpperCase()}</span>
                        }
                    </div>
                    <div className={styles.formRight}>
                        <textarea value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder="¿Probaste esta receta? Contá tu experiencia..."
                                rows={3}
                                className={styles.textarea}/>
                        <button type="submit"
                                className={styles.submitBtn}
                                disabled={posting || !text.trim()}>
                            {posting ? 'Publicando...' : 'Publicar comentario'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className={styles.loginPrompt}>
                <a href="/login">Iniciá sesión</a> para dejar un comentario.
                </div>
            )}

            {/* lista */}
            {loading && <p className={styles.state}>Cargando comentarios...</p>}

            {comments?.length === 0 && !loading && (
                <p className={styles.state}>Se el primero en comentar esta receta.</p>
            )}

            <ul className={styles.list}>
                {comments?.map(comment => (
                <CommentItem key={comment.id}
                            comment={comment}
                            currentUserId={user?.id}
                            onDelete={handleDelete}/>
                ))}
            </ul>
        </section>
    )
}

function CommentItem({ comment, currentUserId, onDelete }) {
    const isOwn = comment.author.id === currentUserId

    return (
        <li className={styles.item}>
            <div className={styles.itemAvatar}>
                {comment.author.avatarUrl
                ? <img src={comment.author.avatarUrl} alt="" />
                : <span>{comment.author.displayName[0].toUpperCase()}</span>
                }
            </div>
            <div className={styles.itemBody}>
                <div className={styles.itemHeader}>
                <span className={styles.itemAuthor}>{comment.author.displayName}</span>
                <span className={styles.itemDate}>
                    {formatDate(comment.createdAt)}
                </span>
                {isOwn && ( <button className={styles.deleteBtn}
                                    onClick={() => onDelete(comment.id)}
                                    aria-label="Eliminar comentario">
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                )}
                </div>
                <p className={styles.itemContent}>{comment.content}</p>
            </div>
        </li>
    )
}

function formatDate(dateStr) {
    const date = new Date(dateStr)
    const now   = new Date()
    const diff  = Math.floor((now - date) / 1000)

    if (diff < 60) return 'hace un momento'
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}