import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '../../hooks/useApi.js'
import { useAuth } from '../../hooks/useAuth.js'
import api from '../../services/api.js'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
    const { username }   = useParams()
    const { user: me }   = useAuth()
    const [tab, setTab]  = useState('recipes')

    const { data: profile, loading } = useQuery(
        () => api.get(`/users/${username}`), [username]
    )

    const { data: recipes } = useQuery(
        () => api.get(`/users/${username}/recipes`), [username]
    )

    if (loading) return <p className={styles.state}>Cargando perfil...</p>
    if (!profile) return <p className={styles.state}>Usuario no encontrado.</p>

    const isOwn = me?.username === username

    return (
        <div className={styles.page}>
            {/* Hero del perfil */}
            <section className={styles.hero}>
                <div className={styles.avatarWrap}>
                    {profile.avatarUrl
                      ? <img src={profile.avatarUrl} alt={profile.displayName} className={styles.avatar} />
                      : (
                        <div className={styles.avatarFallback}>
                            {profile.displayName[0].toUpperCase()}
                        </div>
                      )
                    }
                </div>

                <div className={styles.info}>
                    <h1 className={styles.displayName}>{profile.displayName}</h1>
                    <p className={styles.username}>@{profile.username}</p>
                    {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

                    <div className={styles.stats}>
                        <Stat value={profile._count?.recipes}   label="Recetas"    />
                        <Stat value={profile._count?.followers} label="Seguidores" />
                        <Stat value={profile._count?.following} label="Siguiendo"  />
                    </div>

                    {isOwn && (
                        <button className={styles.editBtn}>Editar perfil</button>
                    )}
                </div>
            </section>

            {/* tabs */}
            <div className={styles.tabs}>
                <button className={`${styles.tab} ${tab === 'recipes' ? styles.tabActive : ''}`}
                        onClick={() => setTab('recipes')}>
                    Recetas
                </button>
                {isOwn && (
                <button className={`${styles.tab} ${tab === 'saved' ? styles.tabActive : ''}`}
                        onClick={() => setTab('saved')}>
                    Guardadas
                </button>
                )}
            </div>

            {/* grilla de recetas */}
            <div className={styles.grid}>
                {recipes?.data?.map(recipe => (
                    <a key={recipe.id} href={`/recipes/${recipe.id}`} className={styles.card}>
                        {recipe.imageUrl
                          ? <img src={recipe.imageUrl} alt={recipe.title} className={styles.cardImg} />
                          : <div className={styles.cardImgPlaceholder} />
                        }
                        <div className={styles.cardBody}>
                            {!recipe.isPublic && (
                              <span className={styles.privateBadge}>
                                  <span className="material-symbols-outlined">lock</span>
                                  Privada
                              </span>
                            )}
                            <h3 className={styles.cardTitle}>{recipe.title}</h3>
                            <div className={styles.cardMeta}>
                                <span>{recipe.meal?.category}</span>
                                <span>⏱ {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</span>
                            </div>
                      </div>
                    </a>
                ))}
            </div>

            {recipes?.data?.length === 0 && (
                <p className={styles.empty}>
                    {isOwn ? 'Todavía no publicaste ninguna receta.' : 'Este usuario no tiene recetas públicas.'}
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