import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { recipesService } from '../../services/recipes.service.js'
import styles from './RecipeCard.module.css'

const DIFF_LABEL = { EASY: 'Fácil', MEDIUM: 'Medio', HARD: 'Difícil' }

const CAT_LABEL = {
    BREAKFAST: 'Desayuno', LUNCH: 'Almuerzo', DINNER: 'Cena',
    SNACK: 'Snack', DESSERT: 'Postre', DRINK: 'Bebida', APPETIZER: 'Entrada',
}

export default function RecipeCard({ recipe, badge, showMatch }) {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [saved, setSaved] = useState(recipe.savedBy?.length > 0)
    const [saving, setSaving] = useState(false)

    const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes

    // navegar a la receta, lo hace el div wrapper, no un <Link>,
    // para que el boton de guardar pueda interceptar el click limpiamente
    function handleCardClick() {
        navigate(`/recipes/${recipe.id}`)
    }

    async function handleSave(e) {
        // stopPropagation evita que el click llegue al div padre y navegue
        e.stopPropagation()

        if (!user) {
            navigate('/login')
            return
        }

        setSaving(true)
        try {
            const res = await recipesService.toggleSave(recipe.id)
            setSaved(res.saved)
        } catch {
            // icono queda en estado anterior
        } finally {
            setSaving(false)
        }
    }

    return (
        <div
            className={styles.card}
            onClick={handleCardClick}
            role="article"
            style={{ cursor: 'pointer' }}
        >
            {/* imagen */}
            <div className={styles.imgWrap}>
                {recipe.imageUrl
                    ? <img src={recipe.imageUrl} alt={recipe.title} className={styles.img} />
                    : <div className={styles.imgPlaceholder} />
                }

                {/* badge personalizado */}
                {badge && (
                    <span className={`${styles.badge} ${styles[badge.variant] || ''}`}>
                        {badge.icon && (
                            <span className="material-symbols-outlined">{badge.icon}</span>
                        )}
                        {badge.label}
                    </span>
                )}

                {/* badge de dificultad */}
                <span className={`${styles.diffBadge} ${styles[recipe.difficulty?.toLowerCase()]}`}>
                    {DIFF_LABEL[recipe.difficulty]}
                </span>

                {/* botón guardar, arriba a la derecha */}
                <button
                    className={`${styles.saveBtn} ${saved ? styles.saveBtnActive : ''}`}
                    onClick={handleSave}
                    disabled={saving}
                    aria-label={saved ? 'Quitar de guardados' : 'Guardar receta'}
                >
                    <span
                        className="material-symbols-outlined"
                        style={{
                            fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0",
                            fontSize: '18px',
                        }}
                    >
                        bookmark
                    </span>
                </button>
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
                        <div
                            className={styles.matchFill}
                            style={{ width: `${recipe.matchPercentage}%` }}
                        />
                        <span className={styles.matchLabel}>
                            {recipe.matchPercentage}% de ingredientes
                        </span>
                    </div>
                )}

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
        </div>
    )
}