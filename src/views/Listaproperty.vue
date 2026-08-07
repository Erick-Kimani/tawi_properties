<template>
  <div class="list-property">
    <div class="list-property__layout">
      <!-- Explanatory panel -->
      <div class="list-property__intro">
        <RouterLink class="list-property__mark" to="/">
          <span class="list-property__mark-glyph">T</span>
        </RouterLink>
        <p class="list-property__eyebrow">Owners &amp; agents</p>
        <h1 class="list-property__intro-title">
          Put your property in front of buyers and tenants who are ready to move
        </h1>
        <p class="list-property__intro-sub">
          Tawi Properties lets you add your property directly to the app. Register
          a few details below — the type of property, your contact information,
          price range and location — and our team will review it for a featured
          placement so serious buyers and tenants can find it.
        </p>

        <ul class="list-property__benefits">
          <li>
            <span class="list-property__benefit-mark">01</span>
            Reach people actively searching for flats, rentals, land and houses
          </li>
          <li>
            <span class="list-property__benefit-mark">02</span>
            No agent required — register the property yourself in minutes
          </li>
          <li>
            <span class="list-property__benefit-mark">03</span>
            Our team reviews every submission before it goes live
          </li>
        </ul>
      </div>

      <!-- Registration card -->
      <div class="list-property__card">
        <div class="list-property__header">
          <p class="list-property__eyebrow list-property__eyebrow--card">Register your property</p>
          <h2 class="list-property__title">Property details</h2>
          <p class="list-property__sub">
            Fill in the form below to submit your property for review.
          </p>
        </div>

        <form v-if="!submitted" class="list-property__form" @submit.prevent="handleSubmit">
        <div class="field">
          <label for="type">Property type</label>
          <select id="type" v-model="form.type" required>
            <option v-for="t in propertyTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

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

        <div class="field-row">
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
            <label for="phone">Phone number</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              placeholder="+254 7xx xxx xxx"
              autocomplete="tel"
              required
            />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="priceRange">Price range</label>
            <input
              id="priceRange"
              v-model="form.priceRange"
              type="text"
              placeholder="e.g. KES 8M – 12M"
              required
            />
          </div>
          <div class="field">
            <label for="location">Location</label>
            <input
              id="location"
              v-model="form.location"
              type="text"
              placeholder="e.g. Karen, Nairobi"
              required
            />
          </div>
        </div>

        <div class="field">
          <label>
            Pin exact location on map <span class="field__optional">(optional, but recommended)</span>
          </label>
          <div class="list-property__map-shell">
            <PropertyMap
              mode="picker"
              v-model="pin"
              height="360px"
            />
          </div>
        </div>

        <div class="field">
          <label for="description">
            Description <span class="field__optional">(optional)</span>
          </label>
          <textarea
            id="description"
            v-model="form.description"
            rows="3"
            placeholder="A few details buyers or tenants should know..."
          ></textarea>
        </div>

        <div class="field">
          <label for="photo">
            Property photo <span class="field__optional">(optional)</span>
          </label>
          <input id="photo" type="file" accept="image/*" @change="handlePhoto" />
          <div class="photo-preview" v-if="form.photo">
            <img :src="form.photo" alt="Property preview" />
            <button type="button" class="photo-preview__remove" @click="form.photo = ''">
              Remove photo
            </button>
          </div>
        </div>

        <p v-if="error" class="field__error">{{ error }}</p>

        <button type="submit" class="list-property__submit" :disabled="submitting">
          {{ submitting ? 'Submitting…' : 'Submit for review' }}
        </button>
      </form>

      <div v-else class="list-property__success">
        <div class="list-property__success-glyph">✓</div>
        <h2>Submission received</h2>
        <p>
          Thank you, {{ lastSubmittedName }}. Our team will review your property
          and reach out if it's selected to be featured.
        </p>
        <div class="list-property__success-actions">
          <button type="button" class="btn btn--ghost" @click="resetForm">
            Submit another property
          </button>
          <RouterLink class="btn btn--primary" to="/">Back to home</RouterLink>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import PropertyMap from '@/components/PropertyMap.vue'

const STORAGE_KEY = 'tawi_admin_feature_requests'

const propertyTypes = ['Flat', 'Rental', 'Land', 'House', 'Commercial']

function blankForm() {
  return {
    type: 'Flat',
    fullName: '',
    email: '',
    phone: '',
    priceRange: '',
    location: '',
    description: '',
    photo: ''
  }
}

const form = reactive(blankForm())
const pin = ref(null) // { lat, lng } | null — set via the PropertyMap picker
const submitting = ref(false)
const submitted = ref(false)
const error = ref('')
const lastSubmittedName = ref('')

