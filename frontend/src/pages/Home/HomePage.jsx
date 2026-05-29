import { useRecipeSearch } from '../../hooks/useRecipeSearch.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useQuery } from '../../hooks/useApi.js'
import { recipesService } from '../../services/recipes.service.js'
import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'

const CATEGORIES = [
  { value: '',  label: 'Todas' },
  { value: 'BREAKFAST', label: 'Desayuno' },
  { value: 'LUNCH', label: 'Almuerzo' },
  { value: 'DINNER', label: 'Cena' },
  { value: 'SNACK', label: 'Snack' },
  { value: 'DESSERT', label: 'Postre' },
  { value: 'DRINK', label: 'Bebida' },
]

const DIFFICULTIES = [
  { value: '', label: 'Cualquier dificultad' },
  { value: 'EASY', label: 'Fácil' },
  { value: 'MEDIUM', label: 'Intermedio' },
  { value: 'HARD', label: 'Difícil' },
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'popular', label: 'Más guardadas' },
  { value: 'rating', label: 'Mejor puntuadas'},
]

const DIFF_LABEL = { EASY: 'Fácil', MEDIUM: 'Medio', HARD: 'Difícil' }

const CAT_LABEL = {
  BREAKFAST: 'Desayuno', LUNCH: 'Almuerzo', DINNER: 'Cena',
  SNACK: 'Snack', DESSERT: 'Postre', DRINK: 'Bebida', APPETIZER: 'Entrada',
}

