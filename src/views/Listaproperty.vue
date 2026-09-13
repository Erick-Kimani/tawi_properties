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

        <div v-if="!submitted && !isAuthenticated" class="list-property__auth-notice">
          <p>
            You'll need an account to register a property. Log in or create one
            first — the form below stays visible so you can see what's needed,
            but it's locked until then.
          </p>
          <div class="list-property__auth-notice-actions">
            <RouterLink class="btn btn--primary" :to="{ path: '/login', query: { redirect: '/list-property' } }">
              Log in
            </RouterLink>
            <RouterLink class="list-property__login-prompt-signup" to="/signup">
              Create an account
            </RouterLink>
          </div>
        </div>

        <div
          v-if="!submitted"
          class="list-property__form-wrap"
          :class="{ 'list-property__form-wrap--disabled': !isAuthenticated }"
        >
        <form class="list-property__form" @submit.prevent="handleSubmit">
        <fieldset class="list-property__fieldset" :disabled="!isAuthenticated">
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
            <label for="phone-number">Phone number</label>
            <div class="phone-field">
              <div class="code-picker" @focusout="handleCodeBlur">
                <button
                  id="phone-country-code"
                  type="button"
                  class="code-picker__trigger"
                  :aria-expanded="isCodeOpen"
                  aria-haspopup="listbox"
                  @click="isCodeOpen = !isCodeOpen"
                >
                  <img class="code-picker__flag" :src="selectedCountry.flag" :alt="`${selectedCountry.country} flag`" />
                  <span class="code-picker__code">{{ selectedCountry.code }}</span>
                  <svg class="code-picker__chevron" width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>

                <ul v-if="isCodeOpen" class="code-picker__list" role="listbox">
                  <li v-for="c in countryCodes" :key="c.iso">
                    <button
                      type="button"
                      class="code-picker__option"
                      :class="{ 'code-picker__option--active': c.code === form.phoneCountryCode }"
                      role="option"
                      :aria-selected="c.code === form.phoneCountryCode"
                      @click="selectCountryCode(c)"
                    >
                      <img class="code-picker__flag" :src="c.flag" :alt="`${c.country} flag`" />
                      <span class="code-picker__option-country">{{ c.country }}</span>
                      <span class="code-picker__option-code">{{ c.code }}</span>
                    </button>
                  </li>
                </ul>
              </div>
              <input
                id="phone-number"
                v-model="form.phone"
                type="tel"
                class="phone-field__number"
                placeholder="7xx xxx xxx"
                autocomplete="tel-national"
                required
              />
            </div>
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
          <label :for="`photo-0`">
            Property photos <span class="field__optional">(optional, up to 3)</span>
          </label>
          <p class="field__hint">
            The first photo is used as the listing's cover image; all three
            appear in the photo carousel buyers and tenants see.
          </p>
          <div class="photo-slots">
            <div class="photo-slot" v-for="(slot, index) in form.photos" :key="index">
              <div class="photo-preview" v-if="slot">
                <img :src="slot" :alt="`Property photo ${index + 1} preview`" />
                <button type="button" class="photo-preview__remove" @click="removePhoto(index)">
                  Remove
                </button>
              </div>
              <label v-else class="photo-slot__upload" :for="`photo-${index}`">
                <span class="photo-slot__upload-plus">+</span>
                <span>Photo {{ index + 1 }}{{ index === 0 ? '' : ' (optional)' }}</span>
              </label>
              <input
                :id="`photo-${index}`"
                class="photo-slot__input"
                type="file"
                accept="image/*"
                @change="handlePhoto(index, $event)"
              />
            </div>
          </div>
        </div>

        <p v-if="error" class="field__error">{{ error }}</p>
        <div v-if="needsLogin" class="list-property__login-prompt">
          <p>
            You'll need an account to submit a property — it's how we let you
            know if it's featured, and how you'd manage it afterward.
          </p>
          <RouterLink class="btn btn--primary" :to="{ path: '/login', query: { redirect: '/list-property' } }">
            Log in to continue
          </RouterLink>
          <RouterLink class="list-property__login-prompt-signup" to="/signup">
            or create an account
          </RouterLink>
        </div>

        <button type="submit" class="list-property__submit" :disabled="submitting || !isAuthenticated">
          {{ submitting ? 'Submitting…' : 'Submit for review' }}
        </button>
        </fieldset>
      </form>
      </div>

      <MpesaPaymentModal
        :show="showPaymentModal"
        :initial-phone="form.phone"
        @close="showPaymentModal = false"
        @paid="onPaymentConfirmed"
        @resume="showPaymentModal = true"
      />

      <div v-if="submitted" class="list-property__success">
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
import { reactive, ref, watch, onMounted, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import PropertyMap from '@/components/PropertyMap.vue'
import MpesaPaymentModal from '@/components/MpesaPaymentModal.vue'
import { usePropertyTypes } from '@/stores/propertyTypes'
import { useAuthStore } from '@/stores/auth'
import propertySubmissionService from '@/services/propertySubmissionService'

// Flag icons for the phone field's country-code picker, from the
// "flag-icons" package (https://www.npmjs.com/package/flag-icons).
// Imported individually (rather than the package's bundled CSS, which
// ships all ~260 flags as background images) so the build only includes
// the handful of flags this dropdown actually uses.
import flagKE from 'flag-icons/flags/4x3/ke.svg'
import flagUG from 'flag-icons/flags/4x3/ug.svg'
import flagTZ from 'flag-icons/flags/4x3/tz.svg'
import flagRW from 'flag-icons/flags/4x3/rw.svg'
import flagBI from 'flag-icons/flags/4x3/bi.svg'
import flagSS from 'flag-icons/flags/4x3/ss.svg'
import flagET from 'flag-icons/flags/4x3/et.svg'
import flagSO from 'flag-icons/flags/4x3/so.svg'
import flagNG from 'flag-icons/flags/4x3/ng.svg'
import flagGH from 'flag-icons/flags/4x3/gh.svg'
import flagZA from 'flag-icons/flags/4x3/za.svg'
import flagGB from 'flag-icons/flags/4x3/gb.svg'
import flagUS from 'flag-icons/flags/4x3/us.svg'
import flagIN from 'flag-icons/flags/4x3/in.svg'
import flagAE from 'flag-icons/flags/4x3/ae.svg'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Country codes for the phone field's dropdown. Kenya is first/default
// since that's the overwhelming majority of Tawi's sellers, followed by
// neighbouring East African countries, then a handful of other common
// ones. Extend this list as needed — it's intentionally a plain array,
// not fetched from the backend, since dialing codes don't change.
// `iso` (lowercased) is the class suffix the "flag-icons" package
// (https://www.npmjs.com/package/flag-icons) uses to render each
// country's flag — see the `fi fi-<iso>` spans in the template. Native
// <select><option> elements can't render icons in any browser, which is
// why the code picker below is a custom button + list instead of a
// plain <select>.
const countryCodes = [
  { iso: 'KE', country: 'Kenya', code: '+254', flag: flagKE },
  { iso: 'UG', country: 'Uganda', code: '+256', flag: flagUG },
  { iso: 'TZ', country: 'Tanzania', code: '+255', flag: flagTZ },
  { iso: 'RW', country: 'Rwanda', code: '+250', flag: flagRW },
  { iso: 'BI', country: 'Burundi', code: '+257', flag: flagBI },
  { iso: 'SS', country: 'South Sudan', code: '+211', flag: flagSS },
  { iso: 'ET', country: 'Ethiopia', code: '+251', flag: flagET },
  { iso: 'SO', country: 'Somalia', code: '+252', flag: flagSO },
  { iso: 'NG', country: 'Nigeria', code: '+234', flag: flagNG },
  { iso: 'GH', country: 'Ghana', code: '+233', flag: flagGH },
  { iso: 'ZA', country: 'South Africa', code: '+27', flag: flagZA },
  { iso: 'GB', country: 'United Kingdom', code: '+44', flag: flagGB },
  { iso: 'US', country: 'United States', code: '+1', flag: flagUS },
  { iso: 'IN', country: 'India', code: '+91', flag: flagIN },
  { iso: 'AE', country: 'United Arab Emirates', code: '+971', flag: flagAE },
]

// Whether the country-code dropdown is open, and which entry is
// currently selected (looked up from form.phoneCountryCode so the
// trigger button's flag/code stays in sync no matter how the value
// changes — including resetForm() re-defaulting it to Kenya).
const isCodeOpen = ref(false)
const selectedCountry = computed(
  () => countryCodes.find((c) => c.code === form.phoneCountryCode) || countryCodes[0]
)

function selectCountryCode(c) {
  form.phoneCountryCode = c.code
  isCodeOpen.value = false
}

function handleCodeBlur(event) {
  // Close once focus leaves the whole picker (trigger + list), not just
  // the button that was clicked — e.g. tabbing or clicking an option.
  if (!event.currentTarget.contains(event.relatedTarget)) {
    isCodeOpen.value = false
  }
}

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
    // Split into a country code (dropdown) + local number (free text) so
    // the person never has to type the "+254" prefix themselves. Combined
    // back into one string via fullPhone() right before submit — the
    // backend only ever sees a single `phone` field, same as before.
    phoneCountryCode: countryCodes[0].code,
    phone: '',
    priceRange: '',
    location: '',
    description: '',
    // Up to 3 base64 preview strings only, shown in the template — the
    // real File objects live in photoFiles below and are what actually
    // get uploaded. Empty string = that slot is unfilled.
    photos: ['', '', '']
  }
}

