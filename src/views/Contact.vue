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

        <!-- Your messages — every thread the sender has ever started, with
             any replies from the team. Fetched from /contact-messages/mine,
             scoped server-side to this user so it can never show anyone
             else's messages. -->
        <div v-if="messagesLoading" class="contact__thread-status">Loading your messages…</div>
        <p v-else-if="messagesError" class="field__error">{{ messagesError }}</p>

        <div v-if="!messagesLoading && threads.length" class="contact__threads">
          <p class="contact__threads-label">Your messages</p>

          <div v-for="t in threads" :key="t.id" class="contact__thread">
            <div class="contact__thread-head">
              <span class="status-pill" :class="'status-pill--' + t.status">{{ t.status }}</span>
              <span class="contact__thread-date">{{ t.createdAt }}</span>
            </div>
            <p class="contact__thread-message">{{ t.message }}</p>

            <div v-if="t.replies.length" class="contact__thread-replies">
              <p
                v-for="r in t.replies"
                :key="r.id"
                class="contact__thread-reply"
                :class="{ 'contact__thread-reply--admin': r.isAdmin }"
              >
                <span class="contact__thread-reply-label">
                  {{ r.isAdmin ? 'Tawi Properties' : 'You' }} · {{ r.createdAt }}
                </span>
                {{ r.body }}
              </p>
            </div>
          </div>
        </div>

        <form class="contact__form" @submit.prevent="handleSubmit">
          <div class="field">
            <label for="message">{{ threads.length ? 'Send another message' : 'Your message' }}</label>
            <textarea
              id="message"
              v-model="messageText"
              rows="7"
              placeholder="What's on your mind? A question, a suggestion, a bug you've run into..."
              required
            ></textarea>
          </div>

          <p v-if="error" class="field__error">{{ error }}</p>
          <p v-if="justSent" class="contact__sent-note">✓ Sent — it now appears above.</p>

          <button type="submit" class="contact__submit" :disabled="submitting">
            {{ submitting ? 'Sending…' : 'Send message' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import contactMessageService from '@/services/contactMessageService'

const authStore = useAuthStore()

const messageText = ref('')
const submitting = ref(false)
const justSent = ref(false)
const error = ref('')

const threads = ref([])
const messagesLoading = ref(true)
const messagesError = ref('')

function mapThread(m) {
  return {
    id: m.id,
    message: m.message,
    status: m.status,
    createdAt: m.created_at ? m.created_at.slice(0, 10) : '',
    replies: (m.replies || []).map((r) => ({
      id: r.id,
      body: r.body,
      isAdmin: !!r.is_admin,
      createdAt: r.created_at ? r.created_at.slice(0, 10) : ''
    }))
  }
}

async function loadThreads() {
  messagesLoading.value = true
  messagesError.value = ''
  try {
    const { data } = await contactMessageService.getMine()
    threads.value = data.map(mapThread)
  } catch (e) {
    messagesError.value = 'Could not load your previous messages.'
  } finally {
    messagesLoading.value = false
  }
}

onMounted(loadThreads)

async function handleSubmit() {
  error.value = ''
  justSent.value = false

  if (messageText.value.trim().length < 5) {
    error.value = 'Please write a bit more detail before sending.'
    return
  }

  submitting.value = true

  try {
    await contactMessageService.send(messageText.value.trim())
    messageText.value = ''
    justSent.value = true
    // Re-fetch rather than optimistically prepending — keeps the status
    // pill and any server-assigned fields (id, timestamps) accurate.
    await loadThreads()
  } catch (err) {
    error.value = err.response?.data?.message
      || 'Something went wrong sending your message. Please try again.'
  } finally {
    submitting.value = false
  }
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

/* ---------- Your messages (threads) ---------- */
.contact__thread-status {
  font-size: 13px;
  color: var(--bone-dim);
  margin-bottom: 20px;
}

.contact__threads {
  margin-bottom: 28px;
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-right: 4px;
}

.contact__threads-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brass-bright);
  margin: 0 0 4px;
}

.contact__thread {
  background: rgba(237, 231, 218, 0.04);
  border: 1px solid rgba(237, 231, 218, 0.1);
  border-radius: 5px;
  padding: 14px 16px;
}

.contact__thread-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.contact__thread-date {
  font-size: 11px;
  color: var(--bone-dim);
}

.contact__thread-message {
  font-size: 14px;
  line-height: 1.6;
  color: var(--bone);
  margin: 0;
}

.contact__thread-replies {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed rgba(237, 231, 218, 0.15);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact__thread-reply {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--bone-dim);
}

.contact__thread-reply--admin {
  padding-left: 10px;
  border-left: 2px solid rgba(209, 178, 127, 0.4);
  color: var(--bone);
}

.contact__thread-reply-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--brass-bright);
  margin-bottom: 3px;
}

.contact__sent-note {
  margin: 0;
  font-size: 12px;
  color: var(--pine-bright);
}

.status-pill {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 999px;
}

.status-pill--new {
  color: var(--sky);
  background: rgba(123, 183, 214, 0.14);
}

.status-pill--read {
  color: var(--bone-dim);
  background: rgba(237, 231, 218, 0.08);
}

.status-pill--replied {
  color: var(--sky);
  background: rgba(123, 183, 214, 0.14);
}

.status-pill--resolved {
  color: var(--pine-bright);
  background: rgba(126, 162, 127, 0.14);
}

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