export default function HomePage() {
    const { user } = useAuth()
    const search = useRecipeSearch()

    // feed de seguidos (solo si esta logueado)
    const { data: feed } = useQuery(
        () => user ? fetch('/api/v1/users/feed')
        .then(r => r.json()) : Promise.resolve(null),
        [user?.id]
    )

    return (
        <div className={styles.page}>

            {/* hero */}
            <section className={styles.hero}>
                <div className={styles.heroText}>
                    <h1 className={styles.heroTitle}>
                        {user ? `¡Hola, ${user.displayName.split(' ')[0]}!` : 'Recetario'}
                    </h1>
                    <p className={styles.heroSub}>
                        Descubri algo delicioso para cocinar hoy.
                    </p>
                </div>
                {user && (
                    <Link to="/recipes/new" className={styles.newRecipeBtn}>
                        <span className="material-symbols-outlined">add</span>
                        Nueva receta
                    </Link>
                )}
            </section>

            {/* feed de seguidos */}
            {user && feed?.data?.length > 0 && (
                <section className={styles.feedSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>De usuarios que seguís</h2>
                        <Link to="/feed" className={styles.seeAll}>Ver todo →</Link>
                    </div>
                    <div className={styles.feedScroll}>
                        {feed.data.slice(0, 6).map(recipe => (
                            <FeedCard key={recipe.id} recipe={recipe} />
                        ))}
                    </div>
                </section>
            )}

            {/* busqueda y filtros */}
            <section className={styles.searchSection}>

                {/* barra de busqueda */}
                <div className={styles.searchBar}>
                    <span className="material-symbols-outlined">search</span>
                    <input value={search.filters.search}
                            onChange={e => search.setFilter('search', e.target.value)}
                            placeholder="Buscar por nombre, ingrediente o tag..."
                            className={styles.searchInput}/>
                    {search.filters.search && (
                        <button className={styles.clearSearch}
                                onClick={() => search.setFilter('search', '')}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    )}
                </div>

                {/* categorias, chips horizontales */}
                <div className={styles.categoryScroll}>
                    {CATEGORIES.map(cat => (
                        <button key={cat.value}
                                className={`${styles.categoryChip} ${
                                    search.filters.category === cat.value ? styles.chipActive : ''
                        }`}
                        onClick={() => search.setFilter('category', cat.value)}>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* filtros secundarios */}
                <div className={styles.filterRow}>
                <select className={styles.filterSelect}
                        value={search.filters.difficulty}
                        onChange={e => search.setFilter('difficulty', e.target.value)}>
                    {DIFFICULTIES.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                </select>

                <select className={styles.filterSelect}
                        value={search.filters.sortBy}
                        onChange={e => search.setFilter('sortBy', e.target.value)}>
                    {SORT_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>

                {search.hasActiveFilters && (
                    <button className={styles.resetBtn}
                            onClick={search.resetFilters}>
                        <span className="material-symbols-outlined">filter_alt_off</span>
                        Limpiar
                    </button>
                )}
                </div>
            </section>

            {/* resultados */}
            <section>
                {/* contador de resultados */}
                {!search.loading && search.results && (
                    <div className={styles.resultsHeader}>
                        <p className={styles.resultsCount}>
                            {search.results.pagination.total === 0
                                ? 'Sin resultados'
                                : `${search.results.pagination.total} receta${search.results.pagination.total !== 1 ? 's' : ''}`
                            }
                        </p>
                    </div>
                )}

                {/* loading skeleton */}
                {search.loading && (
                    <div className={styles.grid}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <RecipeCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* sin resultados */}
                {!search.loading && search.results?.data.length === 0 && (
                    <EmptyResults hasFilters={search.hasActiveFilters}
                                onReset={search.resetFilters}/>
                )}

                {/* grid de recetas */}
                {!search.loading && search.results?.data.length > 0 && (
                    <div className={styles.grid}>
                        {search.results.data.map(recipe => (
                            <RecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                    </div>
                )}

                {/* paginacion */}
                {search.results?.pagination.totalPages > 1 && (
                    <Pagination pagination={search.results.pagination}
                                onPageChange={search.setPage}/>
                )}
            </section>
        </div>
    )
}

// componentes
function RecipeCard({ recipe }) {
    const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes
    const isSaved = recipe.savedBy?.length > 0

    return (
        <Link to={`/recipes/${recipe.id}`} className={styles.card}>
            <div className={styles.cardImgWrap}>
                {recipe.imageUrl
                    ? <img src={recipe.imageUrl} alt={recipe.title} className={styles.cardImg} />
                    : <div className={styles.cardImgPlaceholder} />
                }
                {isSaved && (
                <span className={styles.savedBadge}>
                    <span className="material-symbols-outlined">bookmark</span>
                </span>
                )}
                <span className={`${styles.diffBadge} ${styles[recipe.difficulty?.toLowerCase()]}`}>
                    {DIFF_LABEL[recipe.difficulty]}
                </span>
            </div>

            <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
                    <span className={styles.cardCategory}>
                        {CAT_LABEL[recipe.meal?.category] || recipe.meal?.category}
                    </span>
                    <span className={styles.cardTime}>⏱ {totalTime} min</span>
                </div>

                <h3 className={styles.cardTitle}>{recipe.title}</h3>

                <div className={styles.cardFooter}>
                    <div className={styles.cardAuthor}>
                        <div className={styles.cardAvatarSmall}>
                            {recipe.author?.avatarUrl
                                ? <img src={recipe.author.avatarUrl} alt="" />
                                : recipe.author?.displayName[0]
                            }
                        </div>
                        <span>{recipe.author?.displayName}</span>
                    </div>
                    <div className={styles.cardStats}>
                        <span>♥ {recipe._count?.savedBy}</span>
                        <span>💬 {recipe._count?.ratings}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

function FeedCard({ recipe }) {
    return (
        <Link to={`/recipes/${recipe.id}`} className={styles.feedCard}>
            {recipe.imageUrl
                ? <img src={recipe.imageUrl} alt={recipe.title} className={styles.feedCardImg} />
                : <div className={styles.feedCardImgPlaceholder} />
            }
            <div className={styles.feedCardBody}>
                <p className={styles.feedCardAuthor}>{recipe.author?.displayName}</p>
                <h4 className={styles.feedCardTitle}>{recipe.title}</h4>
            </div>
        </Link>
    )
}

function RecipeCardSkeleton() {
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

function EmptyResults({ hasFilters, onReset }) {
    return (
        <div className={styles.empty}>
            <span className="material-symbols-outlined">search_off</span>
            <p>{hasFilters
                ? 'No encontramos recetas con esos filtros.'
                : 'No hay recetas todavía.'
            }</p>
            {hasFilters && (
                <button className={styles.resetBtn} onClick={onReset}>
                    Limpiar filtros
                </button>
            )}
        </div>
    )
}

function Pagination({ pagination, onPageChange }) {
    const { page, totalPages } = pagination

    return (
        <div className={styles.pagination}>
            <button className={styles.pageBtn}
                    onClick={() => onPageChange(page - 1)}
                    disabled={!pagination.hasPrev}>
                ← Anterior
            </button>

            <div className={styles.pageNumbers}>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // ventana de 5 paginas centrada en la actual
                    let n
                    if (totalPages <= 5)  n = i + 1
                    else if (page <= 3) n = i + 1
                    else if (page >= totalPages - 2) n = totalPages - 4 + i
                    else n = page - 2 + i

                    return (
                        <button key={n}
                                className={`${styles.pageBtn} ${n === page ? styles.pageBtnActive : ''}`}
                                onClick={() => onPageChange(n)}>
                            {n}
                        </button>
                    )
                })}
            </div>

            <button className={styles.pageBtn}
                    onClick={() => onPageChange(page + 1)}
                    disabled={!pagination.hasNext}>
                Siguiente →
            </button>
        </div>
    )
}
