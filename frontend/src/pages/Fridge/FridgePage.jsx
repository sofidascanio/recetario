import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useMutation } from '../../hooks/useApi.js'
import { fridgeService } from '../../services/fridge.service.js'
import styles from './FridgePage.module.css'

const UNIT_SHORT = {
    GRAM: 'g', KILOGRAM: 'kg', OUNCE: 'oz', POUND: 'lb',
    MILLILITER: 'ml', LITER: 'L', TEASPOON: 'cdta', TABLESPOON: 'cda',
    CUP: 'taza', FLUID_OUNCE: 'fl oz', UNIT: 'u', SLICE: 'rebanada',
    PINCH: 'pizca', TO_TASTE: 'a gusto',
}

const UNIT_OPTIONS = [
    ['UNIT','Unidades'], ['GRAM','Gramos'], ['KILOGRAM','Kilogramos'],
    ['MILLILITER','Mililitros'], ['LITER','Litros'], ['TEASPOON','Cucharaditas'],
    ['TABLESPOON','Cucharadas'], ['CUP','Tazas'], ['SLICE','Rebanadas'],
    ['PINCH','Pizca'], ['TO_TASTE','A gusto'],
]

export default function FridgePage() {
    const [showForm, setShowForm] = useState(false)

    const { data: items, loading, refetch } = useQuery(
        () => fridgeService.getItems(), []
    )

    // Agrupar por estado de vencimiento
    const grouped = groupByExpiry(items || [])

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Mi Heladera</h1>
                    <p className={styles.subtitle}>{items?.length || 0} ingredientes</p>
                </div>
                <button className={styles.addBtn}
                        onClick={() => setShowForm(true)}>
                    <span className="material-symbols-outlined">add</span>
                    Agregar
                </button>
              </div>

              {/* stats */}
              <div className={styles.statsRow}>
                <StatChip
                  icon="inventory_2"
                  label="Total"
                  value={items?.length || 0}
                  color="primary"
                />
                <StatChip
                  icon="timer"
                  label="Vencen pronto"
                  value={grouped.expiringSoon.length}
                  color="warning"
                />
                <StatChip
                  icon="error"
                  label="Vencidos"
                  value={grouped.expired.length}
                  color="error"
                />
              </div>

              {loading && <p className={styles.state}>Cargando...</p>}

              {/* lista agrupada */}
              {grouped.expired.length > 0 && (
                <FridgeGroup title="Vencidos"
                            items={grouped.expired}
                            onRefetch={refetch}
                            variant="error"/>
              )}
              {grouped.expiringSoon.length > 0 && (
                  <FridgeGroup title="Vencen pronto (3 días)"
                              items={grouped.expiringSoon}
                              onRefetch={refetch}
                              variant="warning"/>
              )}
              {grouped.fresh.length > 0 && (
                  <FridgeGroup title="Frescos"
                              items={grouped.fresh}
                              onRefetch={refetch}
                              variant="ok"/>
              )}
              {grouped.noExpiry.length > 0 && (
                  <FridgeGroup title="Sin fecha de vencimiento"
                              items={grouped.noExpiry}
                              onRefetch={refetch}
                              variant="neutral"/>
              )}

              {!loading && items?.length === 0 && (
                  <EmptyFridge onAdd={() => setShowForm(true)} />
              )}

              {/* modal para agregar */}
              {showForm && (
                  <AddItemModal onClose={() => setShowForm(false)}
                                onSuccess={() => { setShowForm(false); refetch() }}/>
              )}
        </div>
    )
}

// grupo de items
function FridgeGroup({ title, items, onRefetch, variant }) {
    return (
        <section className={styles.group}>
            <h2 className={`${styles.groupTitle} ${styles[`group_${variant}`]}`}>
                {title}
            </h2>
            <ul className={styles.itemList}>
                {items.map(item => (
                  <FridgeItem key={item.id} item={item} onRefetch={onRefetch} />
                ))}
            </ul>
        </section>
    )
}

// item individual
function FridgeItem({ item, onRefetch }) {
    const { mutate: deleteItem, loading } = useMutation(
        () => fridgeService.deleteItem(item.id)
    )

    async function handleDelete() {
        if (!confirm(`¿Eliminar ${item.ingredient.name}?`)) return
        await deleteItem()
        onRefetch()
    }

    const expiryLabel = getExpiryLabel(item.expiresAt)

    return (
        <li className={styles.item}>
            <div className={styles.itemIcon}>
                <span className="material-symbols-outlined">nutrition</span>
            </div>
            <div className={styles.itemBody}>
                <span className={styles.itemName}>{item.ingredient.name}</span>
                <span className={styles.itemQty}>
                    {item.quantity} {UNIT_SHORT[item.unit]}
                </span>
                {expiryLabel && (
                  <span className={`${styles.itemExpiry} ${styles[expiryLabel.variant]}`}>
                      {expiryLabel.text}
                  </span>
                )}
            </div>
            <button className={styles.deleteBtn}
                onClick={handleDelete}
                disabled={loading}
                aria-label="Eliminar">
                <span className="material-symbols-outlined">delete</span>
            </button>
        </li>
    )
}

