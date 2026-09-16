import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import authService from '@/services/authService'

// CSRF / HTTPONLY-COOKIE AUTH CHANGE
// --------------------------------------------------------------------
// There is no more `auth_token` in localStorage. The token used to be
// readable by any script running on the page — including an injected
// XSS payload — which is exactly what an httpOnly cookie prevents: the
// browser holds it, JavaScript here never can.
//
// The consequence is that this store can no longer just read a token
// out of storage to know "am I logged in?" on page load. Instead,
// `checkAuth()` asks the server (GET /user, which only succeeds if the
// session cookie the browser is holding is still valid) — see main.js,
// which calls this once on app boot before mounting.
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)
  // True once the initial checkAuth() (see main.js) has resolved, so
  // route guards / UI can tell "not logged in" apart from "haven't
  // checked yet" if they need to (e.g. to avoid a flash of logged-out
  // content on refresh).
  const authChecked = ref(false)

  // Kept for backwards compatibility with any code that still reads
  // `authStore.token` — always null now, since the session cookie is
  // httpOnly and this app never has access to it. Prefer
  // `isAuthenticated` / `user` instead.
  const token = computed(() => null)

  // Asks the backend whether the current session cookie is valid, and
  // syncs local state accordingly. Call this on app boot, and it's safe
  // to call again any time you want to re-validate (e.g. after focus).
  async function checkAuth() {
    try {
      const response = await authService.getCurrentUser()
      user.value = response.data
      isAuthenticated.value = true
    } catch (error) {
      user.value = null
      isAuthenticated.value = false
    } finally {
      authChecked.value = true
    }
    return isAuthenticated.value
  }

  // Called right after a successful login/register/Google-auth response,
  // which already includes the user object — avoids an extra round trip
  // to /user. Signature intentionally still accepts (unusedToken, newUser)
  // so existing call sites (Login.vue, Signup.vue) that still pass two
  // arguments keep working without every call site needing to change in
  // lockstep with this file; the first argument is ignored.
  function setSession(_unusedToken, newUser) {
    user.value = newUser || null
    isAuthenticated.value = !!newUser
    authChecked.value = true
  }

  // Preferred single-argument form of the above for new call sites.
  function setUser(newUser) {
    setSession(null, newUser)
  }

  // Merges partial fields (or a whole fresh user object) into the stored
  // user — e.g. after POST /set-password returns the updated user so
  // can_set_password flips to false without needing a full re-login.
  function updateUser(partialUser) {
    if (!partialUser) return
    user.value = { ...user.value, ...partialUser }
  }

  function clearSession() {
    user.value = null
    isAuthenticated.value = false
  }

  async function logout() {
    try {
      // Tells the backend to end the session (Auth::guard('web')->logout()
      // + session invalidate) so the httpOnly cookie the browser is
      // holding stops working server-side too. We still clear local
      // state even if this fails (e.g. network hiccup, session already
      // expired).
      await authService.logout()
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      clearSession()
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    authChecked,
    checkAuth,
    setSession,
    setUser,
    updateUser,
    clearSession,
    logout
  }
})

export default useAuthStore