import axios from 'axios'

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add token to requests if it exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // The token is missing/expired/invalid — clear it so the app's
      // reactive auth state (Navbar, route guards) reflects "logged
      // out" right away.
      //
      // Deliberately NOT force-navigating to /login here anymore: most
      // pages are public now (see router/index.js), so a 401 from a
      // single request — submitting a listing while logged out, sending
      // a message while logged out — should surface as an inline
      // "please log in" prompt from whichever component made the call,
      // not yank the person away from a page (and a half-filled form)
      // they're allowed to be on.
      //
      // Dynamic import to avoid a circular dependency: stores/auth.js
      // imports services/authService.js, which imports this file.
      import('@/stores/auth')
        .then(({ useAuthStore }) => useAuthStore().clearSession())
        .catch(() => {
          // Pinia isn't active yet (e.g. a 401 during app bootstrap) —
          // fall back to clearing storage directly.
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
        })
    }
    return Promise.reject(error)
  }
)

export default apiClient