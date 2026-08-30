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
  },

  // Step 1 of password recovery — emails a 6-digit code if the address
  // is registered. Backend always responds the same way either way, so
  // don't infer whether the email exists from this response.
  forgotPassword(email) {
    return apiClient.post('/forgot-password', { email })
  },

  // Step 2 — the code from that email + a new password.
  resetPassword({ email, code, password, password_confirmation }) {
    return apiClient.post('/reset-password', { email, code, password, password_confirmation })
  },

  // Logs in (or silently registers, if this Google account has never
  // been seen before) using an OAuth access_token obtained from Google
  // Identity Services — see services/googleAuth.js.
  googleAuth(accessToken) {
    return apiClient.post('/auth/google', { access_token: accessToken })
  },

  // Lets an already-logged-in user (typically a Google-only account that
  // has never had a real password) set one, so manual email/password
  // login works for their account too. Requires the auth token — no
  // email/code step, unlike forgotPassword/resetPassword, since being
  // logged in already proves account ownership.
  setPassword({ password, password_confirmation }) {
    return apiClient.post('/set-password', { password, password_confirmation })
  }
}

export default authService