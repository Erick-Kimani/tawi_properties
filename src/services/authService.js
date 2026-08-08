import apiClient from './api'

export const authService = {
  register(userData) {
    return apiClient.post('/register', userData)
  },

  login(credentials) {
    return apiClient.post('/login', credentials)
  },

  logout() {
    return apiClient.post('/logout')
  },

  getCurrentUser() {
    return apiClient.get('/user')
  },

  getUserById(id) {
    return apiClient.get(`/user/${id}`)
  },

  deleteUser(id) {
    return apiClient.delete(`/user/${id}`)
  }
}

export default authService
