<template>
  <div class="edit-modal__backdrop" @click.self="$emit('close')">
    <div class="edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
      <div class="edit-modal__head">
        <div>
          <h3 id="edit-modal-title">Request an edit</h3>
          <p class="edit-modal__sub">{{ submission.location || submission.type }}</p>
        </div>
        <button type="button" class="edit-modal__close" @click="$emit('close')" aria-label="Close">
          &times;
        </button>
      </div>

      <!-- State 1: a request from this listing is already awaiting review -->
      <div v-if="submission.has_pending_edit_request" class="edit-modal__notice">
        <p>
          You already have an edit request waiting on admin review for this listing.
          You'll be able to request another change once this one's been decided —
          we'll let you know either way.
        </p>
      </div>

      <!-- State 2: both slots used, none pending -->
      <div v-else-if="remaining <= 0" class="edit-modal__notice">
        <p>
          You've used all your edit requests for this listing. For any further change,
          message us on WhatsApp (button at the bottom right) or through Contact Us with a substantive reason —
          our team reviews these individually.
        </p>
        <RouterLink class="btn btn--primary" :to="contactLink">
          Go to Contact Us
        </RouterLink>
      </div>

      <!-- State 3: the actual form -->
      <form v-else class="edit-modal__form" @submit.prevent="handleSubmit">
        <p class="edit-modal__remaining">
          {{ remaining }} of {{ maxRequests }} edit request{{ remaining === 1 ? '' : 's' }} remaining
          for this listing.
        </p>

        <p class="edit-modal__note">
          Changes go live only after an admin reviews and approves them. Your name
          and email stay as they are — this form covers property type, description,
          map position, and phone only.
        </p>

        <div class="field">
          <label for="edit-type">Property type</label>
          <select id="edit-type" v-model="formType">
            <option v-for="t in propertyTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div class="field">
          <label for="edit-description">Description</label>
          <textarea id="edit-description" v-model="formDescription" rows="3"></textarea>
        </div>

        <div class="field">
          <label>Position on map</label>
          <div class="edit-modal__map-shell">
            <PropertyMap mode="picker" v-model="pin" height="240px" />
          </div>
          <p class="field__hint">Click the map to move the pin, or leave it as-is to keep the current position.</p>
        </div>

        <div class="field">
          <label for="edit-phone">Phone</label>
          <input id="edit-phone" v-model="formPhone" type="tel" />
        </div>

        <div class="field">
          <label>Photos</label>
          <div class="edit-modal__photos">
            <div v-for="slot in photoSlots" :key="slot.key" class="photo-slot">
              <div class="photo-slot__frame">
                <img v-if="previews[slot.key] || slot.current" :src="previews[slot.key] || slot.current" :alt="slot.label" />
                <span v-else class="photo-slot__empty">No photo</span>
              </div>
              <span class="photo-slot__label">{{ slot.label }}</span>
              <label class="photo-slot__btn" :class="{ 'photo-slot__btn--disabled': submitting }">
                {{ newPhotos[slot.key] ? 'Change' : (slot.current ? 'Replace' : 'Add') }}
                <input
                  type="file"
                  accept="image/*"
                  :disabled="submitting"
                  @change="onPhotoPicked(slot.key, $event)"
                />
              </label>
              <button
                v-if="newPhotos[slot.key]"
                type="button"
                class="photo-slot__undo"
                @click="clearPhoto(slot.key)"
              >
                Undo
              </button>
            </div>
          </div>
          <p class="field__hint">Images up to 5MB each. New photos go live only after an admin approves the request.</p>
        </div>

        <div class="field">
          <label for="edit-note">Reason for this change</label>
          <textarea
            id="edit-note"
            v-model="sellerNote"
            rows="3"
            placeholder="E.g. the price range listed is for the old configuration -- updating the description to reflect the renovation."
            :disabled="submitting"
          ></textarea>
        </div>

        <p v-if="error" class="field__error">{{ error }}</p>
        <p v-if="!hasChanges" class="edit-modal__hint-row">
          Change at least one field above to submit a request.
        </p>

        <div class="edit-modal__actions">
          <button type="button" class="btn btn--ghost" @click="$emit('close')" :disabled="submitting">
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn--primary"
            :disabled="submitting || !hasChanges || sellerNote.trim().length < 10"
          >
            {{ submitting ? 'Submitting…' : 'Submit edit request' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import PropertyMap from '@/components/PropertyMap.vue'
import { usePropertyTypes } from '@/stores/propertyTypes'
import propertyEditRequestService from '@/services/propertyEditRequestService'

const props = defineProps({
  submission: { type: Object, required: true }
})

const emit = defineEmits(['close', 'submitted'])

const { propertyTypes } = usePropertyTypes()

// Backend's single source of truth for the cap -- kept as a local
// constant purely for display text (e.g. "X of 2 remaining"). If the cap
// ever changes server-side, PropertyEditRequest::MAX_PER_SUBMISSION is
// the one place that actually enforces it; this just needs updating to
// match so the copy doesn't lie.
// Includes any extra slots an admin has granted for this listing.
const maxRequests = computed(() => props.submission.edit_requests_limit ?? 2)
const remaining = computed(() => props.submission.edit_requests_remaining ?? 0)

const contactLink = computed(() => ({
  path: '/contact',
  query: {
    message:
      `Requesting a further edit to my listing "${props.submission.location || props.submission.type}" ` +
      `(submission #${props.submission.id}) -- I've already used all my edit requests. Reason: `
  }
}))

// Seeded from the submission's current values so the form shows what's
// actually live right now, and so handleSubmit can diff against these to
// send only the fields that actually changed.
const original = {
  type: props.submission.type,
  description: props.submission.description || '',
  latitude: props.submission.latitude ?? null,
  longitude: props.submission.longitude ?? null,
  phone: props.submission.phone
}

const formType = ref(original.type)
const formDescription = ref(original.description)
const formPhone = ref(original.phone)
const pin = ref(
  original.latitude != null && original.longitude != null
    ? { lat: original.latitude, lng: original.longitude }
    : null
)
const sellerNote = ref('')
const submitting = ref(false)
const error = ref('')

// Photos: up to three slots, each showing the live photo (if any) until the
// seller picks a replacement, which is previewed locally and only uploaded
// on submit.
const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const photoSlots = [
  { key: 'photo', label: 'Photo 1', current: props.submission.photo_url },
  { key: 'photo_2', label: 'Photo 2', current: props.submission.photo_url_2 },
  { key: 'photo_3', label: 'Photo 3', current: props.submission.photo_url_3 }
]
const newPhotos = ref({ photo: null, photo_2: null, photo_3: null })
const previews = ref({ photo: null, photo_2: null, photo_3: null })
const photosChanged = computed(() => Object.values(newPhotos.value).some(Boolean))

function clearPhoto(key) {
  if (previews.value[key]) URL.revokeObjectURL(previews.value[key])
  previews.value[key] = null
  newPhotos.value[key] = null
}

function onPhotoPicked(key, event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    error.value = 'Please choose an image file.'
    return
  }
  if (file.size > MAX_PHOTO_BYTES) {
    error.value = 'Each photo must be 5MB or smaller.'
    return
  }
  error.value = ''
  clearPhoto(key)
  newPhotos.value[key] = file
  previews.value[key] = URL.createObjectURL(file)
}

onBeforeUnmount(() => {
  Object.keys(previews.value).forEach(clearPhoto)
})

const pinChanged = computed(() => {
  const latChanged = (pin.value?.lat ?? null) !== original.latitude
  const lngChanged = (pin.value?.lng ?? null) !== original.longitude
  return latChanged || lngChanged
})

const hasChanges = computed(() =>
  formType.value !== original.type ||
  formDescription.value.trim() !== original.description.trim() ||
  formPhone.value.trim() !== (original.phone || '').trim() ||
  pinChanged.value ||
  photosChanged.value
)

async function handleSubmit() {
  error.value = ''

  if (!hasChanges.value) {
    error.value = 'Please change at least one field (property type, description, map position, phone, or photos).'
    return
  }
  if (sellerNote.value.trim().length < 10) {
    error.value = 'Please explain the change in a bit more detail (at least 10 characters).'
    return
  }

  const payload = { seller_note: sellerNote.value.trim() }
  if (formType.value !== original.type) payload.type = formType.value
  if (formDescription.value.trim() !== original.description.trim()) {
    payload.description = formDescription.value.trim()
  }
  if (formPhone.value.trim() !== (original.phone || '').trim()) {
    payload.phone = formPhone.value.trim()
  }
  if (pinChanged.value && pin.value) {
    payload.latitude = pin.value.lat
    payload.longitude = pin.value.lng
  }

  // Photos need a multipart body; otherwise keep sending plain JSON.
  let body = payload
  if (photosChanged.value) {
    body = new FormData()
    Object.entries(payload).forEach(([k, v]) => body.append(k, v))
    Object.entries(newPhotos.value).forEach(([k, file]) => {
      if (file) body.append(k, file)
    })
  }

  submitting.value = true
  try {
    const { data } = await propertyEditRequestService.submit(props.submission.id, body)
    emit('submitted', {
      submissionId: props.submission.id,
      editRequestsRemaining: data.edit_requests_remaining
    })
  } catch (e) {
    error.value = e.response?.data?.error || 'Could not submit this edit request. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.edit-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(15, 19, 24, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

.edit-modal {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--slate);
  border: 1px solid rgba(169, 129, 75, 0.3);
  border-radius: 6px;
  padding: 28px 26px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
}

.edit-modal__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.edit-modal h3 {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 19px;
  color: var(--bone);
  margin: 0 0 4px;
}

.edit-modal__sub {
  font-size: 12.5px;
  color: var(--bone-dim);
  margin: 0;
}

.edit-modal__close {
  background: none;
  border: none;
  color: var(--bone-dim);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  padding: 0 2px;
}
.edit-modal__close:hover { color: var(--bone); }

.edit-modal__notice {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--bone-dim);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.edit-modal__remaining {
  font-family: var(--font-mono);
  font-size: 11.5px;
  letter-spacing: 0.04em;
  color: var(--brass-bright);
  margin: 0 0 4px;
}

.edit-modal__note {
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--bone-dim);
  margin: 0 0 18px;
}

.edit-modal__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--brass);
}