// modal para agregar item
function AddItemModal({ onClose, onSuccess }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [selected, setSelected] = useState(null)
    const [quantity, setQuantity] = useState('')
    const [unit, setUnit] = useState('UNIT')
    const [expiresAt, setExpiresAt] = useState('')
    const [searching, setSearching] = useState(false)

    const [dropdownOpen, setDropdownOpen] = useState(false)
    const searchRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(e) {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const { mutate: addItem, loading } = useMutation(
        (data) => fridgeService.addItem(data)
    )

    const search = useCallback(async (q) => {
        if (q.length < 2) { setResults([]); return }
        setSearching(true)
        try {
            const data = await fridgeService.searchIngredients(q)
            setResults(data)
        } finally { setSearching(false) }
    }, [])

    async function handleQueryChange(e) {
        const q = e.target.value
        setQuery(q)
        setSelected(null)
        if (q.length < 2) { setResults([]); setDropdownOpen(false); return }
        setSearching(true)
        try {
            const data = await fridgeService.searchIngredients(q)
            setResults(data)
            setDropdownOpen(true)
        } finally { setSearching(false) }
    }

    async function handleSelect(ingredient) {
        setSelected(ingredient)
        setQuery(ingredient.name)
        setResults([])
        setDropdownOpen(false)
    }

    async function handleCreateNew() {
        const ingredient = await fridgeService.createIngredient(query)
        setSelected(ingredient)
        setResults([])
        setDropdownOpen(false)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!selected) return

        await addItem({
            ingredientId: selected.id,
            quantity: Number(quantity),
            unit,
            expiresAt: expiresAt || null,
        })
        onSuccess()
    }

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Agregar ingrediente</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>

                    {/* busqueda de ingrediente */}
                    <div className={styles.field}>
                        <label>Ingrediente</label>
                        <div className={styles.searchWrapper} ref={searchRef}>
                            <input value={query}
                                onChange={handleQueryChange}
                                placeholder="Ej: Tomate, Harina..."
                                autoFocus/>
                            {searching && <span className={styles.searchSpinner} />}

                            {/* resultados */}
                            {dropdownOpen && (results.length > 0 || query.length >= 2) && (
                                <ul className={styles.searchResults}>
                                    {results.map(r => (
                                        <li key={r.id} onClick={() => handleSelect(r)}>{r.name}</li>
                                    ))}
                                    <li className={styles.createNew} onClick={handleCreateNew}>
                                        <span className="material-symbols-outlined">add</span>
                                        Crear "{query}"
                                    </li>
                                </ul>
                            )}
                        </div>

                        {selected && (
                            <div className={styles.selectedChip}>✓ {selected.name}</div>
                        )}
                    </div>

                    {/* cantidad y unidad */}
                    <div className={styles.row}>
                        <div className={styles.field} style={{ flex: 1 }}>
                            <label>Cantidad</label>
                            <input type="number"
                                  min="0"
                                  step="0.1"
                                  value={quantity}
                                  onChange={e => setQuantity(e.target.value)}
                                  placeholder="500"
                                  required/>
                        </div>
                        <div className={styles.field} style={{ flex: 1 }}>
                            <label>Unidad</label>
                            <select value={unit} onChange={e => setUnit(e.target.value)}>
                                {UNIT_OPTIONS.map(([val, label]) => (
                                  <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* fecha de vencimiento */}
                    <div className={styles.field}>
                        <label>Vence el (opcional)</label>
                        <input type="date"
                              value={expiresAt}
                              onChange={e => setExpiresAt(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}/>
                    </div>

                    <button type="submit"
                            className={styles.submitBtn}
                            disabled={loading || !selected || !quantity}>
                        {loading ? 'Agregando...' : 'Agregar a la heladera'}
                    </button>
                </form>
            </div>
        </div>
    )
}

// componentes menores
function StatChip({ icon, label, value, color }) {
    return (
        <div className={`${styles.statChip} ${styles[`chip_${color}`]}`}>
            <span className="material-symbols-outlined">{icon}</span>
            <div>
                <span className={styles.chipValue}>{value}</span>
                <span className={styles.chipLabel}>{label}</span>
            </div>
        </div>
    )
}

function EmptyFridge({ onAdd }) {
    return (
        <div className={styles.empty}>
            <span className="material-symbols-outlined">kitchen</span>
            <p>Tu heladera está vacía</p>
            <button onClick={onAdd} className={styles.addBtn}>
                Agregar primer ingrediente
            </button>
        </div>
    )
}

// ── Helpers ──────────────────────────────────────────

function groupByExpiry(items) {
    const now   = new Date()
    const soon  = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

    return items.reduce((acc, item) => {
        if (!item.expiresAt) acc.noExpiry.push(item)
        else if (new Date(item.expiresAt) < now) acc.expired.push(item)
        else if (new Date(item.expiresAt) < soon) acc.expiringSoon.push(item)
        else acc.fresh.push(item)
        return acc
    }, { expired: [], expiringSoon: [], fresh: [], noExpiry: [] })
}

function getExpiryLabel(expiresAt) {
  if (!expiresAt) return null
    const now   = new Date()
    const date  = new Date(expiresAt)
    const days  = Math.ceil((date - now) / (1000 * 60 * 60 * 24))

    if (days < 0)  return { text: 'Vencido', variant: 'expiryError'   }
    if (days === 0) return { text: 'Vence hoy', variant: 'expiryWarning' }
    if (days === 1) return { text: 'Vence mañana', variant: 'expiryWarning' }
    if (days <= 3)  return { text: `Vence en ${days} días`, variant: 'expiryWarning' }
    return { text: `${days} días`, variant: 'expiryOk' }
}