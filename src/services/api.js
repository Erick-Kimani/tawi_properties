import axios from 'axios'

// CSRF / HTTPONLY-COOKIE AUTH CHANGE
// --------------------------------------------------------------------
// The backend now authenticates the SPA via an httpOnly session cookie
// (see AuthController::login/googleAuth + bootstrap/app.php's
// statefulApi()) instead of a bearer token the frontend used to read
// out of localStorage. There is deliberately no code left here that can
// read that cookie — that's the whole point: an XSS payload running in
// this app has nothing to steal.
//
// `baseURL` points at the API path (…/api). The CSRF-cookie endpoint
// Sanctum exposes lives one level up, at the app root, so it needs its
// own URL derived from baseURL rather than going through apiClient.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
const APP_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, '')

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Required so the browser actually attaches/accepts the httpOnly
  // session cookie and the (JS-readable, by design) XSRF-TOKEN cookie
  // on cross-origin requests (frontend on :5173, API on :8000).
  withCredentials: true,
  // axios only auto-attaches the X-XSRF-TOKEN header for same-origin
  // requests unless this is set — needed here since the frontend and
  // API run on different origins (different ports) in dev, and
  // typically different subdomains in production.
  withXSRFToken: true,
  // Must match the cookie/header names Laravel's CSRF middleware uses.
  // These are axios' defaults, but set explicitly so a future axios
  // upgrade can't silently change the pairing.
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN'
})

// Sanctum's SPA CSRF protection needs the XSRF-TOKEN cookie to exist
// *before* the first state-changing request (login, register, etc.).
// Hitting this endpoint sets that cookie; axios then reads it and sends
// it back as X-XSRF-TOKEN automatically on every subsequent request.
// Safe to call more than once — it's what main.js calls once on app
// boot, and authService also calls it defensively before login/register
// in case the cookie expired or was never set (e.g. first visit landed
// directly on /login via a bookmark).
let csrfCookiePromise = null
export function ensureCsrfCookie() {
  if (!csrfCookiePromise) {
    csrfCookiePromise = axios
      .get(`${APP_ROOT_URL}/sanctum/csrf-cookie`, { withCredentials: true })
      .catch((error) => {
        // Don't let a failed CSRF-priming call permanently block future
        // attempts (e.g. a transient network blip on app boot).
        csrfCookiePromise = null
        throw error
      })
  }
  return csrfCookiePromise
}

// Handle responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // The session is missing/expired/invalid — clear the app's
      // reactive auth state (Navbar, route guards) so the UI reflects
      // "logged out" right away.
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
          // nothing to clear client-side; there's no token/localStorage
          // left to remove.
        })
    }
    return Promise.reject(error)
  }
)

export default apiClient