const form = reactive(blankForm())
const photoFiles = ref([null, null, null]) // the actual File per slot, or null
const pin = ref(null) // { lat, lng } | null — set via the PropertyMap picker
const submitting = ref(false)
const submitted = ref(false)
const error = ref('')
// True after a submit attempt comes back 401 — the page itself is public
// (anyone can fill the form out), but actually submitting still requires
// an account server-side. Shows a login/signup prompt instead of a raw
// error string in that specific case.
const needsLogin = ref(false)
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

function handlePhoto(index, event) {
  const file = event.target.files && event.target.files[0]
  if (!file) return

  photoFiles.value[index] = file

  // Base64 preview only — for the <img> in the template. The upload
  // itself uses photoFiles (the raw Files), not this string.
  const reader = new FileReader()
  reader.onload = () => {
    form.photos[index] = reader.result
  }
  reader.readAsDataURL(file)
}

function removePhoto(index) {
  form.photos[index] = ''
  photoFiles.value[index] = null
}

// Combines the dropdown's country code with the typed local number into
// the single string the backend expects for `phone` — e.g. "+254" +
// "712 345 678" -> "+254 712 345 678". Strips a leading "0" from the
// local number (e.g. "0712…") since that's the trunk prefix you drop
// when dialing with a country code instead.
function fullPhone() {
  const local = form.phone.trim().replace(/^0+/, '')
  return local ? `${form.phoneCountryCode} ${local}` : ''
}

