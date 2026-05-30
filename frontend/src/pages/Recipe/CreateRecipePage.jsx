import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useRecipeForm } from '../../hooks/useRecipeForm.js'
import { fridgeService } from '../../services/fridge.service.js'
import api from '../../services/api.js'
import styles from './CreateRecipePage.module.css'
import ImageUploader from '../../components/ui/ImageUploader.jsx'

const UNIT_SHORT = {
    GRAM:'g', KILOGRAM:'kg', OUNCE:'oz', POUND:'lb',
    MILLILITER:'ml', LITER:'L', TEASPOON:'cdta', TABLESPOON:'cda',
    CUP:'taza', FLUID_OUNCE:'fl oz', UNIT:'u', SLICE:'rebanada',
    PINCH:'pizca', TO_TASTE:'a gusto',
}

const UNIT_OPTIONS = [
    ['UNIT','Unidades'], ['GRAM','Gramos'], ['KILOGRAM','Kg'],
    ['MILLILITER','ml'], ['LITER','Litros'], ['TEASPOON','Cdta'],
    ['TABLESPOON','Cda'], ['CUP','Tazas'], ['SLICE','Rebanadas'],
    ['PINCH','Pizca'], ['TO_TASTE','A gusto'],
]

export default function CreateRecipePage() {
    const navigate = useNavigate()
    const form = useRecipeForm()

    return (
        <div className={styles.page}>

            {/* encabezado con progreso */}
            <div className={styles.header}>
              <h1 className={styles.title}>Nueva receta</h1>
              <StepIndicator current={form.step} total={3} />
            </div>

            {/* error global */}
            {form.errors._global && (
              <div className={styles.errorBanner}>{form.errors._global}</div>
            )}

            {/* pasos */}
            {form.step === 1 && <StepOne form={form} />}
            {form.step === 2 && <StepTwo form={form} />}
            {form.step === 3 && <StepThree form={form} />}

            {/* navegacion */}
            <div className={styles.nav}>
                {form.step > 1 && (
                    <button className={styles.backBtn} onClick={form.prevStep}>
                      ← Anterior
                    </button>
                )}
                <div style={{ flex: 1 }} />
                {form.step < 3 ? (
                  <button className={styles.nextBtn} onClick={form.nextStep}>
                    Siguiente →
                  </button>
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

// paso 1: info general
function StepOne({ form }) {
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
                    placeholder="Ej: Pizza Margherita Clásica"/>
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

// paso 2: ingredientes
function StepTwo({ form }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [dropdownOpen, setDropdownOpen] = useState(false)  
    const [qty, setQty] = useState('')
    const [unit, setUnit] = useState('UNIT')
    const [notes, setNotes] = useState('')
    const [selected, setSelected] = useState(null)
    const searchRef = useRef(null) 

    // cerrar al clickear afuera
    useEffect(() => {
        function handleClickOutside(e) {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    async function handleSearch(q) {
        setQuery(q)
        setSelected(null)
        if (q.length < 2) { setResults([]); setDropdownOpen(false); return }
        const data = await fridgeService.searchIngredients(q)
        setResults(data)
        setDropdownOpen(true) 
    }

    async function handleSelect(ing) {
        setSelected(ing)
        setQuery(ing.name)
        setResults([])
        setDropdownOpen(false)
    }

    async function handleCreateAndSelect() {
        const ing = await fridgeService.createIngredient(query)
        setSelected(ing)
        setResults([])
        setDropdownOpen(false) 
    }

    function handleAdd() {
        if (!selected || !qty) return
        form.addIngredient({
            ingredientId: selected.id,
            ingredientName: selected.name,
            quantity: Number(qty),
            unit,
            notes: notes.trim() || undefined,
        })
        setQuery(''); setQty(''); setNotes(''); setSelected(null); setResults([])
    }

    return (
        <div className={styles.step}>
            <h2 className={styles.stepTitle}>Ingredientes</h2>

            {form.errors.ingredients && (
              <p className={styles.fieldError}>{form.errors.ingredients}</p>
            )}

            {/* buscador */}
            <div className={styles.ingSearch}>
                <div className={styles.searchRow}>
                        <div className={styles.searchField} ref={searchRef}>
                            <input value={query}
                                onChange={e => handleSearch(e.target.value)}
                                placeholder="Buscar ingrediente..."/>
                            {dropdownOpen && (results.length > 0 || query.length >= 2) && (
                                <ul className={styles.searchDropdown}>
                                    {results.map(r => (
                                        <li key={r.id} onClick={() => handleSelect(r)}>{r.name}</li>
                                    ))}
                                    <li className={styles.createNew} onClick={handleCreateAndSelect}>
                                        <span className="material-symbols-outlined">add</span>
                                        Crear "{query}"
                                    </li>
                                </ul>
                            )}
                        </div>
                    <input className={styles.qtyInput}
                          type="number" min="0" step="0.1"
                          value={qty}
                          onChange={e => setQty(e.target.value)}
                          placeholder="Cant." />
                    <select className={styles.unitSelect}
                            value={unit}
                            onChange={e => setUnit(e.target.value)}>
                        {UNIT_OPTIONS.map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                        ))}
                    </select>
                </div>

                <input value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder='Nota (ej: "picado fino") (opcional)'
                      className={styles.notesInput}/>

                <button type="button"
                        className={styles.addIngBtn}
                        onClick={handleAdd}
                        disabled={!selected || !qty}>
                    + Agregar ingrediente
                </button>
            </div>

            {/* lista de ingredientes agregados */}
            {form.data.ingredients.length > 0 && (
                <ul className={styles.ingList}>
                    {form.data.ingredients.map((ing, i) => (
                        <li key={i} className={styles.ingItem}>
                            <span className={styles.ingOrder}>{ing.order}</span>
                            <div className={styles.ingInfo}>
                                <span className={styles.ingName}>{ing.ingredientName}</span>
                                <span className={styles.ingMeta}>
                                    {ing.quantity} {UNIT_SHORT[ing.unit]}
                                    {ing.notes && ` — ${ing.notes}`}
                                </span>
                            </div>
                            <button className={styles.removeBtn}
                                    onClick={() => form.removeIngredient(i)}
                                    aria-label="Eliminar">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

// paso 3: pasos
function StepThree({ form }) {
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

// componentes compartidos
function StepIndicator({ current, total }) {
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

function Field({ label, error, children }) {
    return (
        <div className={styles.field}>
            {label && <label className={styles.label}>{label}</label>}
            {children}
            {error && <span className={styles.fieldError}>{error}</span>}
        </div>
    )
}