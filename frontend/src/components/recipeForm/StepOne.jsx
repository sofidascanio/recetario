import { useState, useEffect } from 'react'
import api from '../../services/api.js'
import ImageUploader from '../ui/ImageUploader.jsx'
import { Field } from './Field.jsx'
import styles from './RecipeForm.module.css'

export function StepOne({ form }) {
    const [meals, setMeals] = useState([])
    const [tagInput, setTagInput] = useState('')

    useEffect(() => {
        api.get('/meals').then(setMeals).catch(() => {})
    }, [])

    function handleTagKey(e) {
        if (e.key !== 'Enter' && e.key !== ',') return
        e.preventDefault()
        form.addTag(tagInput)
        setTagInput('')
    }

    return (
        <div className={styles.step}>
          <h2 className={styles.stepTitle}>Información general</h2>

          <Field label="Título *" error={form.errors.title}>
              <input value={form.data.title}
                    onChange={e => form.setField('title', e.target.value)}
                    placeholder="Ej: Pizza clasica"/>
          </Field>

          <Field label="Descripción *" error={form.errors.description}>
              <textarea value={form.data.description}
                        onChange={e => form.setField('description', e.target.value)}
                        placeholder="Conta brevemente de qué se trata tu receta..."
                        rows={3}/>
          </Field>

          <Field label="Comida *" error={form.errors.mealId}>
              <select value={form.data.mealId}
                      onChange={e => form.setField('mealId', e.target.value)}>
                  <option value="">Seleccioná una comida</option>
                  {meals.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
              </select>
              <p className={styles.fieldHint}>
                ¿No encontras tu comida?{' '}
                <button type="button"
                        className={styles.inlineBtn}
                        onClick={() => {
                          const name = prompt('Nombre de la nueva comida:')
                          if (name) api.post('/meals', { name, category: 'DINNER' }).then(m => {
                            setMeals(prev => [...prev, m])
                            form.setField('mealId', m.id)
                          })
                        }}>
                  Crear nueva
                </button>
              </p>
          </Field>

          {/* tiempos y porciones */}
          <div className={styles.row}>
              <Field label="Prep (min) *" error={form.errors.prepTimeMinutes}>
                <input type="number" min="0"
                      value={form.data.prepTimeMinutes}
                      onChange={e => form.setField('prepTimeMinutes', e.target.value)}
                      placeholder="30"/>
              </Field>
              <Field label="Cocción (min) *" error={form.errors.cookTimeMinutes}>
                <input type="number" min="0"
                      value={form.data.cookTimeMinutes}
                      onChange={e => form.setField('cookTimeMinutes', e.target.value)}
                      placeholder="15"/>
              </Field>
              <Field label="Porciones">
                <input type="number" min="1"
                      value={form.data.servings}
                      onChange={e => form.setField('servings', e.target.value)}/>
              </Field>
          </div>

          {/* dificultad */}
          <Field label="Dificultad">
              <div className={styles.difficultyPicker}>
                {[['EASY','Fácil'],['MEDIUM','Intermedio'],['HARD','Difícil']].map(([val, label]) => (
                  <button key={val}
                          type="button"
                          className={`${styles.diffBtn} ${form.data.difficulty === val ? styles.diffActive : ''}`}
                          onClick={() => form.setField('difficulty', val)}>
                      {label}
                  </button>
                ))}
              </div>
          </Field>

          {/* Visibilidad */}
          <Field label="Visibilidad">
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>
                    {form.data.isPublic ? ' Pública — todos pueden verla' : 'Privada — solo vos'}
                </span>
                <button type="button"
                        className={`${styles.toggle} ${form.data.isPublic ? styles.toggleOn : ''}`}
                        onClick={() => form.setField('isPublic', !form.data.isPublic)}
                        role="switch"
                        aria-checked={form.data.isPublic}>
                    <span className={styles.toggleThumb} />
                </button>
              </div>
          </Field>

          {/* tags */}
          <Field label="Tags (Enter o coma para agregar)">
            <input value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey}
                  placeholder="vegano, sin-gluten, rápido..."/>
            {form.data.tags.length > 0 && (
              <div className={styles.tagList}>
                  {form.data.tags.map(tag => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                        <button onClick={() => form.removeTag(tag)}>×</button>
                      </span>
                  ))}
              </div>
            )}
          </Field>

          {/* url de imagen */}
            <Field label="Imagen de la receta">
                <ImageUploader value={form.data.imageUrl}
                            onChange={url => form.setField('imageUrl', url || '')}
                            uploadType="recipe"
                            aspectRatio="16/9"
                            placeholder="Recomendado: 1200×800px o mayor"/>
            </Field>
        </div>
    )
}