import { useState, useEffect, useCallback } from 'react'
import { recipesService } from '../services/recipes.service.js'
import { useDebounce } from './useDebounce.js'

const INITIAL_FILTERS = {
    search: '',
    category: '',
    mealId: '',
    difficulty: '',
    sortBy: 'recent',
    tags: '',
}

export function useRecipeSearch() {
    const [filters, setFilters] = useState(INITIAL_FILTERS)
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)

    // solo el campo search tiene debounce, los selects responden normal
    const debouncedSearch = useDebounce(filters.search, 400)

    const fetchRecipes = useCallback(async (currentPage = 1) => {
            setLoading(true)
            try {
                const params = {
                    ...filters,
                    search: debouncedSearch,
                    page:   currentPage,
                    limit:  12,
                }
                // limpia params vacios
                Object.keys(params).forEach(k => {
                    if (params[k] === '') delete params[k]
                })
                const data = await recipesService.list(params)
                    setResults(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }, [filters, debouncedSearch])

        useEffect(() => {
            setPage(1)
        }, [debouncedSearch, filters.category, filters.mealId, filters.difficulty, filters.sortBy, filters.tags])

        useEffect(() => {
            fetchRecipes(page)
        }, [page, debouncedSearch, filters.category, filters.mealId, filters.difficulty, filters.sortBy, filters.tags])

        function setFilter(key, value) {
            setFilters(prev => ({ ...prev, [key]: value }))
        }

        function resetFilters() {
            setFilters(INITIAL_FILTERS)
            setPage(1)
        }

        const hasActiveFilters = Object.entries(filters).some(
            ([k, v]) => k !== 'sortBy' && v !== ''
        )

        return {
            filters, results, loading, page,
            setFilter, resetFilters, setPage,
            hasActiveFilters,
        }
}