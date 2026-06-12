import styles from './RecipeForm.module.css'

export function Field({ label, error, children }) {
    return (
        <div className={styles.field}>
            {label && <label className={styles.label}>{label}</label>}
            {children}
            {error && <span className={styles.fieldError}>{error}</span>}
        </div>
    )
}