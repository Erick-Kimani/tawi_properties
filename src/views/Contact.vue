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
          Send us a message and our team will reply right here — no need to check
          your email. Since you're signed in, we already know who you are.
        </p>

        <ul class="contact__benefits">
          <li>
            <span class="contact__benefit-mark">01</span>
            Every message goes straight to our team — nothing is shared with other users
          </li>
          <li>
            <span class="contact__benefit-mark">02</span>
            Replies show up in the conversation below, and you can keep replying
          </li>
        </ul>
      </div>

      <!-- Main content: compose + conversations -->
      <div class="contact__main">
        <!-- Compose card -->
        <div class="contact__card">
          <div class="contact__header">
            <p class="contact__eyebrow contact__eyebrow--card">Contact us</p>
            <h2 class="contact__title">Start a new conversation</h2>
            <p class="contact__sub">
              Signed in as <strong>{{ authStore.user?.name || authStore.user?.email }}</strong>.
            </p>
          </div>

          <form class="contact__form" @submit.prevent="handleSend">
            <div class="field">
              <label for="message">Your message</label>
              <textarea
                id="message"
                v-model="messageText"
                rows="5"
                placeholder="What's on your mind? A question, a suggestion, a bug you've run into..."
                required
              ></textarea>
            </div>

            <p v-if="sendError" class="field__error">{{ sendError }}</p>

            <button type="submit" class="contact__submit" :disabled="sending">
              {{ sending ? 'Sending…' : 'Send message' }}
            </button>
          </form>
        </div>

        <!-- Conversations -->
        <div class="contact__threads">
          <div class="contact__threads-head">
            <h2 class="contact__threads-title">Your conversations</h2>
          </div>

          <p v-if="threadsLoading" class="contact__status-text">Loading your messages…</p>
          <p v-if="threadsError" class="contact__status-text contact__status-text--error">
            {{ threadsError }}
          </p>

          <div
            v-if="!threadsLoading && !threadsError && threads.length === 0"
            class="contact__empty"
          >
            <p>No messages yet — send one above to start a conversation.</p>
          </div>

          <div v-else class="contact__thread-list">
            <article v-for="thread in threads" :key="thread.id" class="thread-card">
              <div class="thread-card__head">
                <span class="status-pill" :class="'status-pill--' + thread.status">
                  {{ thread.status }}
                </span>
                <span class="thread-card__date">{{ thread.createdAt }}</span>
              </div>

              <div class="thread-card__bubbles">
                <!-- Original message -->
                <div class="bubble bubble--user">
                  <p class="bubble__author">You</p>
                  <p class="bubble__body">{{ thread.message }}</p>
                </div>

                <!-- Replies -->
                <div
                  v-for="reply in thread.replies"
                  :key="reply.id"
                  class="bubble"
                  :class="reply.isAdmin ? 'bubble--admin' : 'bubble--user'"
                >
                  <p class="bubble__author">{{ reply.isAdmin ? 'Support' : 'You' }}</p>
                  <p class="bubble__body">{{ reply.body }}</p>
                  <p class="bubble__date">{{ reply.createdAt }}</p>
                </div>
              </div>

              <form class="thread-card__reply" @submit.prevent="handleReply(thread.id)">
                <textarea
                  v-model="replyDrafts[thread.id]"
                  rows="2"
                  placeholder="Reply..."
                  required
                ></textarea>
                <button type="submit" :disabled="replySending[thread.id]">
                  {{ replySending[thread.id] ? 'Sending…' : 'Reply' }}
                </button>
              </form>
              <p v-if="replyErrors[thread.id]" class="field__error">
                {{ replyErrors[thread.id] }}
              </p>
            </article>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import contactMessageService from '@/services/contactMessageService'

const authStore = useAuthStore()

// --- Compose (new thread) -----------------------------------------------
const messageText = ref('')
const sending = ref(false)
const sendError = ref('')

async function handleSend() {
  sendError.value = ''

  if (messageText.value.trim().length < 5) {
    sendError.value = 'Please write a bit more detail before sending.'
    return
  }

  sending.value = true

  try {
    await contactMessageService.send(messageText.value.trim())
    messageText.value = ''
    // Pull the new thread into the list below without a full-page reload.
    await loadThreads(true)
  } catch (err) {
    sendError.value = err.response?.data?.message
      || 'Something went wrong sending your message. Please try again.'
  } finally {
    sending.value = false
  }
}

// --- Conversations (threads + replies) -----------------------------------
const threads = ref([])
const threadsLoading = ref(true)
const threadsError = ref('')

function mapReply(r) {
  return {
    id: r.id,
    body: r.body,
    isAdmin: !!r.is_admin,
    createdAt: r.created_at ? r.created_at.slice(0, 10) : ''
  }
}

function mapThread(t) {
  return {
    id: t.id,
    message: t.message,
    status: t.status,
    createdAt: t.created_at ? t.created_at.slice(0, 10) : '',
    replies: (t.replies || []).map(mapReply)
  }
}

// `silent` skips the full-page loading text so replying/sending doesn't
// flash the whole conversation list back to a "Loading…" state.
async function loadThreads(silent = false) {
  if (!silent) threadsLoading.value = true
  threadsError.value = ''
  try {
    const { data } = await contactMessageService.getMine()
    threads.value = (data.data || data).map(mapThread)
  } catch (e) {
    threadsError.value = 'Could not load your messages. Please refresh and try again.'
  } finally {
    threadsLoading.value = false
  }
}

