//import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { ensureCsrfCookie } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

app.use(createPinia())

// CSRF / HTTPONLY-COOKIE AUTH CHANGE
// --------------------------------------------------------------------
// Two things need to happen before the app is usable:
//   1. Prime the XSRF-TOKEN cookie (ensureCsrfCookie) so the very first
//      state-changing request — e.g. logging in — already has a valid
//      CSRF header to send.
//   2. Ask the backend whether the browser is still holding a valid
//      session cookie from a previous visit (authStore.checkAuth), since
//      auth state can no longer be read synchronously out of
//      localStorage the way the old bearer-token version did.
//
// IMPORTANT: app.use(router) is deliberately NOT called until after this
// await, not just app.mount(). Vue Router starts resolving the current
// URL — including running beforeEach — the moment it's installed via
// app.use(), independent of app.mount(). Installing it early (as this
// used to) meant a hard refresh of a protected route (e.g. /admin) had
// its route guard read authStore.isAuthenticated before checkAuth()'s
// network request had any chance to complete, so it always saw the
// ref's default `false` and redirected to /login — even for a perfectly
// valid session. This was intermittent (a straight race between a
// network round-trip and a synchronous guard check) rather than
// consistently broken, which is why it was so confusing to reproduce.
async function bootstrap() {
  const authStore = useAuthStore()

  await Promise.allSettled([ensureCsrfCookie(), authStore.checkAuth()])

  app.use(router)
  app.mount('#app')
}

bootstrap()