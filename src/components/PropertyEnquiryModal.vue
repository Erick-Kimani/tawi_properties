<template>
  <Teleport to="body">
    <div
      v-if="listing"
      class="enquiry-modal__backdrop"
      role="presentation"
      @click.self="$emit('close')"
      @keydown.esc="$emit('close')"
      @keydown.left="prevImage"
      @keydown.right="nextImage"
    >
      <div
        class="enquiry-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="`${listing.type || 'Property'} details`"
        tabindex="-1"
        ref="dialogEl"
      >
        <button type="button" class="enquiry-modal__close" aria-label="Close" @click="$emit('close')">
          &times;
        </button>

        <!-- Left: photo carousel -->
        <div class="enquiry-modal__gallery">
          <Transition name="enquiry-modal__fade" mode="out-in">
            <div
              :key="activeIndex"
              class="enquiry-modal__media"
              :style="{ backgroundImage: `url(${images[activeIndex]})` }"
            ></div>
          </Transition>

          <span class="enquiry-modal__badge" :style="{ background: pinColor }">
            {{ categoryLabel }}
          </span>

          <template v-if="images.length > 1">
            <button
              type="button"
              class="enquiry-modal__nav enquiry-modal__nav--prev"
              aria-label="Previous photo"
              @click="prevImage"
            >
              &#8249;
            </button>
            <button
              type="button"
              class="enquiry-modal__nav enquiry-modal__nav--next"
              aria-label="Next photo"
              @click="nextImage"
            >
              &#8250;
            </button>

            <div class="enquiry-modal__thumbs">
              <button
                v-for="(img, i) in images"
                :key="i"
                type="button"
                class="enquiry-modal__thumb"
                :class="{ 'enquiry-modal__thumb--active': i === activeIndex }"
                :style="{ backgroundImage: `url(${img})` }"
                :aria-label="`Photo ${i + 1} of ${images.length}`"
                @click="activeIndex = i"
              ></button>
            </div>
          </template>
        </div>

        <!-- Right: glass detail panel -->
        <div class="enquiry-modal__body">
          <p class="enquiry-modal__price">{{ listing.priceRange }}</p>
          <h2 class="enquiry-modal__location">{{ listing.location }}</h2>
          <p class="enquiry-modal__owner">Listed by {{ listing.fullName }}</p>

          <div class="enquiry-modal__contact">
            <a
              v-if="listing.phone"
              class="enquiry-modal__contact-link"
              :href="`tel:${listing.phone}`"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3.5 1.5h2l1 3-1.5 1a9 9 0 0 0 4.5 4.5l1-1.5 3 1v2c0 .8-.7 1.5-1.5 1.5C7.5 13.5 2.5 8.5 2 3c0-.8.7-1.5 1.5-1.5Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
              </svg>
              {{ listing.phone }}
            </a>
            <a
              v-if="listing.email"
              class="enquiry-modal__contact-link"
              :href="`mailto:${listing.email}`"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="1.5" y="3" width="13" height="10" rx="1.2" stroke="currentColor" stroke-width="1.2"/>
                <path d="m2 4 6 4.5L14 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ listing.email }}
            </a>
          </div>

          <p v-if="listing.description" class="enquiry-modal__description">
            {{ listing.description }}
          </p>
          <p v-else class="enquiry-modal__description enquiry-modal__description--muted">
            No further description was provided for this listing.
          </p>

          <RouterLink
            v-if="hasPin"
            class="enquiry-modal__map-link"
            :to="mapLink"
          >
            View exact location on map →
          </RouterLink>
          <p v-else class="enquiry-modal__map-link enquiry-modal__map-link--disabled">
            No pinned location for this listing
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
/**
 * PropertyEnquiryModal.vue
 * -------------------------
 * Opened from the "Enquire" button on a Buy/Rent listing card. Left side
 * is a photo carousel, right side is a frosted-glass detail panel:
 * phone/email, description, and a deep link into the browse map
 * (PropertyMapPage.vue) centered on this specific listing's pin via
 * ?focus=<id>.
 *
 * NOTE ON PHOTOS: PropertySubmission currently stores a single
 * `photo_path` — one photo per listing (see the form in
 * Listaproperty.vue and the `store()` validation in
 * PropertySubmissionController.php, both single-file). This component
 * is built to show a real carousel of `listing.photos` (an array) the
 * moment the backend supports multiple photos per submission; until
 * then it falls back to a single-image "carousel" (no arrows/thumbs,
 * since there's only one frame). See the note I'll leave in chat for
 * what a multi-photo backend change would involve.
 *
 * NOTE ON "SIZE": still no dedicated size/area field on the model —
 * same caveat as before, `description` is the only free-text field.
 */
