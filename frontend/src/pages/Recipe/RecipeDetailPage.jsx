import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '../../hooks/useApi.js'
import { recipesService } from '../../services/recipes.service.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useState } from 'react'
import styles from './RecipeDetailPage.module.css'
import CommentSection from '../../components/ui/CommentSection.jsx'
import { recommendationsService } from '../../services/recommendations.service.js'
import HorizontalScroll from '../../components/ui/HorizontalScroll.jsx'
import RecipeCard from '../../components/ui/RecipeCard.jsx'

const CATEGORY_LABEL = {
    BREAKFAST: 'Desayuno',
    LUNCH: 'Almuerzo',
    DINNER: 'Cena',
    SNACK: 'Snack',
    DESSERT: 'Postre',
    DRINK: 'Bebida',
    APPETIZER: 'Entrada'
}

const DIFFICULTY_LABEL = {
    EASY: 'Fácil',
    MEDIUM: 'Intermedio',
    HARD: 'Difícil',
}

const UNIT_LABEL = {
    GRAM: 'g', KILOGRAM: 'kg', OUNCE: 'oz', POUND: 'lb',
    MILLILITER: 'ml', LITER: 'L', TEASPOON: 'cdta',
    TABLESPOON: 'cda', CUP: 'taza', FLUID_OUNCE: 'fl oz',
    UNIT: 'u', SLICE: 'rebanada', PINCH: 'pizca', TO_TASTE: 'a gusto',
}

export default function RecipeDetailPage() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate() 

    const { data: recipe, loading, error, refetch } = useQuery(
        () => recipesService.getById(id), [id]
    )

    const { mutate: toggleSave, loading: saving } = useMutation(
        () => recipe?.savedBy?.length
          ? recipesService.unsave(id)
          : recipesService.save(id)
    )

    const { data: similar } = useQuery(
        () => recommendationsService.getSimilar(id, 6),
        [id]
    )

    const { mutate: submitRating } = useMutation(
        (score) => recipesService.rate(id, score)
    )

    if (loading) return <RecipeDetailSkeleton />
    if (error) return <ErrorState message="No pudimos cargar esta receta." />
    if (!recipe) return null

    const isSaved = recipe.savedBy?.length > 0
    const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes
    const isAuthor = user?.id === recipe.author?.id 

    async function handleSave() {
        if (!user) return
        await toggleSave()
        refetch()
    }

    async function handleRate(score) {
        if (!user) return
        await submitRating(score)
        refetch()
    }

    return (
        <article className={styles.page}>

          {/* hero */}
          <section className={styles.hero}>
              {recipe.imageUrl
                ? <img src={recipe.imageUrl} alt={recipe.title} className={styles.heroImg} />
                : <div className={styles.heroPlaceholder} />
              }
              <div className={styles.heroOverlay}>
                    <div className={styles.heroBadges}>
                        <span className={styles.badge}>  {CATEGORY_LABEL[recipe.meal?.category]} </span>
                        {recipe.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className={styles.badgeOutline}>{tag}</span>
                        ))}
                    </div>
                    <h1 className={styles.heroTitle}>{recipe.title}</h1>

                    {/* autor, privada, rating */}
                    <div className={styles.heroMeta}>
                        <span className={styles.authorChip}>
                            <Link
                                to={`/profile/${recipe.author.username}`}
                                className={styles.authorLink}
                            >
                                {recipe.author.avatarUrl && (
                                    <img
                                        src={recipe.author.avatarUrl}
                                        alt={recipe.author.username}
                                        className={styles.authorAvatar}
                                    />
                                )}
                                <span>{recipe.author.displayName ?? recipe.author.username}</span>
                            </Link>
                        </span>

                        {recipe.averageRating && (
                            <span className={styles.ratingChip}>
                                ★ {recipe.averageRating}
                                <span className={styles.ratingCount}>({recipe.ratingCount})</span>
                            </span>
                        )}

                        {!recipe.isPublic && (
                            <span className={styles.privateBadge}>
                                <span className="material-symbols-outlined"
                                    style={{ fontSize: '14px', lineHeight: 1 }}> lock </span>
                                Privada
                            </span>
                        )}
                    </div>
              </div>
          </section>

          {/* acciones, guardar + editar (solo autor) */}
          {user && (
              <div className={styles.actions}>
                  <button
                      className={`${styles.actionBtn} ${isSaved ? styles.saved : ''}`}
                      onClick={handleSave}
                      disabled={saving}
                  >
                      <span className="material-symbols-outlined">
                          {isSaved ? 'bookmark' : 'bookmark_border'}
                      </span>
                      {isSaved ? 'Guardada' : 'Guardar'}
                  </button>

                  {/* solo visible para el autor */}
                  {isAuthor && (
                      <button
                          className={styles.actionBtn}
                          onClick={() => navigate(`/recipes/${id}/edit`)}
                      >
                          <span className="material-symbols-outlined">edit</span>
                          Editar receta
                      </button>
                  )}
              </div>
          )}

          <div className={styles.body}>
              {/* columna izquierda */}
              <div className={styles.sidebar}>

                  <div className={styles.statsGrid}>
                      <Stat icon="schedule" label="Prep" value={`${recipe.prepTimeMinutes} min`} />
                      <Stat icon="local_fire_department" label="Cocción" value={`${recipe.cookTimeMinutes} min`} />
                      <Stat icon="timer" label="Total" value={`${totalTime} min`} />
                      <Stat icon="restaurant" label="Porciones" value={recipe.servings} />
                  </div>

                  <div className={styles.difficultyRow}>
                      <span className={`${styles.difficultyBadge} ${styles[recipe.difficulty.toLowerCase()]}`}>
                          {DIFFICULTY_LABEL[recipe.difficulty]}
                      </span>
                  </div>

                  <p className={styles.description}>{recipe.description}</p>

                  <div className={styles.ingredientsSection}>
                      <h2 className={styles.sectionTitle}>Ingredientes</h2>
                      <ul className={styles.ingredientList}>
                          {recipe.ingredients?.map(ri => (
                              <IngredientRow key={ri.id} item={ri} />
                          ))}
                      </ul>
                  </div>

                  {user && (
                      <div className={styles.ratingSection}>
                          <h3 className={styles.sectionTitle}>Tu puntuación</h3>
                          <StarRating onRate={handleRate} />
                      </div>
                  )}
              </div>

              {/* columna derecha: pasos */}
              <div className={styles.stepsSection}>
                  <h2 className={styles.sectionTitle}>Preparación</h2>
                  <ol className={styles.stepsList}>
                      {recipe.steps?.map(step => (
                          <StepCard key={step.id} step={step} />
                      ))}
                  </ol>
              </div>
          </div>

          <CommentSection recipeId={id} />

          {similar?.data?.length > 0 && (
              <section style={{ marginTop: '48px' }}>
                  <HorizontalScroll title="También te puede gustar">
                      {similar.data.map(recipe => (
                          <RecipeCard key={recipe.id} recipe={recipe} />
                      ))}
                  </HorizontalScroll>
              </section>
          )}
        </article>
    )
}

