import api from './api.js'

export const notificationsService = {
    getAll: (page = 1, limit = 20) => api.get('/notifications', { params: { page, limit } }),
    getUnread: () => api.get('/notifications/unread-count'),
    markAsRead: (ids) => api.patch('/notifications/read', { ids }),
    markAllRead: () => api.patch('/notifications/read', { ids: [] }),
    delete: (id) => api.delete(`/notifications/${id}`),
}