.field__hint {
  font-size: 11.5px;
  color: var(--bone-dim);
  margin: 2px 0 0;
}

.field__error {
  margin: 0;
  font-size: 12px;
  color: var(--coral);
}

.edit-modal__hint-row {
  margin: 0;
  font-size: 12px;
  color: var(--bone-dim);
}

.edit-modal__map-shell {
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(237, 231, 218, 0.15);
}

.edit-modal__photos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.photo-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.photo-slot__frame {
  width: 100%;
  aspect-ratio: 4 / 3;
  background: var(--ink);
  border: 1px solid rgba(237, 231, 218, 0.15);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-slot__frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-slot__empty {
  font-size: 11.5px;
  color: var(--bone-dim);
}

.photo-slot__label {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--bone-dim);
}

.photo-slot__btn {
  font-size: 12px;
  color: var(--brass-bright);
  border: 1px solid rgba(169, 129, 75, 0.45);
  border-radius: 4px;
  padding: 5px 12px;
  cursor: pointer;
  text-transform: none;
  letter-spacing: 0;
  font-family: var(--font-body);
}
.photo-slot__btn:hover { border-color: var(--brass); }
.photo-slot__btn input { display: none; }
.photo-slot__btn--disabled { opacity: 0.6; cursor: not-allowed; }

.photo-slot__undo {
  background: none;
  border: none;
  font-size: 11.5px;
  color: var(--bone-dim);
  cursor: pointer;
  text-decoration: underline;
}

.edit-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.btn {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.02em;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  border: 1px solid transparent;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.btn--primary {
  background: var(--brass);
  color: var(--ink);
}
.btn--primary:hover:not(:disabled) { background: var(--brass-bright); }

.btn--ghost {
  background: transparent;
  border-color: rgba(237, 231, 218, 0.2);
  color: var(--bone-dim);
}
.btn--ghost:hover:not(:disabled) { color: var(--bone); border-color: var(--brass); }

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>