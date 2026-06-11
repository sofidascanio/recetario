import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '../../hooks/useApi.js'
import { useAuth } from '../../hooks/useAuth.js'
import { usersService } from '../../services/users.service.js'
import RecipeCard from '../../components/ui/RecipeCard.jsx'
import AvatarUploader from '../../components/ui/AvatarUploader.jsx'
import api from '../../services/api.js'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
    const { username } = useParams()
    const { user: me } = useAuth()
    const navigate = useNavigate()

    const [tab, setTab] = useState('recipes')
    const [isFollowing, setIsFollowing] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)

    const isOwn = me?.username === username

    const { data: profile, loading } = useQuery(
        () => api.get(`/users/${username}`), [username]
    )

    const { data: recipes, loading: recipesLoading } = useQuery(
        () => api.get(`/users/${username}/recipes`), [username]
    )

    // recetas guardadas, solo se pide si es el tab activo y es dueño
    const { data: saved, loading: savedLoading } = useQuery(
        () => (isOwn && tab === 'saved')
            ? usersService.getSaved(username)
            : Promise.resolve(null),
        [username, tab, isOwn]
    )

    const [avatarUrl, setAvatarUrl] = useState('')

    useEffect(() => {
        if (profile?.avatarUrl) {
            setAvatarUrl(profile.avatarUrl)
        }
    }, [profile])

    const { mutate: updateAvatar } = useMutation(
        (url) => api.patch('/users/me', { avatarUrl: url })
    )

    async function handleAvatarChange(url) {
        setAvatarUrl(url)
        await updateAvatar(url)
    }

    useEffect(() => {
        if (!me || isOwn || !profile) return

        api.get(`/users/${username}/follow`)
            .then(data => setIsFollowing(data.isFollowing))
            .catch(() => {})
    }, [me, isOwn, profile, username])

    if (loading) return <p className={styles.state}>Cargando perfil...</p>
    if (!profile) return <p className={styles.state}>Usuario no encontrado.</p>

    async function handleFollow() {
        if (!me) {
            window.location.href = '/login'
            return
        }

        setFollowLoading(true)
        try {
            if (isFollowing) {
                await api.delete(`/users/${username}/follow`)
                setIsFollowing(false)
            } else {
                await api.post(`/users/${username}/follow`)
                setIsFollowing(true)
            }
        } finally {
            setFollowLoading(false)
        }
    }

    // datos a mostrar segun el tab activo
    const activeData = tab === 'recipes' ? recipes : saved
    const activeLoading = tab === 'recipes' ? recipesLoading : savedLoading

    return (
        <div className={styles.page}>
            {/* hero del perfil */}
            <section className={styles.hero}>
                <div className={styles.avatarWrap}>
                    {isOwn ? (
                        <AvatarUploader
                            currentUrl={avatarUrl}
                            displayName={profile.displayName}
                            onChange={handleAvatarChange}
                        />
                    ) : (
                        <div className={styles.avatarWrap}>
                            {profile.avatarUrl
                                ? <img src={profile.avatarUrl} alt={profile.displayName} className={styles.avatar} />
                                : <div className={styles.avatarFallback}>{profile.displayName[0].toUpperCase()}</div>
                            }
                        </div>
                    )}
                </div>

                <div className={styles.info}>
                    <h1 className={styles.displayName}>{profile.displayName}</h1>
                    <p className={styles.username}>@{profile.username}</p>
                    {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

                    <div className={styles.stats}>
                        <Stat value={profile._count?.recipes} label="Recetas" />
                        <Stat value={profile._count?.followers} label="Seguidores" />
                        <Stat value={profile._count?.following} label="Siguiendo" />
                    </div>

                    {isOwn ? (
                        // onClick conectado a /profile/edit
                        <button
                            className={styles.editBtn}
                            onClick={() => navigate('/profile/edit')}
                        >
                            Editar perfil
                        </button>
                    ) : me && (
                        <button
                            className={`${styles.followBtn} ${isFollowing ? styles.followingBtn : ''}`}
                            onClick={handleFollow}
                            disabled={followLoading}
                        >
                            {followLoading ? '...' : isFollowing ? 'Siguiendo' : '+ Seguir'}
                        </button>
                    )}
                </div>
            </section>

            {/* tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${tab === 'recipes' ? styles.tabActive : ''}`}
                    onClick={() => setTab('recipes')}
                >
                    Recetas
                </button>

                {isOwn && (
                    <button
                        className={`${styles.tab} ${tab === 'saved' ? styles.tabActive : ''}`}
                        onClick={() => setTab('saved')}
                    >
                        Guardadas
                    </button>
                )}
            </div>

            {/* loading */}
            {activeLoading && (
                <div className={styles.grid}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            )}

            {/* grid recetas */}
            {!activeLoading && activeData?.data?.length > 0 && (
                <div className={styles.grid}>
                    {activeData.data.map(recipe => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            )}

            {/* empty states */}
            {!activeLoading && activeData?.data?.length === 0 && (
                <p className={styles.empty}>
                    {tab === 'recipes'
                        ? (
                            isOwn
                                ? 'Todavía no publicaste ninguna receta.'
                                : 'Este usuario no tiene recetas públicas.'
                        )
                        : 'Todavía no guardaste ninguna receta. Explorá el feed y guarda las que te gusten.'
                    }
                </p>
            )}
        </div>
    )
}

function Stat({ value, label }) {
    return (
        <div className={styles.stat}>
            <span className={styles.statValue}>{value ?? 0}</span>
            <span className={styles.statLabel}>{label}</span>
        </div>
    )
}

function CardSkeleton() {
    return (
        <div className={styles.skeleton}>
            <div className={styles.skeletonImg} />
            <div className={styles.skeletonBody}>
                <div className={styles.skeletonLine} style={{ width: '60%' }} />
                <div className={styles.skeletonLine} style={{ width: '90%' }} />
            </div>
        </div>
    )
}