<template>
  <div class="contact">
    <div class="contact__layout">
      <!-- Explanatory panel -->
      <div class="contact__intro">
        <RouterLink class="contact__mark" to="/">
          <span class="contact__mark-glyph">T</span>
        </RouterLink>
        <p class="contact__eyebrow">Get in touch</p>
        <h1 class="contact__intro-title">
          Questions, suggestions, or something not working right?
        </h1>
        <p class="contact__intro-sub">
          Send us a message and our team will get back to you. Since you're signed
          in, we already have your account on file — no need to re-enter your
          email or phone number.
        </p>

        <ul class="contact__benefits">
          <li>
            <span class="contact__benefit-mark">01</span>
            Every message goes straight to our team — nothing is shared with other users
          </li>
          <li>
            <span class="contact__benefit-mark">02</span>
            We reply using the contact details already on your account
          </li>
        </ul>
      </div>

      <!-- Message card -->
      <div class="contact__card">
        <div class="contact__header">
          <p class="contact__eyebrow contact__eyebrow--card">Contact us</p>
          <h2 class="contact__title">Send a message</h2>
          <p class="contact__sub">
            Signed in as <strong>{{ authStore.user?.name || authStore.user?.email }}</strong>.
          </p>
        </div>

        <form v-if="!submitted" class="contact__form" @submit.prevent="handleSubmit">
          <div class="field">
            <label for="message">Your message</label>
            <textarea
              id="message"
              v-model="messageText"
              rows="7"
              placeholder="What's on your mind? A question, a suggestion, a bug you've run into..."
              required
            ></textarea>
          </div>

          <p v-if="error" class="field__error">{{ error }}</p>

          <button type="submit" class="contact__submit" :disabled="submitting">
            {{ submitting ? 'Sending…' : 'Send message' }}
          </button>
        </form>

        <div v-else class="contact__success">
          <div class="contact__success-glyph">✓</div>
          <h2>Message sent</h2>
          <p>
            Thanks — our team will review it and reach out using the details on
            your account.
          </p>
          <div class="contact__success-actions">
            <button type="button" class="btn btn--ghost" @click="resetForm">
              Send another message
            </button>
            <RouterLink class="btn btn--primary" to="/">Back to home</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import contactMessageService from '@/services/contactMessageService'

const authStore = useAuthStore()

const messageText = ref('')
const submitting = ref(false)
const submitted = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''

  if (messageText.value.trim().length < 5) {
    error.value = 'Please write a bit more detail before sending.'
    return
  }

  submitting.value = true

  try {
    await contactMessageService.send(messageText.value.trim())
    submitted.value = true
  } catch (err) {
    error.value = err.response?.data?.message
      || 'Something went wrong sending your message. Please try again.'
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  messageText.value = ''
  submitted.value = false
  error.value = ''
}
</script>

<style scoped>
.contact {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image:
    linear-gradient(rgba(20, 23, 28, 0.88), rgba(20, 23, 28, 0.9)),
    url('/images/Picture1.jpg');
  background-size: cover;
  background-position: center;
  padding: 130px var(--gutter) 60px;
}

.contact__layout {
  width: 100%;
  max-width: 1080px;
  display: grid;
  grid-template-columns: 1fr 440px;
  gap: 64px;
  align-items: center;
}

/* ---------- Intro panel (left) ---------- */
.contact__intro {
  color: var(--bone);
  padding-right: 12px;
}

.contact__mark {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--brass);
  margin-bottom: 24px;
  text-decoration: none;
}

.contact__mark-glyph {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--brass-bright);
}

.contact__intro-title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(28px, 3.2vw, 42px);
  line-height: 1.25;
  color: var(--bone);
  margin: 0 0 18px;
  max-width: 480px;
}

.contact__intro-sub {
  font-size: 15px;
  line-height: 1.7;
  color: var(--bone-dim);
  margin: 0 0 32px;
  max-width: 440px;
}

.contact__benefits {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 440px;
}

.contact__benefits li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--bone);
}

.contact__benefit-mark {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--brass-bright);
  border: 1px solid rgba(169, 129, 75, 0.4);
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}

/* ---------- Message card (right) ---------- */
.contact__card {
  width: 100%;
  background: var(--slate);
  border: 1px solid rgba(169, 129, 75, 0.2);
  border-radius: 6px;
  padding: 40px 36px 44px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

.contact__header {
  text-align: left;
  margin-bottom: 28px;
}

.contact__eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brass-bright);
  margin: 0 0 10px;
}

.contact__eyebrow--card {
  margin-bottom: 8px;
}

.contact__title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 26px;
  color: var(--bone);
  margin: 0 0 10px;
}

.contact__sub {
  font-size: 14px;
  line-height: 1.5;
  color: var(--bone-dim);
  margin: 0;
}

.contact__sub strong {
  color: var(--bone);
}

.contact__form {
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

.field textarea {
  width: 100%;
  background: var(--ink);
  border: 1px solid rgba(237, 231, 218, 0.15);
  border-radius: 4px;
  color: var(--bone);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 12px 14px;
  resize: vertical;
  min-height: 160px;
}

.field textarea::placeholder {
  color: rgba(237, 231, 218, 0.3);
}

.field textarea:focus {
  outline: none;
  border-color: var(--brass);
}

.field__error {
  margin: 0;
  font-size: 12px;
  color: #d98b6a;
}

.contact__submit {
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

.contact__submit:hover:not(:disabled) {
  background: var(--brass-bright);
}

.contact__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ---------- Success state ---------- */
.contact__success {
  text-align: center;
  padding: 12px 0 4px;
}

.contact__success-glyph {
  width: 52px;
  height: 52px;
  margin: 0 auto 20px;
  border-radius: 50%;
  border: 1px solid var(--brass);
  color: var(--brass-bright);
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact__success h2 {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 22px;
  color: var(--bone);
  margin: 0 0 12px;
}

.contact__success p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--bone-dim);
  margin: 0 0 28px;
}

.contact__success-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.02em;
  border-radius: 4px;
  padding: 12px 22px;
  cursor: pointer;
  border: 1px solid transparent;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.btn--primary {
  background: var(--brass);
  color: var(--ink);
}
.btn--primary:hover { background: var(--brass-bright); }

.btn--ghost {
  background: transparent;
  border-color: rgba(237, 231, 218, 0.2);
  color: var(--bone-dim);
}
.btn--ghost:hover { color: var(--bone); border-color: var(--brass); }

@media (max-width: 980px) {
  .contact__layout {
    grid-template-columns: 1fr;
    gap: 40px;
    max-width: 560px;
  }

  .contact__intro {
    padding-right: 0;
    text-align: center;
  }

  .contact__mark { margin-left: auto; margin-right: auto; }
  .contact__intro-title,
  .contact__intro-sub { max-width: none; }
  .contact__benefits { max-width: none; }
  .contact__benefits li { text-align: left; }
}

@media (max-width: 720px) {
  .contact__card { padding: 32px 24px 36px; }
}
</style>