// --- Replying on an existing thread --------------------------------------
const replyDrafts = reactive({})
const replySending = reactive({})
const replyErrors = reactive({})

async function handleReply(threadId) {
  const body = (replyDrafts[threadId] || '').trim()
  if (!body) return

  replyErrors[threadId] = ''
  replySending[threadId] = true

  try {
    await contactMessageService.addReply(threadId, body)
    replyDrafts[threadId] = ''
    await loadThreads(true)
  } catch (e) {
    replyErrors[threadId] = 'Could not send your reply. Please try again.'
  } finally {
    replySending[threadId] = false
  }
}

onMounted(() => {
  loadThreads()
})
</script>

<style scoped>
.contact {
  position: relative;
  min-height: 100vh;
  background-image:
    linear-gradient(rgba(20, 23, 28, 0.88), rgba(20, 23, 28, 0.9)),
    url('/images/Picture1.jpg');
  background-size: cover;
  background-position: center;
  padding: 130px var(--gutter) 60px;
}

.contact__layout {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 64px;
  align-items: start;
}

/* ---------- Intro panel (left) ---------- */
.contact__intro {
  color: var(--bone);
  padding-right: 12px;
  position: sticky;
  top: 130px;
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
  font-size: clamp(26px, 2.6vw, 36px);
  line-height: 1.25;
  color: var(--bone);
  margin: 0 0 18px;
}

.contact__intro-sub {
  font-size: 15px;
  line-height: 1.7;
  color: var(--bone-dim);
  margin: 0 0 32px;
}

.contact__benefits {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
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

/* ---------- Main column (right) ---------- */
.contact__main {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.contact__card {
  width: 100%;
  background: var(--slate);
  border: 1px solid rgba(169, 129, 75, 0.2);
  border-radius: 6px;
  padding: 36px 36px 40px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

.contact__header {
  text-align: left;
  margin-bottom: 24px;
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
  font-size: 24px;
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

.field textarea,
.thread-card__reply textarea {
  width: 100%;
  background: var(--ink);
  border: 1px solid rgba(237, 231, 218, 0.15);
  border-radius: 4px;
  color: var(--bone);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 12px 14px;
  resize: vertical;
}

.field textarea {
  min-height: 120px;
}

.field textarea::placeholder,
.thread-card__reply textarea::placeholder {
  color: rgba(237, 231, 218, 0.3);
}

.field textarea:focus,
.thread-card__reply textarea:focus {
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

/* ---------- Conversations ---------- */
.contact__threads-head {
  margin-bottom: 18px;
}

.contact__threads-title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 22px;
  color: var(--bone);
  margin: 0;
}

.contact__status-text {
  font-size: 13px;
  color: var(--bone-dim);
  margin: 0 0 16px;
}

.contact__status-text--error {
  color: #d98b6a;
}

.contact__empty {
  background: var(--slate);
  border: 1px solid rgba(169, 129, 75, 0.15);
  border-radius: 6px;
  padding: 32px;
  text-align: center;
  color: var(--bone-dim);
  font-size: 14px;
}

.contact__thread-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.thread-card {
  background: var(--slate);
  border: 1px solid rgba(169, 129, 75, 0.2);
  border-radius: 6px;
  padding: 24px 26px 26px;
}

.thread-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.thread-card__date {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--bone-dim);
}

.status-pill {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(237, 231, 218, 0.2);
  color: var(--bone-dim);
}

.status-pill--new {
  color: var(--brass-bright);
  border-color: rgba(169, 129, 75, 0.5);
}

.status-pill--read {
  color: var(--bone);
}

.status-pill--resolved {
  color: #7fae8e;
  border-color: rgba(127, 174, 142, 0.4);
}

.thread-card__bubbles {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.bubble {
  max-width: 82%;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.6;
}

.bubble--user {
  align-self: flex-start;
  background: var(--ink);
  border: 1px solid rgba(237, 231, 218, 0.1);
  color: var(--bone);
}

.bubble--admin {
  align-self: flex-end;
  background: rgba(169, 129, 75, 0.14);
  border: 1px solid rgba(169, 129, 75, 0.35);
  color: var(--bone);
}

.bubble__author {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--brass-bright);
  margin: 0 0 6px;
}

.bubble__body {
  margin: 0;
  white-space: pre-wrap;
}

.bubble__date {
  margin: 6px 0 0;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--bone-dim);
}

.thread-card__reply {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.thread-card__reply textarea {
  flex: 1;
  min-height: 44px;
}

.thread-card__reply button {
  flex-shrink: 0;
  background: var(--brass);
  color: var(--ink);
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  padding: 12px 18px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.thread-card__reply button:hover:not(:disabled) {
  background: var(--brass-bright);
}

.thread-card__reply button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 980px) {
  .contact__layout {
    grid-template-columns: 1fr;
    gap: 40px;
    max-width: 620px;
    margin: 0 auto;
  }

  .contact__intro {
    padding-right: 0;
    text-align: center;
    position: static;
  }

  .contact__mark { margin-left: auto; margin-right: auto; }
  .contact__benefits li { text-align: left; }
}

@media (max-width: 720px) {
  .contact__card { padding: 28px 22px 32px; }
  .thread-card { padding: 20px 18px 22px; }
  .bubble { max-width: 100%; }
}
</style>