function makeId() {
  return (crypto.randomUUID && crypto.randomUUID()) || `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function handlePhoto(event) {
  const file = event.target.files && event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.photo = reader.result
  }
  reader.readAsDataURL(file)
}

function handleSubmit() {
  error.value = ''

  if (!form.fullName || !form.email || !form.phone || !form.priceRange || !form.location) {
    error.value = 'Please fill in all required fields.'
    return
  }

  submitting.value = true

  // No backend yet — store the request alongside what the Admin dashboard reads,
  // so it shows up in the pending queue there. Swap this for a real API call later.
  setTimeout(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const existing = raw ? JSON.parse(raw) : []
      existing.unshift({
        id: makeId(),
        ...form,
        latitude: pin.value ? pin.value.lat : null,
        longitude: pin.value ? pin.value.lng : null,
        status: 'pending',
        submittedAt: new Date().toISOString().slice(0, 10)
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
    } catch (e) {
      // storage unavailable — submission still confirms to the user this session
    }

    lastSubmittedName.value = form.fullName
    submitting.value = false
    submitted.value = true
  }, 700)
}

function resetForm() {
  Object.assign(form, blankForm())
  pin.value = null
  submitted.value = false
  error.value = ''
}
</script>

<style scoped>
.list-property__map-shell {
  margin-top: 10px;
  padding: 8px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(169, 129, 75, 0.2);
}

.list-property__map-shell :deep(.property-map__stage) {
  border-radius: 14px;
}

.list-property__map-shell :deep(.property-map__toolbar) {
  top: 12px;
  left: 12px;
  right: 12px;
}
</style>

<style scoped>
.list-property {
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

.list-property__layout {
  width: 100%;
  max-width: 1180px;
  display: grid;
  grid-template-columns: 1fr 480px;
  gap: 64px;
  align-items: center;
}

/* ---------- Intro panel (left) ---------- */
.list-property__intro {
  color: var(--bone);
  padding-right: 12px;
}

.list-property__mark {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--brass);
  margin-bottom: 24px;
  text-decoration: none;
}

.list-property__mark-glyph {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--brass-bright);
}

.list-property__intro-title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(28px, 3.2vw, 42px);
  line-height: 1.25;
  color: var(--bone);
  margin: 0 0 18px;
  max-width: 520px;
}

.list-property__intro-sub {
  font-size: 15px;
  line-height: 1.7;
  color: var(--bone-dim);
  margin: 0 0 32px;
  max-width: 460px;
}

.list-property__benefits {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 460px;
}

.list-property__benefits li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--bone);
}

.list-property__benefit-mark {
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

/* ---------- Registration card (right) ---------- */
.list-property__card {
  width: 100%;
  background: var(--slate);
  border: 1px solid rgba(169, 129, 75, 0.2);
  border-radius: 6px;
  padding: 40px 36px 44px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

.list-property__header {
  text-align: left;
  margin-bottom: 28px;
}

.list-property__eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brass-bright);
  margin: 0 0 10px;
}

.list-property__eyebrow--card {
  margin-bottom: 8px;
}

.list-property__title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 26px;
  color: var(--bone);
  margin: 0 0 10px;
}

.list-property__sub {
  font-size: 14px;
  line-height: 1.5;
  color: var(--bone-dim);
  margin: 0;
}

.list-property__form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-row {
  display: flex;
  gap: 16px;
}

.field-row .field {
  flex: 1;
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

.field__optional {
  text-transform: none;
  letter-spacing: normal;
  opacity: 0.7;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  background: var(--ink);
  border: 1px solid rgba(237, 231, 218, 0.15);
  border-radius: 4px;
  color: var(--bone);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 12px 14px;
}

.field textarea {
  resize: vertical;
  min-height: 72px;
  font-family: var(--font-body);
}

.field input::placeholder,
.field textarea::placeholder {
  color: rgba(237, 231, 218, 0.3);
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--brass);
}

.field input[type='file'] {
  padding: 10px 12px;
  color: var(--bone-dim);
  font-size: 13px;
}

.photo-preview {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.photo-preview img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 6px;
}

.photo-preview__remove {
  background: none;
  border: none;
  color: #d98b6a;
  font-family: var(--font-mono);
  font-size: 12px;
  cursor: pointer;
  padding: 0;
}

.field__error {
  margin: 0;
  font-size: 12px;
  color: #d98b6a;
}

.list-property__submit {
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

.list-property__submit:hover:not(:disabled) {
  background: var(--brass-bright);
}

.list-property__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ---------- Success state ---------- */
.list-property__success {
  text-align: center;
  padding: 12px 0 4px;
}

.list-property__success-glyph {
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

.list-property__success h2 {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 22px;
  color: var(--bone);
  margin: 0 0 12px;
}

.list-property__success p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--bone-dim);
  margin: 0 0 28px;
}

.list-property__success-actions {
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
  .list-property__layout {
    grid-template-columns: 1fr;
    gap: 40px;
    max-width: 560px;
  }

  .list-property__intro {
    padding-right: 0;
    text-align: center;
  }

  .list-property__mark { margin-left: auto; margin-right: auto; }
  .list-property__intro-title,
  .list-property__intro-sub { max-width: none; }
  .list-property__benefits { max-width: none; }
  .list-property__benefits li { text-align: left; }
}

@media (max-width: 720px) {
  .field-row { flex-direction: column; }
  .list-property__card { padding: 32px 24px 36px; }
}
</style>