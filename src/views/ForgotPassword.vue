<template>
  <div class="auth">
    <div class="auth__card">
      <div class="auth__header">
        <RouterLink class="auth__mark" to="/">
          <span class="auth__mark-glyph">T</span>
        </RouterLink>
        <p class="auth__eyebrow">Account recovery</p>
        <h1 class="auth__title">{{ step === 'request' ? 'Reset your password' : 'Enter your code' }}</h1>
        <p class="auth__sub">
          {{
            step === 'request'
              ? "We'll email you a 6-digit code to reset your password."
              : `Enter the code sent to ${form.email} and choose a new password.`
          }}
        </p>
      </div>

      <!-- Step 1: request a code -->
      <form v-if="step === 'request'" class="auth__form" @submit.prevent="handleRequestCode">
        <div class="field">
          <label for="email">Email address</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            required
          />
        </div>

        <p v-if="errorMessage" class="field__error">{{ errorMessage }}</p>

        <button type="submit" class="auth__submit" :disabled="submitting">
          {{ submitting ? 'Sending…' : 'Send reset code' }}
        </button>
      </form>

      <!-- Step 2: enter code + new password -->
      <form v-else class="auth__form" @submit.prevent="handleResetPassword">
        <div class="field">
          <label for="code">Reset code</label>
          <input
            id="code"
            v-model="form.code"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="123456"
            autocomplete="one-time-code"
            required
          />
        </div>

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
          {{ submitting ? 'Resetting…' : 'Reset password' }}
        </button>

        <button type="button" class="auth__secondary" @click="handleResendCode" :disabled="submitting">
          Didn't get a code? Resend
        </button>
      </form>

      <p class="auth__footer">
        Remembered your password?
        <RouterLink to="/login">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/authService'

const router = useRouter()

// 'request' = asking for the code, 'reset' = entering code + new password
const step = ref('request')

const form = reactive({
  email: '',
  code: '',
  password: '',
  password_confirmation: ''
})

const showPassword = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleRequestCode() {
  errorMessage.value = ''
  submitting.value = true

  try {
    // Backend always returns the same message whether or not the email
    // is registered, so we can't (and shouldn't) branch on the result —
    // just move to the next step either way.
    await authService.forgotPassword(form.email)
    step.value = 'reset'
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Something went wrong. Please try again.'
    console.error('Forgot password error:', error)
  } finally {
    submitting.value = false
  }
}

async function handleResendCode() {
  errorMessage.value = ''
  successMessage.value = ''
  submitting.value = true

  try {
    await authService.forgotPassword(form.email)
    successMessage.value = 'A new code has been sent, if that email is registered.'
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Something went wrong. Please try again.'
    console.error('Resend code error:', error)
  } finally {
    submitting.value = false
  }
}

async function handleResetPassword() {
  errorMessage.value = ''
  successMessage.value = ''

  if (form.password !== form.password_confirmation) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  submitting.value = true

  try {
    await authService.resetPassword({
      email: form.email,
      code: form.code,
      password: form.password,
      password_confirmation: form.password_confirmation
    })

    // Reset succeeded — send them to log in with the new password.
    router.push({ name: 'login' })
  } catch (error) {
    errorMessage.value =
      error.response?.data?.error || error.response?.data?.message || 'Reset failed. Please try again.'
    console.error('Reset password error:', error)
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

.auth__secondary {
  background: none;
  border: none;
  color: var(--brass-bright);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  cursor: pointer;
  padding: 4px;
  text-align: center;
}

.auth__secondary:hover:not(:disabled) {
  text-decoration: underline;
}

.auth__secondary:disabled {
  opacity: 0.5;
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