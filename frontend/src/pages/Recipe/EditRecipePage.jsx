import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { useRecipeForm } from '../../hooks/useRecipeForm.js'
import { recipesService } from '../../services/recipes.service.js'
import { StepOne } from '../../components/recipeForm/StepOne.jsx'
import { StepTwo } from '../../components/recipeForm/StepTwo.jsx'
import { StepThree } from '../../components/recipeForm/StepThree.jsx'
import { StepIndicator } from '../../components/recipeForm/StepIndicator.jsx'
import styles from './CreateRecipePage.module.css'

export default function EditRecipePage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [recipe, setRecipe] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        recipesService.getById(id)
            .then(data => {
                if (data.author?.id !== user?.id) {
                    navigate(`/recipes/${id}`, { replace: true })
                    return
                }
                setRecipe(data)
            })
            .catch(() => setError('No se pudo cargar la receta'))
            .finally(() => setLoading(false))
    }, [id, user?.id, navigate])

    if (loading) return <LoadingState />
    if (error)   return <ErrorState message={error} onBack={() => navigate(-1)} />

    return <EditForm recipe={recipe} recipeId={id} />
}

function EditForm({ recipe, recipeId }) {
    const navigate = useNavigate()
    const form = useRecipeForm(recipe)

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <button className={styles.backLink} onClick={() => navigate(-1)}>← Volver</button>
                <h1 className={styles.title}>Editar receta</h1>
                <StepIndicator current={form.step} total={3} />
            </div>

            {form.errors._global && (
                <div className={styles.errorBanner}>{form.errors._global}</div>
            )}

            {form.step === 1 && <StepOne form={form} />}
            {form.step === 2 && <StepTwo form={form} />}
            {form.step === 3 && <StepThree form={form} />}

            <div className={styles.nav}>
                {form.step > 1 && (
                    <button className={styles.backBtn} onClick={form.prevStep}>← Anterior</button>
                )}
                <div style={{ flex: 1 }} />
                {form.step < 3 ? (
                    <button className={styles.nextBtn} onClick={form.nextStep}>Siguiente →</button>
                ) : (
                    <button className={styles.submitBtn}
                            onClick={() => form.submitUpdate(recipeId, navigate)}
                            disabled={form.submitting}>
                        {form.submitting ? 'Guardando...' : '✓ Guardar cambios'}
                    </button>
                )}
            </div>
        </div>
    )
}

function LoadingState() {
    return (
        <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>
                    hourglass_top
                </span>
                Cargando receta...
            </div>
        </div>
    )
}

function ErrorState({ message, onBack }) {
    return (
        <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, display: 'block', marginBottom: 12, color: 'var(--color-error)' }}>
                    error
                </span>
                <p style={{ marginBottom: 16 }}>{message}</p>
                <button className={styles.backBtn} onClick={onBack}>← Volver</button>
            </div>
        </div>
    )
}