import { computed, ref, watch, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { resolvePinCategory, resolvePinColor, pinLegendLabel, DEFAULT_PIN_COLOR } from '@/utils/propertyPinColors'

const props = defineProps({
  // { id, type, listingType, fullName, email, phone, priceRange,
  //   location, description, photo, photos?, lat, lng } | null
  // `photos` (array of URLs) is optional and forward-looking — see note
  // above. When absent, falls back to the single `photo` field.
  listing: {
    type: Object,
    default: null,
  },
})
defineEmits(['close'])

const fallbackImage = '/images/Picture2.jpg'
const dialogEl = ref(null)
const activeIndex = ref(0)

// ---------------------------------------------------------------------
// TEMP — PREVIEW ONLY. Delete this DEMO_PHOTOS array, and the two lines
// marked below in `images`, once you're done looking at the carousel.
// It stands in for real multi-photo data until the backend supports
// more than one photo per submission (see the note above).
const DEMO_PHOTOS = [
  'https://picsum.photos/seed/tawi-listing-a/900/650',
  'https://picsum.photos/seed/tawi-listing-b/900/650',
  'https://picsum.photos/seed/tawi-listing-c/900/650',
]
// ---------------------------------------------------------------------

const images = computed(() => {
  if (!props.listing) return [fallbackImage]
  if (Array.isArray(props.listing.photos) && props.listing.photos.length) {
    return props.listing.photos
  }
  return DEMO_PHOTOS // TEMP — swap back to: [props.listing.photo || fallbackImage]
})

function prevImage() {
  if (images.value.length < 2) return
  activeIndex.value = (activeIndex.value - 1 + images.value.length) % images.value.length
}

function nextImage() {
  if (images.value.length < 2) return
  activeIndex.value = (activeIndex.value + 1) % images.value.length
}

// Focus the dialog when it opens (so Escape/arrow keys work immediately)
// and reset back to the first photo for whichever listing just opened.
watch(
  () => props.listing,
  (listing) => {
    activeIndex.value = 0
    if (listing) nextTick(() => dialogEl.value?.focus())
  }
)

const category = computed(() => (props.listing ? resolvePinCategory(props.listing) : null))
const pinColor = computed(() => (props.listing ? resolvePinColor(props.listing) : DEFAULT_PIN_COLOR))
const categoryLabel = computed(
  () => pinLegendLabel(category.value) || props.listing?.type || 'Property'
)

const hasPin = computed(
  () => typeof props.listing?.lat === 'number' && typeof props.listing?.lng === 'number'
)

const mapLink = computed(() => {
  if (!props.listing) return '/property-map'
  const destinationListingType = props.listing.listingType === 'rent' ? 'rent' : 'sale'
  const query = {
    listing_type: destinationListingType,
    focus: String(props.listing.id),
  }
  return { path: '/property-map', query }
})
</script>

<style scoped>
.enquiry-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(10, 12, 16, 0.72);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.enquiry-modal {
  position: relative;
  width: 100%;
  max-width: 980px;
  max-height: 88vh;
  display: flex;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
  outline: none;
}

.enquiry-modal__close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 3;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: rgba(10, 12, 16, 0.55);
  color: var(--bone, #eae5d8);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.enquiry-modal__close:hover {
  background: rgba(10, 12, 16, 0.8);
}

/* --- Left: photo carousel ------------------------------------------ */
.enquiry-modal__gallery {
  position: relative;
  flex: 1 1 52%;
  min-width: 0;
  background: #0d0f13;
  overflow: hidden;
}

.enquiry-modal__media {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}

.enquiry-modal__fade-enter-active,
.enquiry-modal__fade-leave-active {
  transition: opacity 0.25s ease;
}

.enquiry-modal__fade-enter-from,
.enquiry-modal__fade-leave-to {
  opacity: 0;
}

.enquiry-modal__badge {
  position: absolute;
  left: 18px;
  top: 18px;
  z-index: 2;
  padding: 5px 12px;
  border-radius: 999px;
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--ink, #14171c);
}

.enquiry-modal__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(10, 12, 16, 0.5);
  color: var(--bone, #eae5d8);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}

.enquiry-modal__nav:hover {
  background: rgba(10, 12, 16, 0.8);
}

.enquiry-modal__nav--prev {
  left: 14px;
}

.enquiry-modal__nav--next {
  right: 14px;
}

/* Gradient so thumbnails stay legible over bright/busy photos. */
.enquiry-modal__gallery::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 92px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  z-index: 1;
  pointer-events: none;
}

.enquiry-modal__thumbs {
  position: absolute;
  bottom: 14px;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 0 48px;
}

.enquiry-modal__thumb {
  flex: 0 0 auto;
  width: 52px;
  height: 38px;
  border-radius: 6px;
  border: 2px solid rgba(234, 229, 216, 0.4);
  background-size: cover;
  background-position: center;
  padding: 0;
  cursor: pointer;
  opacity: 0.7;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  transition: opacity 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}

.enquiry-modal__thumb:hover {
  opacity: 1;
}

.enquiry-modal__thumb--active {
  opacity: 1;
  border-color: var(--brass-bright, #c8a06a);
  transform: translateY(-3px);
}

/* --- Right: glassmorphism detail panel ------------------------------ */
.enquiry-modal__body {
  flex: 1 1 48%;
  min-width: 0;
  overflow-y: auto;
  padding: 32px 28px;

  /* Frosted-glass panel: translucent fill + blur of whatever sits
     behind the modal (the dimmed backdrop), plus a soft inner edge so
     it reads as a distinct pane next to the photo side. */
  background: rgba(234, 229, 216, 0.08);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-left: 1px solid rgba(234, 229, 216, 0.14);
}

.enquiry-modal__price {
  font-family: var(--font-mono, monospace);
  font-size: 15px;
  font-weight: 700;
  color: var(--brass-bright, #c8a06a);
  margin: 0 0 6px;
}

.enquiry-modal__location {
  font-family: var(--font-display, serif);
  font-size: 28px;
  line-height: 1.2;
  margin: 0 0 8px;
  color: var(--bone, #eae5d8);
}

.enquiry-modal__owner {
  font-size: 13px;
  opacity: 0.7;
  margin: 0 0 22px;
  color: var(--bone, #eae5d8);
}

.enquiry-modal__contact {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 22px;
}

.enquiry-modal__contact-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 15px;
  background: rgba(234, 229, 216, 0.06);
  border: 1px solid rgba(169, 129, 75, 0.4);
  border-radius: 999px;
  font-size: 13px;
  color: var(--bone, #eae5d8);
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease;
}

.enquiry-modal__contact-link:hover {
  background: var(--brass, #a9814b);
  color: var(--ink, #14171c);
}

.enquiry-modal__description {
  font-size: 14.5px;
  line-height: 1.7;
  color: var(--bone, #eae5d8);
  opacity: 0.9;
  margin: 0 0 26px;
  white-space: pre-line;
}

.enquiry-modal__description--muted {
  opacity: 0.55;
  font-style: italic;
}

.enquiry-modal__map-link {
  display: inline-block;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--brass-bright, #c8a06a);
  text-decoration: none;
}

.enquiry-modal__map-link:hover {
  text-decoration: underline;
}

.enquiry-modal__map-link--disabled {
  color: var(--bone, #eae5d8);
  opacity: 0.5;
  font-weight: 400;
  font-style: italic;
}

/* --- Responsive: stack on narrow screens ---------------------------- */
@media (max-width: 720px) {
  .enquiry-modal {
    flex-direction: column;
    max-height: 92vh;
    overflow-y: auto;
  }

  .enquiry-modal__gallery {
    flex: none;
    height: 260px;
  }

  .enquiry-modal__body {
    flex: none;
    overflow-y: visible;
    border-left: none;
    border-top: 1px solid rgba(234, 229, 216, 0.14);
  }
}
</style>