import { recipesService } from '../../services/recipes.service.js'
import { useQuery } from '../../hooks/useApi.js'
import styles from './HomePage.module.css'

export default function HomePage() {
    const { data, loading, error } = useQuery(
        () => recipesService.list({ page: 1, limit: 12, sortBy: 'recent' }), []
    )

    if (loading) return <p className={styles.state}>Cargando recetas...</p>
    if (error) return <p className={styles.state}>Error al cargar recetas.</p>

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <h2 className={styles.heroTitle}>¡Hola, cocinero!</h2>
                <p className={styles.heroSub}>Descubri algo delicioso para cocinar hoy.</p>
            </section>

            <section>
                <h3 className={styles.sectionTitle}>Recetas recientes</h3>
                <div className={styles.grid}>
                    {data?.data.map(recipe => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            </section>
        </div>
    )
}

function RecipeCard({ recipe }) {
    return (
        <a href={`/recipes/${recipe.id}`} className={styles.card}>
        {recipe.imageUrl && (
            <img src={recipe.imageUrl} alt={recipe.title} className={styles.cardImg} />
        )}
        <div className={styles.cardBody}>
            <span className={styles.cardCategory}>
            {recipe.meal?.category}
            </span>
            <h4 className={styles.cardTitle}>{recipe.title}</h4>
            <div className={styles.cardMeta}>
                <span> {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</span>
                <span> {recipe.author?.displayName}</span>
            </div>
        </div>
        </a>
    )
}