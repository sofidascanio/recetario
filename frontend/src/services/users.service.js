import api from './api.js'

export const usersService = {
    getSaved: (username, page = 1, limit = 12) =>
        api.get(`/users/${username}/saved`, { params: { page, limit } }),
}