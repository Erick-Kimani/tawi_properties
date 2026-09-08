import { ref } from 'vue'
import { defineStore } from 'pinia'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  // Initialise straight from localStorage so a page refresh keeps the
  // logged-in state in sync with the token that api.js actually sends.
  const token = ref(localStorage.getItem('auth_token'))
  const user = ref((() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })())

  const isAuthenticated = ref(!!token.value)

  function setSession(newToken, newUser) {
    token.value = newToken
    user.value = newUser || null
    isAuthenticated.value = !!newToken

    localStorage.setItem('auth_token', newToken)
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser))
    }
  }

  // Merges partial fields (or a whole fresh user object) into the stored
  // user — e.g. after POST /set-password returns the updated user so
  // can_set_password flips to false without needing a full re-login.
  function updateUser(partialUser) {
    if (!partialUser) return
    user.value = { ...user.value, ...partialUser }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  function clearSession() {
    token.value = null
    user.value = null
    isAuthenticated.value = false

    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  async function logout() {
    try {
      // Best-effort call to the backend so the token is invalidated
      // server-side too. We still clear local state even if this fails
      // (e.g. token already expired, network hiccup, etc.).
      await authService.logout()
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      clearSession()
    }
  }

  return { token, user, isAuthenticated, setSession, updateUser, clearSession, logout }
})

export default useAuthStore