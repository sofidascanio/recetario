import { useState, useCallback } from 'react'
import { recipesService } from '../services/recipes.service.js'
import { fridgeService } from '../services/fridge.service.js'

const INITIAL_STATE = {
    // paso 1, info general
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

    // paso 2, ingredientes
    ingredients: [],

    // paso 3, pasos
    steps: [],
}

export function useRecipeForm() {
    const [data, setData] = useState(INITIAL_STATE)
    const [step, setStep] = useState(1)  // 1, 2, 3
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    // actualiza campo simple
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
                { order: prev.steps.length + 1, title: '', description: '', durationMin: '' },
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
        if (!clean || data.tags.includes(clean)) return
        setData(prev => ({ ...prev, tags: [...prev.tags, clean] }))
    }, [data.tags])

    const removeTag = useCallback((tag) => {
        setData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
    }, [])

    // validacion por paso
    function validateStep(n) {
        const errs = {}

        if (n === 1) {
            if (!data.title.trim()) errs.title = 'El título es obligatorio'
            if (!data.description.trim()) errs.description = 'La descripción es obligatoria'
            if (!data.mealId) errs.mealId = 'Selecciona una comida'
            if (!data.prepTimeMinutes) errs.prepTimeMinutes = 'Requerido'
            if (data.cookTimeMinutes === '') errs.cookTimeMinutes = 'Requerido'
        }

        if (n === 2) {
            if (data.ingredients.length === 0) errs.ingredients = 'Agrega al menos un ingrediente'
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

    // submit
    async function submit(navigate) {
        if (!validateStep(3)) return

        setSubmitting(true)
        try {
            const payload = {
                ...data,
                prepTimeMinutes: Number(data.prepTimeMinutes),
                cookTimeMinutes: Number(data.cookTimeMinutes),
                servings:        Number(data.servings),
                steps: data.steps.map(s => ({
                    ...s,
                    durationMin: s.durationMin ? Number(s.durationMin) : undefined,
                })),
            }
            const recipe = await recipesService.create(payload)
            navigate(`/recipes/${recipe.id}`)
        } catch (err) {
            setErrors({ _global: err?.error || 'Error al crear la receta' })
        } finally {
            setSubmitting(false)
        }
    }

    return {
        data, step, errors, submitting,
        setField,
        addIngredient, removeIngredient, updateIngredient,
        addStep, removeStep, updateStep,
        addTag, removeTag,
        nextStep, prevStep, submit,
    }
}