import { useState, useEffect, useRef } from 'react'
import api from '../../services/api.js'
import ImageUploader from '../ui/ImageUploader.jsx'
import { fridgeService } from '../../services/fridge.service.js'
import { Field } from './Field.jsx'
import { UNIT_SHORT, UNIT_OPTIONS } from './constants.js'
import styles from './RecipeForm.module.css'

export function StepTwo({ form }) {
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