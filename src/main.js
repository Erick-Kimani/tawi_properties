//import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { ensureCsrfCookie } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

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
// Both run before mount so the router's first navigation guard sees
// accurate isAuthenticated/user state instead of momentarily treating
// an already-logged-in user as logged out.
async function bootstrap() {
  const authStore = useAuthStore()

  await Promise.allSettled([ensureCsrfCookie(), authStore.checkAuth()])

  app.mount('#app')
}

bootstrap()