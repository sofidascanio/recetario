import { useQuery } from '../../hooks/useApi.js'
import { recommendationsService } from '../../services/recommendations.service.js'
import { useAuth } from '../../hooks/useAuth.js'
import RecipeCard from '../../components/ui/RecipeCard.jsx'
import HorizontalScroll from '../../components/ui/HorizontalScroll.jsx'
import styles from './RecommendationsPage.module.css'

export default function RecommendationsPage() {
    const { user } = useAuth()

    const { data: feed, loading: feedLoading } = useQuery(
        () => user ? recommendationsService.getFeed(12) : Promise.resolve(null),
        [user?.id]
    )

    const { data: fridge, loading: fridgeLoading } = useQuery(
        () => user ? recommendationsService.getFridge(10) : Promise.resolve(null),
        [user?.id]
    )

    const { data: trending, loading: trendingLoading } = useQuery(
        () => recommendationsService.getTrending(7, 10),
        []
    )

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>Para vos</h1>
                <p className={styles.heroSub}>
                    Recomendaciones basadas en tu heladera y tus gustos
                </p>
            </div>

            {/* feed personalizado */}
            {user && (
                <section className={styles.section}>
                    <HorizontalScroll title="Recomendadas para vos"
                                    seeAllTo="/recommendations/feed">
                        {feedLoading
                            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                            : feed?.data?.map(recipe => (
                                <RecipeCard key={recipe.id}
                                            recipe={recipe}
                                            badge={getPersonalizedBadge(recipe._scores)}/>
                        ))
                        }
                    </HorizontalScroll>

                    {/* meta info sobre por qué estas recomendaciones */}
                    {feed?.meta && (
                        <RecommendationMeta meta={feed.meta} />
                    )}
                </section>
            )}

            {/* fridge match */}
            {user && (
                <section className={styles.section}>
                    <HorizontalScroll title="Con tu heladera" seeAllTo="/fridge">
                        {fridgeLoading
                            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                            : fridge?.data?.length === 0
                                ? <EmptyFridgeMatch />
                                : fridge?.data?.map(recipe => (
                                <RecipeCard key={recipe.id}
                                            recipe={recipe}
                                            showMatch
                                            badge={recipe.usesExpiring
                                                ? { label: '¡Usalo antes del vencimiento!', variant: 'expiring', icon: 'timer' }
                                                : { label: `${recipe.matchPercentage}% match`, variant: 'match' }
                                            }
                                />
                                ))
                        }
                    </HorizontalScroll>
                </section>
            )}

            {/* trending */}
            <section className={styles.section}>
                <HorizontalScroll title="Tendencia esta semana"
                                seeAllTo="/trending">
                    {trendingLoading
                        ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                        : trending?.data?.map((recipe, i) => (
                            <RecipeCard key={recipe.id}
                                        recipe={recipe}
                                        badge={{ label: `#${i + 1} trending`, variant: 'trending' }}/>
                        ))
                    }
                </HorizontalScroll>
            </section>

            {/* cta para usuarios no logueados */}
            {!user && (
                <div className={styles.loginCta}>
                    <span className="material-symbols-outlined">auto_awesome</span>
                    <div>
                        <h3>Recomendaciones personalizadas</h3>
                        <p>
                            Inicia sesión para ver recetas basadas en tu heladera y tus gustos.
                        </p>
                    </div>
                    <a href="/login" className={styles.loginBtn}>Iniciar sesión</a>
                </div>
            )}
        </div>
    )
}

// Sub-componentes
function RecommendationMeta({ meta }) {
    const { fridgeItems, ratings, savedRecipes, following } = meta.basedOn
    const signals = []

    if (fridgeItems > 0) signals.push(`${fridgeItems} ingredientes en tu heladera`)
    if (ratings > 0) signals.push(`${ratings} recetas que puntuaste`)
    if (savedRecipes > 0) signals.push(`${savedRecipes} recetas guardadas`)
    if (following > 0) signals.push(`${following} usuarios que seguís`)

    if (signals.length === 0) return null

    return (
        <div className={styles.meta}>
            <span className="material-symbols-outlined">info</span>
            <p>Basado en: {signals.join(' · ')}</p>
        </div>
    )
}

function EmptyFridgeMatch() {
    return (
        <div className={styles.emptyFridge}>
            <span className="material-symbols-outlined">kitchen</span>
            <p>Agrega ingredientes a tu heladera para ver que podés cocinar</p>
            <a href="/fridge" className={styles.fridgeLink}>Ir a mi heladera →</a>
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
                <div className={styles.skeletonLine} style={{ width: '40%' }} />
            </div>
        </div>
    )
}

// Helpers
function getPersonalizedBadge(scores) {
    if (!scores) return null

    // el badge refleja la razon principal de la recomendacion
    if (scores.ingredientMatch > 0.7) {
        return { label: 'Tenés los ingredientes', variant: 'match', icon: 'kitchen' }
    }
    if (scores.socialScore > 0.5) {
        return { label: 'Popular en tu red', variant: 'social', icon: 'group' }
    }
    if (scores.tasteMatch > 0.7) {
        return { label: 'A tu gusto', variant: 'trending', icon: 'favorite' }
    }
    return null
}