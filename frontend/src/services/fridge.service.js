import api from './api.js'

export const fridgeService = {
    getItems: () => api.get('/fridge'),
    addItem: (data)  => api.post('/fridge', data),
    updateItem: (id, data) => api.patch(`/fridge/${id}`, data),
    deleteItem: (id) => api.delete(`/fridge/${id}`),
    searchIngredients: (q) => api.get('/fridge/ingredients/search', { params: { q } }),
    createIngredient: (name)  => api.post('/fridge/ingredients', { name }),
}