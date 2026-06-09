import { useState, useCallback } from 'react'
import { recipesService } from '../services/recipes.service.js'

const EMPTY_STATE = {
    // paso 1
    title: '',
    description: '',
    mealId: '',
    difficulty: 'EASY',
    prepTimeMinutes: '',
    cookTimeMinutes: '',
    servings: 2,
    isPublic: true,
    imageUrl: '',
    tags: [],
    // paso 2
    ingredients: [],
    // paso 3
    steps: [],
}

// normaliza receta (formato api) al formato del form, para que los tome bien el backend
// - ingredients viene con { ingredient: { id, name }, quantity, unit, notes, order }
//   - steps viene con { title, description, imageUrl, durationMin, order }
//   - mealId está como meal.id
function normalizeRecipe(recipe) {
    return {
        title: recipe.title ?? '',
        description: recipe.description ?? '',
        mealId: recipe.meal?.id ?? recipe.mealId ?? '',
        difficulty: recipe.difficulty ?? 'EASY',
        prepTimeMinutes: recipe.prepTimeMinutes ?? '',
        cookTimeMinutes: recipe.cookTimeMinutes ?? '',
        servings: recipe.servings ?? 2,
        isPublic: recipe.isPublic ?? true,
        imageUrl: recipe.imageUrl ?? '',
        tags:recipe.tags ?? [],
        ingredients: (recipe.ingredients ?? []).map(ing => ({
            ingredientId: ing.ingredient?.id   ?? ing.ingredientId,
            ingredientName: ing.ingredient?.name ?? ing.ingredientName ?? '',
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ing.notes ?? '',
            order: ing.order,
        })),
        steps: (recipe.steps ?? []).map(s => ({
            order: s.order,
            title: s.title ?? '',
            description: s.description ?? '',
            imageUrl: s.imageUrl ?? '',
            durationMin: s.durationMin ?? '',
        })),
    }
}

// initialData: objeto receta del backend (editar receta) o undefined (crear receta)
export function useRecipeForm(initialData) {
    const [data, setData] = useState(() =>
        initialData ? normalizeRecipe(initialData) : { ...EMPTY_STATE }
    )
    const [step, setStep]           = useState(1)
    const [errors, setErrors]       = useState({})
    const [submitting, setSubmitting] = useState(false)

    // campos simples
    const setField = useCallback((field, value) => {
        setData(prev => ({ ...prev, [field]: value }))
        setErrors(prev => ({ ...prev, [field]: undefined }))
    }, [])

    // ingredientes 
    const addIngredient = useCallback((ingredient) => {
        setData(prev => ({
            ...prev,
            ingredients: [
                ...prev.ingredients,
                { ...ingredient, order: prev.ingredients.length + 1 },
            ],
        }))
    }, [])

    const removeIngredient = useCallback((index) => {
        setData(prev => ({
            ...prev,
            ingredients: prev.ingredients
                .filter((_, i) => i !== index)
                .map((ing, i) => ({ ...ing, order: i + 1 })),
        }))
    }, [])

    const updateIngredient = useCallback((index, field, value) => {
        setData(prev => ({
            ...prev,
            ingredients: prev.ingredients.map((ing, i) =>
                i === index ? { ...ing, [field]: value } : ing
            ),
        }))
    }, [])

    // pasos
    const addStep = useCallback(() => {
        setData(prev => ({
            ...prev,
            steps: [
                ...prev.steps,
                { order: prev.steps.length + 1, title: '', description: '', imageUrl: '', durationMin: '' },
            ],
        }))
    }, [])

    const removeStep = useCallback((index) => {
        setData(prev => ({
            ...prev,
            steps: prev.steps
                .filter((_, i) => i !== index)
                .map((s, i) => ({ ...s, order: i + 1 })),
        }))
    }, [])

    const updateStep = useCallback((index, field, value) => {
        setData(prev => ({
            ...prev,
            steps: prev.steps.map((s, i) =>
                i === index ? { ...s, [field]: value } : s
            ),
        }))
    }, [])

    // tags
    const addTag = useCallback((tag) => {
        const clean = tag.trim().toLowerCase()
        if (!clean) return
        setData(prev => {
            if (prev.tags.includes(clean)) return prev
            return { ...prev, tags: [...prev.tags, clean] }
        })
    }, [])

    const removeTag = useCallback((tag) => {
        setData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
    }, [])

    // validacion
    function validateStep(n) {
        const errs = {}

        if (n === 1) {
            if (!data.title.trim()) errs.title  = 'El título es obligatorio'
            if (!data.description.trim()) errs.description = 'La descripción es obligatoria'
            if (!data.mealId) errs.mealId  = 'Seleccioná una comida'
            if (!data.prepTimeMinutes) errs.prepTimeMinutes = 'Requerido'
            if (data.cookTimeMinutes === '') errs.cookTimeMinutes = 'Requerido'
        }

        if (n === 2) {
            if (data.ingredients.length === 0)
                errs.ingredients = 'Agrega al menos un ingrediente'
            data.ingredients.forEach((ing, i) => {
                if (!ing.quantity) errs[`ing_qty_${i}`] = 'Cantidad requerida'
            })
        }

        if (n === 3) {
            if (data.steps.length === 0) errs.steps = 'Agrega al menos un paso'
            data.steps.forEach((s, i) => {
                if (!s.title.trim())       errs[`step_title_${i}`] = 'Título requerido'
                if (!s.description.trim()) errs[`step_desc_${i}`]  = 'Descripción requerida'
            })
        }

        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    function nextStep() {
        if (validateStep(step)) setStep(s => s + 1)
    }

    function prevStep() {
        setStep(s => s - 1)
    }

    // payload compartido
    function buildPayload() {
        return {
            ...data,
            prepTimeMinutes: Number(data.prepTimeMinutes),
            cookTimeMinutes: Number(data.cookTimeMinutes),
            servings: Number(data.servings),
            steps: data.steps.map(s => ({
                ...s,
                durationMin: s.durationMin ? Number(s.durationMin) : undefined,
            })),
        }
    }

    // submit: crear 
    async function submitCreate(navigate) {
        if (!validateStep(3)) return
        setSubmitting(true)
        try {
            const recipe = await recipesService.create(buildPayload())
            navigate(`/recipes/${recipe.id}`)
        } catch (err) {
            setErrors({ _global: err?.error || 'Error al crear la receta' })
        } finally {
            setSubmitting(false)
        }
    }

    // submit: editar
    async function submitUpdate(recipeId, navigate) {
        if (!validateStep(3)) return
        setSubmitting(true)
        try {
            const recipe = await recipesService.update(recipeId, buildPayload())
            navigate(`/recipes/${recipe.id}`)
        } catch (err) {
            setErrors({ _global: err?.error || 'Error al guardar los cambios' })
        } finally {
            setSubmitting(false)
        }
    }

    // submit legacy (modo creacion)
    // para mantener compatibilidad con createRecipePage
    async function submit(navigate) {
        return submitCreate(navigate)
    }

    return {
        data, step, errors, submitting,
        setField,
        addIngredient, removeIngredient, updateIngredient,
        addStep, removeStep, updateStep,
        addTag, removeTag,
        nextStep, prevStep,
        submit, // compatibilidad hacia atras
        submitCreate, // explicito
        submitUpdate, // nuevo para edicion
    }
}