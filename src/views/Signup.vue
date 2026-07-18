<template>
  <div class="auth">
    <div class="auth__card">
      <div class="auth__header">
        <RouterLink class="auth__mark" to="/">
          <span class="auth__mark-glyph">T</span>
        </RouterLink>
        <p class="auth__eyebrow">Create your account</p>
        <h1 class="auth__title">Join Tawi Properties</h1>
        <p class="auth__sub">Save listings, message agents, and list your own property.</p>
      </div>

      <form class="auth__form" @submit.prevent="handleSubmit">
        <div class="field">
          <label for="fullName">Full name</label>
          <input
            id="fullName"
            v-model="form.fullName"
            type="text"
            placeholder="e.g. Firstname Lastname"
            autocomplete="name"
            required
          />
        </div>

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

        <div class="field">
          <label for="password">Password</label>
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
          <label for="confirmPassword">Confirm password</label>
          <div class="field__input-wrap">
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              placeholder="Re-enter your password"
              autocomplete="new-password"
              required
            />
            <button type="button" class="field__toggle" @click="showConfirm = !showConfirm">
              {{ showConfirm ? 'Hide' : 'Show' }}
            </button>
          </div>
          <p v-if="mismatch" class="field__error">Passwords don't match.</p>
        </div>

        <button type="submit" class="auth__submit" :disabled="submitting">
          {{ submitting ? 'Creating account…' : 'Create account' }}
        </button>
      </form>

      <p class="auth__footer">
        Already have an account?
        <RouterLink to="/login">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirm = ref(false)
const submitting = ref(false)

const mismatch = computed(() =>
  form.confirmPassword.length > 0 && form.password !== form.confirmPassword
)

function handleSubmit() {
  if (form.password !== form.confirmPassword) return

  submitting.value = true

  // Placeholder — replace with a real API call once your backend/auth is ready.
  setTimeout(() => {
    submitting.value = false
    router.push('/')
  }, 900)
}
</script>

<style scoped>
.auth {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image:
    linear-gradient(rgba(20, 23, 28, 0.88), rgba(20, 23, 28, 0.88)),
    url('/images/Picture5.jpg');
  background-size: cover;
  background-position: center;
  padding: 100px 20px 60px;
  overflow: hidden;
}

.auth__card {
  width: 100%;
  max-width: 440px;
  background: var(--slate);
  border: 1px solid rgba(169, 129, 75, 0.2);
  border-radius: 6px;
  padding: 40px 36px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
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
}

.field input::placeholder { color: rgba(237, 231, 218, 0.3); }

.field input:focus {
  outline: none;
  border-color: var(--brass);
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

.auth__submit {
  margin-top: 8px;
  background: var(--brass);
  color: var(--ink);
  border: none;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.auth__submit:hover:not(:disabled) { background: var(--brass-bright); }

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