// subcomponentes
function Stat({ icon, label, value }) {
    return (
        <div className={styles.stat}>
            <span className={`material-symbols-outlined ${styles.statIcon}`}>{icon}</span>
            <span className={styles.statLabel}>{label}</span>
            <span className={styles.statValue}>{value}</span>
        </div>
    )
}

function IngredientRow({ item }) {
    const [checked, setChecked] = useState(false)
    return (
        <li
            className={`${styles.ingredientRow} ${checked ? styles.checked : ''}`}
            onClick={() => setChecked(v => !v)}
        >
            <span className={styles.ingredientCheck}>{checked ? '✓' : ''}</span>
            <span className={styles.ingredientName}>{item.ingredient.name}</span>
            <span className={styles.ingredientQty}>
                {item.quantity} {UNIT_LABEL[item.unit]}
                {item.notes && <em> — {item.notes}</em>}
            </span>
        </li>
    )
}

function StepCard({ step }) {
    const [done, setDone] = useState(false)
    return (
        <li className={`${styles.step} ${done ? styles.stepDone : ''}`}>
            <div className={styles.stepNumber} onClick={() => setDone(v => !v)}>
                {done ? '✓' : step.order}
            </div>
            <div className={styles.stepContent}>
                <h4 className={styles.stepTitle}>{step.title}</h4>
                <p className={styles.stepDesc}>{step.description}</p>
                {step.durationMin && (
                    <span className={styles.stepDuration}>⏱ {step.durationMin} min</span>
                )}
                {step.imageUrl && (
                    <img src={step.imageUrl} alt={step.title} className={styles.stepImg} />
                )}
            </div>
        </li>
    )
}

function StarRating({ onRate }) {
    const [hovered, setHovered]   = useState(0)
    const [selected, setSelected] = useState(0)

    function handleClick(score) {
        setSelected(score)
        onRate(score)
    }

    return (
        <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map(n => (
                <button
                    key={n}
                    className={`${styles.star} ${n <= (hovered || selected) ? styles.starFilled : ''}`}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => handleClick(n)}
                    aria-label={`Puntuar ${n} de 5`}
                >
                    ★
                </button>
            ))}
        </div>
    )
}

function RecipeDetailSkeleton() {
    return (
        <div className={styles.skeleton}>
            <div className={styles.skeletonHero} />
            <div className={styles.skeletonBody}>
                {[1, 2, 3].map(i => <div key={i} className={styles.skeletonLine} />)}
            </div>
        </div>
    )
}

function ErrorState({ message }) {
    return (
        <div className={styles.errorState}>
            <span className="material-symbols-outlined">error</span>
            <p>{message}</p>
        </div>
    )
}