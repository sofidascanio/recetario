import { useState, useEffect } from 'react'
import api from '../../services/api.js'
import ImageUploader from '../ui/ImageUploader.jsx'
import { Field } from './Field.jsx'
import styles from './RecipeForm.module.css'

export function StepThree({ form }) {
    return (
        <div className={styles.step}>
            <div className={styles.stepsHeader}>
                <h2 className={styles.stepTitle}>Pasos de preparación</h2>
                <button type="button"
                        className={styles.addStepBtn}
                        onClick={form.addStep}>
                    + Agregar paso
                </button>
            </div>

            {form.errors.steps && (
                <p className={styles.fieldError}>{form.errors.steps}</p>
            )}

            {form.data.steps.length === 0 && (
                <div className={styles.emptySteps}>
                    <span className="material-symbols-outlined">format_list_numbered</span>
                    <p>Agrega el primer paso para continuar</p>
                </div>
            )}

            <ol className={styles.stepsList}>
                {form.data.steps.map((s, i) => (
                    <li key={i} className={styles.stepItem}>
                        <div className={styles.stepItemHeader}>
                            <span className={styles.stepNum}>{s.order}</span>
                            <button className={styles.removeBtn}
                                    onClick={() => form.removeStep(i)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <Field label="Título del paso *"
                            error={form.errors[`step_title_${i}`]}>
                            <input value={s.title}
                                onChange={e => form.updateStep(i, 'title', e.target.value)}
                                placeholder="Ej: Preparar la masa"/>
                        </Field>

                        <Field label="Descripción *"
                            error={form.errors[`step_desc_${i}`]}>
                            <textarea value={s.description}
                                    onChange={e => form.updateStep(i, 'description', e.target.value)}
                                    placeholder="Explica detalladamente como realizar este paso..."
                                    rows={3}
                            />
                        </Field>

                        <Field label="Imagen del paso (opcional)">
                            <ImageUploader value={s.imageUrl || ''}
                                        onChange={url => form.updateStep(i, 'imageUrl', url || '')}
                                        uploadType="step"
                                        aspectRatio="4/3"/>
                        </Field>


                        <Field label="Duración estimada (min)">
                        <input type="number" min="1"
                                value={s.durationMin}
                                onChange={e => form.updateStep(i, 'durationMin', e.target.value)}
                                placeholder="Opcional"
                                className={styles.durationInput}/>
                        </Field>
                    </li>
                ))}
            </ol>
        </div>
    )
}