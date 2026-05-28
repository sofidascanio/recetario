import api from './api.js'

export const recipesService = {
    list: (params) => api.get('/recipes', { params }),
    getById: (id) => api.get(`/recipes/${id}`),
    create: (data) => api.post('/recipes', data),
    update: (id, data) => api.patch(`/recipes/${id}`, data),
    delete: (id) => api.delete(`/recipes/${id}`),
    save: (id) => api.post(`/recipes/${id}/save`),
    unsave: (id) => api.delete(`/recipes/${id}/save`),
    rate: (id, score)  => api.post(`/recipes/${id}/rate`, { score }),
    fridgeMatch: () => api.get('/recipes/fridge-match'),
    comments: (id) => api.get(`/recipes/${id}/comments`),
    addComment: (id, content) => api.post(`/recipes/${id}/comments`, { content }),
}