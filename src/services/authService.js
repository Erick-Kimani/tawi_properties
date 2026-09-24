import apiClient, { ensureCsrfCookie } from './api'

export const authService = {
  async register(userData) {
    await ensureCsrfCookie()
    return apiClient.post('/register', userData)
  },

  // CSRF / HTTPONLY-COOKIE AUTH CHANGE: primes the XSRF-TOKEN cookie
  // first. main.js already does this once on app boot, but doing it
  // again here too is cheap (ensureCsrfCookie() reuses the in-flight/
  // completed request) and makes login resilient even if boot-time
  // priming failed or the cookie expired.
  async login(credentials) {
    await ensureCsrfCookie()
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
  // `extras` carries accepted_terms / accepted_terms_version when this
  // call is coming from the sign-up page. Sign-in from the login page
  // sends nothing extra; the backend only insists on an acceptance when
  // the Google account is new and a user row is about to be created.
  async googleAuth(accessToken, extras = {}) {
    await ensureCsrfCookie()
    return apiClient.post('/auth/google', { access_token: accessToken, ...extras })
  },

  // Lets an already-logged-in user (typically a Google-only account that
  // has never had a real password) set one, so manual email/password
  // login works for their account too. Requires an authenticated session
  // — no email/code step, unlike forgotPassword/resetPassword, since
  // being logged in already proves account ownership.
  setPassword({ password, password_confirmation }) {
    return apiClient.post('/set-password', { password, password_confirmation })
  },

  // --- Admin-only: manual "unlock" for a user who's used up their one
  // /set-password attempt and can't complete forgot-password either
  // (e.g. no access to that inbox anymore). ---

  findUserByEmail(email) {
    return apiClient.get('/users/find', { params: { email } })
  },

  grantSetPasswordAccess(id) {
    return apiClient.post(`/user/${id}/grant-set-password-access`)
  }
}

export default authService