// True while the M-Pesa payment modal is open. The form itself has
// already been validated by the time this opens — the modal only
// handles collecting a phone number, sending the STK Push, and waiting
// for the customer to confirm on their phone.
const showPaymentModal = ref(false)

// Set once startPayment's checkout_request_id comes back completed —
// this is what actually authorizes the submission server-side. See
// PropertySubmissionController::store, which re-verifies this payment
// rather than trusting that the modal reaching 'paid' means it's real.
const paymentCheckoutRequestId = ref('')

function handleSubmit() {
  error.value = ''
  needsLogin.value = false

  // Defense in depth — the fieldset above is already disabled (and the
  // submit button too) whenever !isAuthenticated, so this shouldn't be
  // reachable in normal use. Covers the edge case of a session dying
  // server-side without the local reactive state catching up yet.
  if (!isAuthenticated.value) {
    needsLogin.value = true
    return
  }

  if (!form.fullName || !form.email || !form.phone || !form.priceRange || !form.location) {
    error.value = 'Please fill in all required fields.'
    return
  }

  // Form is valid — open the payment modal instead of submitting
  // directly. Actual submission happens in onPaymentConfirmed once the
  // fee is paid.
  showPaymentModal.value = true
}

// Called by MpesaPaymentModal's @paid event once its own polling sees
// the payment reach 'completed'. Submits the actual property-submission
// request, including the checkout_request_id the backend uses to look
// up and consume that payment.
async function onPaymentConfirmed({ checkoutRequestId }) {
  paymentCheckoutRequestId.value = checkoutRequestId
  showPaymentModal.value = false
  submitting.value = true
  error.value = ''

  try {
    const payload = new FormData()
    payload.append('checkout_request_id', checkoutRequestId)
    payload.append('listing_type', form.intent) // 'sale' | 'rent' — seller's intent
    payload.append('type', form.type) // property category, e.g. "Apartments"
    payload.append('full_name', form.fullName)
    payload.append('email', form.email)
    payload.append('phone', fullPhone())
    payload.append('price_range', form.priceRange)
    payload.append('location', form.location)
    if (form.description) payload.append('description', form.description)
    // Field names match the backend's validation: `photo`, `photo_2`,
    // `photo_3` — see PropertySubmissionController::store.
    const photoFieldNames = ['photo', 'photo_2', 'photo_3']
    photoFiles.value.forEach((file, index) => {
      if (file) payload.append(photoFieldNames[index], file)
    })
    if (pin.value) {
      payload.append('latitude', pin.value.lat)
      payload.append('longitude', pin.value.lng)
    }

    await propertySubmissionService.submit(payload)

    lastSubmittedName.value = form.fullName
    submitted.value = true
  } catch (err) {
    if (err.response?.status === 401) {
      needsLogin.value = true
    } else {
      error.value = err.response?.data?.message
        || 'Your payment went through, but something went wrong submitting your property. Please contact us with your M-Pesa message so we can complete it manually.'
    }
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  Object.assign(form, blankForm())
  photoFiles.value = [null, null, null]
  pin.value = null
  submitted.value = false
  error.value = ''
  needsLogin.value = false
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

/* Country-code + local-number combo — reads as a single input, with a
   divider between the two segments instead of two separate boxes. */
.phone-field {
  display: flex;
  align-items: stretch;
  background: var(--ink);
  border: 1px solid rgba(237, 231, 218, 0.15);
  border-radius: 4px;
  overflow: visible;
  transition: border-color 0.15s ease;
}

.phone-field:focus-within {
  border-color: var(--brass);
}

.phone-field__number {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  color: var(--bone);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 12px 14px;
}

.phone-field__number:focus {
  outline: none;
}

.phone-field__number::placeholder {
  color: rgba(237, 231, 218, 0.3);
}

/* Custom country-code picker — a native <select> can't render flag
   icons inside its options in any browser, so this is a button + list
   instead, using the "flag-icons" package's `.fi.fi-<iso>` classes. */
.code-picker {
  position: relative;
  flex: 0 0 auto;
  border-right: 1px solid rgba(237, 231, 218, 0.15);
}

.code-picker__trigger {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 100%;
  background: transparent;
  border: none;
  color: var(--bone);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 12px 10px 12px 12px;
  cursor: pointer;
}

.code-picker__trigger:focus {
  outline: none;
}

.code-picker__code {
  white-space: nowrap;
}

.code-picker__chevron {
  color: var(--bone-dim);
  flex-shrink: 0;
}

.code-picker__list {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 20;
  list-style: none;
  margin: 0;
  padding: 6px 0;
  width: 240px;
  max-height: 280px;
  overflow-y: auto;
  background: var(--slate);
  border: 1px solid rgba(169, 129, 75, 0.3);
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

.code-picker__option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: none;
  border: none;
  color: var(--bone);
  font-family: var(--font-body);
  font-size: 13.5px;
  text-align: left;
  padding: 9px 14px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.code-picker__option:hover,
.code-picker__option--active {
  background: rgba(169, 129, 75, 0.14);
}

.code-picker__option-country {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.code-picker__option-code {
  flex-shrink: 0;
  color: var(--bone-dim);
  font-family: var(--font-mono);
  font-size: 12px;
}

.code-picker .fi,
.code-picker__flag {
  flex-shrink: 0;
  width: 18px;
  height: 13px;
  object-fit: cover;
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgba(237, 231, 218, 0.15);
}

.photo-slots {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 4px;
}

.photo-slot {
  position: relative;
}

.photo-slot__input {
  /* The visible control is the label below (so all 3 slots look alike
     whether filled or not) — the native input just sits invisibly on
     top of it, still fully clickable/keyboard-accessible. */
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.photo-slot__upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 92px;
  border: 1px dashed rgba(237, 231, 218, 0.3);
  border-radius: 8px;
  color: var(--bone-dim);
  font-size: 12px;
  text-align: center;
  padding: 8px;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.photo-slot:hover .photo-slot__upload {
  border-color: var(--brass);
  color: var(--bone);
}

.photo-slot__upload-plus {
  font-size: 20px;
  line-height: 1;
  color: var(--brass-bright);
}

.photo-preview {
  position: relative;
  height: 92px;
  border-radius: 8px;
  overflow: hidden;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.photo-preview__remove {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(20, 23, 28, 0.75);
  border: none;
  color: #d98b6a;
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  padding: 5px;
}

@media (max-width: 480px) {
  .photo-slots {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .photo-slot__upload,
  .photo-preview {
    height: 76px;
  }
}

.field__error {
  margin: 0;
  font-size: 12px;
  color: #d98b6a;
}

.list-property__auth-notice {
  margin-bottom: 24px;
  padding: 18px 20px;
  background: rgba(169, 129, 75, 0.1);
  border: 1px solid rgba(169, 129, 75, 0.4);
  border-radius: 6px;
}

.list-property__auth-notice p {
  margin: 0 0 14px;
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--bone-dim, #cfc8b6);
}

.list-property__auth-notice-actions {
  display: flex;
  align-items: center;
  gap: 18px;
}

/* Visually greys out + blocks interaction with everything inside —
   including the PropertyMap picker, which isn't a native form control
   and so wouldn't be caught by <fieldset disabled> on its own. The
   fieldset below handles keyboard/native-control disabling; this
   handles the rest (map clicks, visual dimming). */
.list-property__form-wrap--disabled {
  position: relative;
  opacity: 0.5;
  filter: grayscale(0.4);
  pointer-events: none;
  user-select: none;
}

.list-property__fieldset {
  border: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.list-property__login-prompt {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  background: rgba(169, 129, 75, 0.08);
  border: 1px solid rgba(169, 129, 75, 0.35);
  border-radius: 6px;
}

.list-property__login-prompt p {
  flex: 1 1 100%;
  margin: 0 0 4px;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--bone-dim, #cfc8b6);
}

.list-property__login-prompt-signup {
  font-size: 13px;
  color: var(--brass-bright, #c8a06a);
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