<template>
  <div class="auth">
    <div class="auth__ambient">
      <svg class="auth__skyline" viewBox="0 0 1000 220" preserveAspectRatio="xMidYMax slice">
        <g class="building">
          <rect x="40" y="90" width="60" height="130" />
          <rect class="win" x="52" y="105" width="6" height="8" />
          <rect class="win" x="66" y="105" width="6" height="8" />
          <rect class="win" x="80" y="105" width="6" height="8" />
          <rect class="win" x="52" y="130" width="6" height="8" />
          <rect class="win" x="66" y="130" width="6" height="8" />
          <rect class="win" x="80" y="130" width="6" height="8" />
          <rect class="win" x="52" y="155" width="6" height="8" />
          <rect class="win" x="80" y="155" width="6" height="8" />
        </g>
        <g class="building">
          <rect x="110" y="60" width="45" height="160" />
          <rect class="win" x="120" y="75" width="6" height="8" />
          <rect class="win" x="134" y="75" width="6" height="8" />
          <rect class="win" x="120" y="100" width="6" height="8" />
          <rect class="win" x="134" y="100" width="6" height="8" />
          <rect class="win" x="120" y="125" width="6" height="8" />
          <rect class="win" x="134" y="150" width="6" height="8" />
        </g>
        <g class="building">
          <rect x="165" y="110" width="70" height="110" />
          <rect class="win" x="178" y="125" width="6" height="8" />
          <rect class="win" x="195" y="125" width="6" height="8" />
          <rect class="win" x="212" y="125" width="6" height="8" />
          <rect class="win" x="178" y="150" width="6" height="8" />
          <rect class="win" x="212" y="150" width="6" height="8" />
        </g>
        <g class="building">
          <rect x="250" y="40" width="55" height="180" />
          <rect class="win" x="262" y="55" width="6" height="8" />
          <rect class="win" x="278" y="55" width="6" height="8" />
          <rect class="win" x="262" y="80" width="6" height="8" />
          <rect class="win" x="278" y="80" width="6" height="8" />
          <rect class="win" x="262" y="105" width="6" height="8" />
          <rect class="win" x="278" y="130" width="6" height="8" />
        </g>
        <g class="building">
          <rect x="320" y="75" width="40" height="145" />
          <rect class="win" x="330" y="90" width="6" height="8" />
          <rect class="win" x="330" y="115" width="6" height="8" />
          <rect class="win" x="345" y="135" width="6" height="8" />
        </g>

        <g class="building">
          <rect x="600" y="80" width="50" height="140" />
          <rect class="win" x="610" y="95" width="6" height="8" />
          <rect class="win" x="625" y="95" width="6" height="8" />
          <rect class="win" x="610" y="120" width="6" height="8" />
          <rect class="win" x="625" y="145" width="6" height="8" />
        </g>
        <g class="building">
          <rect x="660" y="50" width="60" height="170" />
          <rect class="win" x="672" y="65" width="6" height="8" />
          <rect class="win" x="690" y="65" width="6" height="8" />
          <rect class="win" x="672" y="90" width="6" height="8" />
          <rect class="win" x="690" y="90" width="6" height="8" />
          <rect class="win" x="672" y="115" width="6" height="8" />
          <rect class="win" x="690" y="140" width="6" height="8" />
        </g>
        <g class="building">
          <rect x="730" y="100" width="45" height="120" />
          <rect class="win" x="740" y="115" width="6" height="8" />
          <rect class="win" x="755" y="140" width="6" height="8" />
        </g>
        <g class="building">
          <rect x="790" y="65" width="65" height="155" />
          <rect class="win" x="802" y="80" width="6" height="8" />
          <rect class="win" x="820" y="80" width="6" height="8" />
          <rect class="win" x="838" y="80" width="6" height="8" />
          <rect class="win" x="802" y="105" width="6" height="8" />
          <rect class="win" x="820" y="130" width="6" height="8" />
          <rect class="win" x="838" y="155" width="6" height="8" />
        </g>
        <g class="building">
          <rect x="870" y="95" width="50" height="125" />
          <rect class="win" x="882" y="110" width="6" height="8" />
          <rect class="win" x="898" y="135" width="6" height="8" />
        </g>
      </svg>
    </div>

    <div class="auth__card">
      <div class="auth__header">
        <RouterLink class="auth__mark" to="/">
          <span class="auth__mark-glyph">T</span>
        </RouterLink>
        <p class="auth__eyebrow">Welcome back</p>
        <h1 class="auth__title">Sign in to Tawi Properties</h1>
        <p class="auth__sub">Access your saved listings and messages.</p>
      </div>

      <form class="auth__form" @submit.prevent="handleSubmit">
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
              placeholder="Enter your password"
              autocomplete="current-password"
              required
            />
            <button type="button" class="field__toggle" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <p v-if="errorMessage" class="field__error">{{ errorMessage }}</p>

        <button type="submit" class="auth__submit" :disabled="submitting">
          {{ submitting ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <p class="auth__footer">
        Don't have an account?
        <RouterLink to="/signup">Create one</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  email: '',
  password: ''
})

const showPassword = ref(false)
const submitting = ref(false)
const errorMessage = ref('')

function handleSubmit() {
  errorMessage.value = ''
  submitting.value = true

  setTimeout(() => {
    const stored = localStorage.getItem('tawi_user')

    if (!stored) {
      errorMessage.value = 'No account found. Please sign up first.'
      submitting.value = false
      return
    }

    const savedUser = JSON.parse(stored)

    if (
      savedUser.email.toLowerCase() === form.email.toLowerCase() &&
      savedUser.password === form.password
    ) {
      localStorage.setItem('tawi_session', 'active')
      submitting.value = false
      router.push('/')
    } else {
      errorMessage.value = 'Incorrect email or password.'
      submitting.value = false
    }
  }, 700)
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
    url('public/images/Picture2.jpg');
  background-size: cover;
  background-position: center;
  padding: 100px 20px 60px;
  overflow: hidden;
}

.auth::before {
  content: '';
  position: absolute;
  inset: -20%;
  background:
    radial-gradient(ellipse 700px 500px at 30% 20%, rgba(169, 129, 75, 0.14), transparent 60%),
    radial-gradient(ellipse 600px 500px at 75% 10%, rgba(124, 154, 114, 0.08), transparent 65%);
  animation: auth-drift 14s ease-in-out infinite alternate;
  pointer-events: none;
}

@keyframes auth-drift {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(-3%, 2%) scale(1.06); }
}

.auth__ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    115deg,
    rgba(169, 129, 75, 0.035) 0px,
    rgba(169, 129, 75, 0.035) 1px,
    transparent 1px,
    transparent 34px
  );
}

.auth__skyline {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 240px;
}

.auth__skyline .building rect:first-child {
  fill: rgba(169, 129, 75, 0.10);
}

.auth__skyline .win {
  fill: rgba(201, 160, 106, 0.55);
  animation: win-twinkle 5s ease-in-out infinite;
}

.auth__skyline .win:nth-child(odd) { animation-delay: 0.4s; }
.auth__skyline .win:nth-child(3n) { animation-delay: 1.2s; }
.auth__skyline .win:nth-child(4n) { animation-delay: 2.1s; }
.auth__skyline .win:nth-child(5n) { animation-delay: 3s; }

@keyframes win-twinkle {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.9; }
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

@media (max-width: 500px) {
  .auth__skyline { height: 140px; }
}
</style>