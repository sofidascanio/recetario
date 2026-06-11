import api from './api.js'

export const authService = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getMe: ()  => api.get('/auth/me'),
    updateMe: (data) => api.patch('/users/me', data),
}