import styles from './RecipeForm.module.css'

export function StepIndicator({ current, total }) {
    return (
        <div className={styles.indicator}>
            {Array.from({ length: total }, (_, i) => i + 1).map(n => (
                <div key={n} className={styles.indicatorRow}>
                    <div className={`${styles.dot} ${n <= current ? styles.dotActive : ''} ${n < current ? styles.dotDone : ''}`}>
                        {n < current ? '✓' : n}
                    </div>
                    {n < total && (
                        <div className={`${styles.line} ${n < current ? styles.lineDone : ''}`} />
                    )}
                </div>
            ))}
        </div>
    )
}