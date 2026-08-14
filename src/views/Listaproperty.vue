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
          <label id="intent-label">I want to</label>
          <div class="intent-toggle" role="radiogroup" aria-labelledby="intent-label">
            <button
              type="button"
              class="intent-toggle__option"
              :class="{ 'intent-toggle__option--active': form.intent === 'sale' }"
              role="radio"
              :aria-checked="form.intent === 'sale'"
              @click="form.intent = 'sale'"
            >
              Sell
            </button>
            <button
              type="button"
              class="intent-toggle__option"
              :class="{ 'intent-toggle__option--active': form.intent === 'rent' }"
              role="radio"
              :aria-checked="form.intent === 'rent'"
              @click="form.intent = 'rent'"
            >
              Rent out
            </button>
          </div>
          <p class="field__hint">
            This determines whether your listing appears on the Buy or Rent page.
          </p>
        </div>

        <div class="field">
          <label for="type">Property type</label>
          <select id="type" v-model="form.type" required :disabled="propertyTypesLoading">
            <option v-for="t in propertyTypes" :key="t" :value="t">{{ t }}</option>
          </select>
          <p v-if="propertyTypesError" class="field__error">{{ propertyTypesError }}</p>
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
            <label for="location">
              Location <span class="field__optional">(auto-fills from the map pin below)</span>
            </label>
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
          <div class="list-property__map-label-row">
            <label>
              Pin exact location on map <span class="field__optional">(optional, but recommended)</span>
            </label>
            <button type="button" class="list-property__expand-map-btn" @click="expandMap">
              Expand map
            </button>
          </div>
          <div class="list-property__map-shell">
            <PropertyMap
              mode="picker"
              v-model="pin"
              height="360px"
              @update:address="onPinAddressResolved"
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
import { reactive, ref, watch, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import PropertyMap from '@/components/PropertyMap.vue'
import { usePropertyTypes } from '@/stores/propertyTypes'
import propertySubmissionService from '@/services/propertySubmissionService'

const route = useRoute()
const router = useRouter()

const {
  propertyTypes,
  loading: propertyTypesLoading,
  error: propertyTypesError
} = usePropertyTypes()

function blankForm() {
  return {
    // Seller's intent — distinct from `type` (the property category, e.g.
    // "Apartments", "Land/Plot"). This is what routes the listing onto the
    // Buy page ('sale') vs the Rent page ('rent') once featured. Kept as
    // its own field/column (`listing_type`) rather than folded into the
    // category list, since it answers a different question (what the
    // seller wants to do) than `type` does (what kind of property it is).
    intent: 'sale',
    type: propertyTypes.value[0] || '',
    fullName: '',
    email: '',
    phone: '',
    priceRange: '',
    location: '',
    description: '',
    photo: '' // base64 preview only, shown in the template — the real
               // File object lives in photoFile below and is what
               // actually gets uploaded.
  }
}

const form = reactive(blankForm())
const photoFile = ref(null) // the actual File selected via the input, or null
const pin = ref(null) // { lat, lng } | null — set via the PropertyMap picker
const submitting = ref(false)
const submitted = ref(false)
const error = ref('')
const lastSubmittedName = ref('')

// Keep the selected type valid once the real API list arrives (it may
// differ from the fallback options used while loading).
watch(propertyTypes, (types) => {
  if (types.length && !types.includes(form.type)) {
    form.type = types[0]
  }
})

// Sends the user to the full-page map picker, telling it to send them back
// here with the chosen coordinates. If a pin is already set, pass it along
// so the full-page map opens centered on it instead of the default view.
function expandMap() {
  const query = { returnTo: '/list-property' }
  if (pin.value) {
    query.lat = pin.value.lat
    query.lng = pin.value.lng
  }
  router.push({ path: '/property-map', query })
}

// Called whenever the map's pin moves (click, drag, or search-select) —
// keeps the Location field matching the actual pin instead of letting
// separately-typed text drift from where it's really dropped.
function onPinAddressResolved(address) {
  if (address) form.location = address
}

// Picks up pinLat/pinLng (and, if resolved, address) if we just came back
// from the full-page map picker, then strips them from the URL so a
// refresh doesn't reapply them.
onMounted(() => {
  const { pinLat, pinLng, address } = route.query
  if (pinLat === undefined || pinLng === undefined) return

  const lat = Number(pinLat)
  const lng = Number(pinLng)
  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
    pin.value = { lat, lng }
  }
  if (typeof address === 'string' && address) {
    form.location = address
  }

  const cleanQuery = { ...route.query }
  delete cleanQuery.pinLat
  delete cleanQuery.pinLng
  delete cleanQuery.address
  router.replace({ path: route.path, query: cleanQuery })
})

function handlePhoto(event) {
  const file = event.target.files && event.target.files[0]
  if (!file) return

  photoFile.value = file

  // Base64 preview only — for the <img> in the template. The upload
  // itself uses photoFile (the raw File), not this string.
  const reader = new FileReader()
  reader.onload = () => {
    form.photo = reader.result
  }
  reader.readAsDataURL(file)
}

async function handleSubmit() {
  error.value = ''

  if (!form.fullName || !form.email || !form.phone || !form.priceRange || !form.location) {
    error.value = 'Please fill in all required fields.'
    return
  }

  submitting.value = true

  try {
    const payload = new FormData()
    payload.append('listing_type', form.intent) // 'sale' | 'rent' — seller's intent
    payload.append('type', form.type) // property category, e.g. "Apartments"
    payload.append('full_name', form.fullName)
    payload.append('email', form.email)
    payload.append('phone', form.phone)
    payload.append('price_range', form.priceRange)
    payload.append('location', form.location)
    if (form.description) payload.append('description', form.description)
    if (photoFile.value) payload.append('photo', photoFile.value)
    if (pin.value) {
      payload.append('latitude', pin.value.lat)
      payload.append('longitude', pin.value.lng)
    }

    await propertySubmissionService.submit(payload)

    lastSubmittedName.value = form.fullName
    submitted.value = true
  } catch (err) {
    error.value = err.response?.data?.message
      || 'Something went wrong submitting your property. Please try again.'
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  Object.assign(form, blankForm())
  photoFile.value = null
  pin.value = null
  submitted.value = false
  error.value = ''
}
</script>

<style scoped>
.list-property__map-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.list-property__expand-map-btn {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--brass-bright);
  background: transparent;
  border: 1px solid var(--brass);
  border-radius: 999px;
  padding: 5px 12px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.list-property__expand-map-btn:hover {
  background: var(--brass);
  color: #14171c;
}

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

.field__hint {
  margin: 0;
  font-size: 12px;
  color: var(--bone-dim);
  opacity: 0.8;
}

.intent-toggle {
  display: flex;
  gap: 8px;
}

.intent-toggle__option {
  flex: 1;
  background: var(--ink);
  border: 1px solid rgba(237, 231, 218, 0.15);
  border-radius: 4px;
  color: var(--bone-dim);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.intent-toggle__option:hover {
  border-color: rgba(169, 129, 75, 0.5);
  color: var(--bone);
}

.intent-toggle__option--active {
  background: var(--brass);
  border-color: var(--brass);
  color: var(--ink);
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