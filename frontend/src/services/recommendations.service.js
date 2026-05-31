import api from './api.js'

export const recommendationsService = {
    getFeed: (limit = 12) => api.get('/recommendations/feed', { params: { limit } }),
    getFridge: (limit = 10) => api.get('/recommendations/fridge', { params: { limit } }),
    getSimilar: (recipeId, limit = 6) => api.get(`/recommendations/similar/${recipeId}`, { params: { limit } }),
    getTrending:(days = 7, limit = 10)=> api.get('/recommendations/trending', { params: { days, limit } }),
}