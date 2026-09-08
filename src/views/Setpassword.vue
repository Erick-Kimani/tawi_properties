<template>
  <div class="auth">
    <div class="auth__card">
      <div class="auth__header">
        <RouterLink class="auth__mark" to="/">
          <span class="auth__mark-glyph">T</span>
        </RouterLink>
        <p class="auth__eyebrow">Account security</p>
        <h1 class="auth__title">{{ eligible ? 'Set a password' : 'Password already set' }}</h1>
        <p class="auth__sub">
          {{
            eligible
              ? 'You signed in with Google, so this account has no password yet. Set one below and you\'ll be able to log in manually too, in addition to "Sign in with Google".'
              : 'This page is a one-time setup step, and it looks like you\'ve already used it. To change your password now, use "Forgot password" instead.'
          }}
        </p>
      </div>

      <p v-if="!eligible" class="auth__footer" style="margin: 0 0 24px">
        <RouterLink to="/forgot-password">Go to Forgot password</RouterLink>
      </p>

      <form v-if="eligible" class="auth__form" @submit.prevent="handleSetPassword">
        <div class="field">
          <label for="password">New password</label>
          <div class="field__input-wrap">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="At least 8 characters"
              autocomplete="new-password"
              minlength="8"
              required
            />
            <button type="button" class="field__toggle" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <div class="field">
          <label for="password_confirmation">Confirm new password</label>
          <input
            id="password_confirmation"
            v-model="form.password_confirmation"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Re-enter your new password"
            autocomplete="new-password"
            minlength="8"
            required
          />
        </div>

        <p v-if="errorMessage" class="field__error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="field__success">{{ successMessage }}</p>

        <button type="submit" class="auth__submit" :disabled="submitting">
          {{ submitting ? 'Saving…' : 'Set password' }}
        </button>
      </form>

      <p class="auth__footer">
        Changed your mind?
        <RouterLink to="/">Back to home</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/authService'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  password: '',
  password_confirmation: ''
})

const showPassword = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Set password is a one-time action (see AuthController::setPassword) —
// once used, can_set_password flips to false on the user object until an
// admin grants a further attempt. The router guard already redirects
// ineligible users away, but we check here too as defense in depth (e.g.
// a stale cached user object) and to render the right copy either way.
const eligible = ref(authStore.user?.can_set_password !== false)

async function handleSetPassword() {
  errorMessage.value = ''
  successMessage.value = ''

  if (form.password !== form.password_confirmation) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  submitting.value = true

  try {
    const response = await authService.setPassword({
      password: form.password,
      password_confirmation: form.password_confirmation
    })

    // Reflect the updated can_set_password: false immediately, so the
    // "Set password" nav link disappears without needing a re-login.
    authStore.updateUser(response.data.user)

    successMessage.value = 'Password set! You can now log in manually too.'

    // Send them home after a moment — nothing else for them to do here.
    setTimeout(() => router.push({ name: 'home' }), 1500)
  } catch (error) {
    // A 403 here means the backend disagrees that this account is still
    // eligible (e.g. it was used in another tab/device since this page
    // loaded) — switch to the "already set" view instead of just showing
    // the raw error.
    if (error.response?.status === 403) {
      // Switches the template to the "already set" view, whose own copy
      // explains this — the form (and this error message) disappear
      // along with it, so there's nothing further to set here.
      eligible.value = false
    } else {
      errorMessage.value =
        error.response?.data?.error || error.response?.data?.message || 'Something went wrong. Please try again.'
    }
    console.error('Set password error:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.auth {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ink);
  padding: 100px 20px 60px;
}

.auth__card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  background: var(--slate);
  border: 1px solid rgba(169, 129, 75, 0.2);
  border-radius: 6px;
  padding: 40px 36px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(169, 129, 75, 0.05);
  animation: auth-rise 0.5s ease both;
}

@keyframes auth-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth__header {
  text-align: center;
  margin-bottom: 32px;
}

.auth__mark {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--brass);
  margin-bottom: 20px;
  text-decoration: none;
  position: relative;
  transition: box-shadow 0.3s ease;
}

.auth__mark::after {
  content: '';
  position: absolute;
  inset: -6px;
  border: 1px solid rgba(169, 129, 75, 0.25);
  border-radius: 2px;
}

.auth__mark:hover {
  box-shadow: 0 0 16px rgba(169, 129, 75, 0.35);
}

.auth__mark-glyph {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--brass-bright);
}

.auth__eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brass-bright);
  margin: 0 0 10px;
}

.auth__title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 28px;
  color: var(--bone);
  margin: 0 0 10px;
}

.auth__sub {
  font-size: 14px;
  line-height: 1.5;
  color: var(--bone-dim);
  margin: 0;
}

.auth__form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--bone-dim);
}

.field input {
  width: 100%;
  background: var(--ink);
  border: 1px solid rgba(237, 231, 218, 0.15);
  border-radius: 4px;
  color: var(--bone);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 12px 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field input::placeholder { color: rgba(237, 231, 218, 0.3); }

.field input:focus {
  outline: none;
  border-color: var(--brass);
  box-shadow: 0 0 0 3px rgba(169, 129, 75, 0.12);
}

.field__input-wrap {
  position: relative;
}

.field__input-wrap input {
  padding-right: 56px;
}

.field__toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--brass-bright);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 4px;
}

.field__error {
  margin: 0;
  font-size: 12px;
  color: #d98b6a;
}

.field__success {
  margin: 0;
  font-size: 12px;
  color: var(--pine-bright);
}

.auth__submit {
  margin-top: 4px;
  background: var(--brass);
  color: var(--ink);
  border: none;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 14px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
}

.auth__submit:hover:not(:disabled) {
  background: var(--brass-bright);
  box-shadow: 0 6px 20px rgba(169, 129, 75, 0.25);
}

.auth__submit:active:not(:disabled) {
  transform: translateY(1px);
}

.auth__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth__footer {
  margin: 24px 0 0;
  text-align: center;
  font-size: 13px;
  color: var(--bone-dim);
}

.auth__footer a {
  color: var(--brass-bright);
  text-decoration: none;
}

.auth__footer a:hover { text-decoration: underline; }
</style>