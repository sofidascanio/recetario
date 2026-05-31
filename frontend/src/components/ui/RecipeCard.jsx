import { Link } from 'react-router-dom'
import styles from './RecipeCard.module.css'

const DIFF_LABEL = { EASY: 'Fácil', MEDIUM: 'Medio', HARD: 'Difícil' }

const CAT_LABEL  = {
    BREAKFAST: 'Desayuno', LUNCH: 'Almuerzo', DINNER: 'Cena',
    SNACK: 'Snack', DESSERT: 'Postre', DRINK: 'Bebida', APPETIZER: 'Entrada',
}

export default function RecipeCard({ recipe, badge, showMatch }) {
    const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes
    const isSaved   = recipe.savedBy?.length > 0

    return (
        <Link to={`/recipes/${recipe.id}`} className={styles.card}>

            {/* imagen */}
            <div className={styles.imgWrap}>
                {recipe.imageUrl
                    ? <img src={recipe.imageUrl} alt={recipe.title} className={styles.img} />
                    : <div className={styles.imgPlaceholder} />
                }

                {/* badge personalizado (ej: "95% match", "Trending") */}
                {badge && (
                    <span className={`${styles.badge} ${styles[badge.variant] || ''}`}>
                        {badge.icon && <span className="material-symbols-outlined">{badge.icon}</span>}
                        {badge.label}
                    </span>
                )}

                {/* badge de dificultad */}
                <span className={`${styles.diffBadge} ${styles[recipe.difficulty?.toLowerCase()]}`}>
                    {DIFF_LABEL[recipe.difficulty]}
                </span>

                {/* icono de guardado */}
                {isSaved && (
                    <span className={styles.savedIcon}>
                        <span className="material-symbols-outlined">bookmark</span>
                    </span>
                )}
            </div>

            {/* contenido */}
            <div className={styles.body}>
                <div className={styles.meta}>
                    <span className={styles.category}>
                        {CAT_LABEL[recipe.meal?.category] || recipe.meal?.category}
                    </span>
                    <span className={styles.time}>⏱ {totalTime} min</span>
                </div>

                <h3 className={styles.title}>{recipe.title}</h3>

                {/* barra de match de heladera */}
                {showMatch && recipe.matchPercentage != null && (
                    <div className={styles.matchBar}>
                        <div className={styles.matchFill} style={{ width: `${recipe.matchPercentage}%` }}/>
                        <span className={styles.matchLabel}>
                            {recipe.matchPercentage}% de ingredientes
                        </span>
                    </div>
                )}

                {/* ingredientes faltantes */}
                {showMatch && recipe.missingIngredients?.length > 0 && (
                    <p className={styles.missing}>
                        Falta: {recipe.missingIngredients.slice(0, 3).join(', ')}
                        {recipe.missingIngredients.length > 3 && ` +${recipe.missingIngredients.length - 3}`}
                    </p>
                )}

                {/* footer */}
                <div className={styles.footer}>
                    <div className={styles.author}>
                        <div className={styles.authorAvatar}>
                            {recipe.author?.avatarUrl
                                ? <img src={recipe.author.avatarUrl} alt="" />
                                : recipe.author?.displayName?.[0]
                            }
                        </div>
                        <span>{recipe.author?.displayName}</span>
                    </div>
                    <div className={styles.stats}>
                        {recipe._count?.ratings > 0 && (
                            <span>★ {recipe._count.ratings}</span>
                        )}
                        <span>♥ {recipe._count?.savedBy || 0}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}