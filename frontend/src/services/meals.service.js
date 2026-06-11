import api from './api.js'

export const mealsService = {
    // array de comidas: [{id, name, category, imageUrl}, ...]
    list: (params) => api.get('/meals', { params }),
}