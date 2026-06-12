import { useNavigate } from 'react-router-dom'
import { useRecipeForm } from '../../hooks/useRecipeForm.js'
import { StepOne } from '../../components/recipeForm/StepOne.jsx'
import { StepTwo } from '../../components/recipeForm/StepTwo.jsx'
import { StepThree } from '../../components/recipeForm/StepThree.jsx'
import { StepIndicator } from '../../components/recipeForm/StepIndicator.jsx'
import styles from './CreateRecipePage.module.css'

export default function CreateRecipePage() {
    const navigate = useNavigate()
    const form = useRecipeForm()

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Nueva receta</h1>
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
                            onClick={() => form.submit(navigate)}
                            disabled={form.submitting}>
                        {form.submitting ? 'Publicando...' : '✓ Publicar receta'}
                    </button>
                )}
            </div>
        </div>
    )
}