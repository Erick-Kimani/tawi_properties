<template>
  <div class="property-map-page">
    <!-- Picker mode: unchanged behavior — the full-page map opened from
         Listaproperty.vue's "Expand map" button, which sends the chosen
         pin back via ?returnTo=/list-property. -->
    <PropertyMap
      v-if="isPicker"
      mode="picker"
      :model-value="pickerValue"
      :center="pickerCenter || undefined"
      full-page
    />

    <!-- Browse mode: the default when someone lands on /property-map with
         no returnTo (nav link, direct visit, bookmark, or a "View on map"
         link from Buy/Rent). Shows every admin-approved (featured)
         listing as a color-coded pin — green Land, blue Apartments,
         purple Commercial, red Rentals — with filters to narrow down to
         what they actually want. -->
    <PropertyMap
      v-else
      mode="display"
      :markers="markers"
      full-page
      legend
      :empty-message="emptyMessage"
      :focus-id="focusId"
    >
      <template #filters>
        <div class="map-filters" role="group" aria-label="Filter properties">
          <div class="map-filters__intent" role="radiogroup" aria-label="Buy or rent">
            <button
              v-for="opt in intentOptions"
              :key="opt.value"
              type="button"
              class="map-filters__pill"
              :class="{ 'map-filters__pill--active': intent === opt.value }"
              role="radio"
              :aria-checked="intent === opt.value"
              @click="intent = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>

          <div class="map-filters__type">
            <PropertyTypeDropdown
              v-model="selectedType"
              :label="false"
              input-id="property-map-type"
              include-all-option
              all-option-label="All types"
            />
          </div>

          <span class="map-filters__count">
            {{ loading ? 'Loading…' : `${markers.length} ${markers.length === 1 ? 'property' : 'properties'}` }}
          </span>
        </div>
        <p v-if="loadError" class="map-filters__error">{{ loadError }}</p>
      </template>
    </PropertyMap>
  </div>
</template>

<script setup>
/**
 * PropertyMapPage.vue
 * --------------------
 * Thin router-facing wrapper around PropertyMap.vue. Decides which of the
 * component's two relevant modes to render:
 *
 *  - picker: someone was sent here (with ?returnTo=...) to drop a pin for
 *    a listing they're submitting — unchanged from before.
 *  - display ("browse"): everyone else. Fetches every admin-approved
 *    (status === 'featured') submission from the same endpoint Buy/Rent
 *    already use, and renders one color-coded pin per listing, with
 *    Buy/Rent + property-type filters that re-query the API.
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import PropertyMap from '@/components/PropertyMap.vue'
import PropertyTypeDropdown from '@/components/PropertyTypeDropdown.vue'
import propertySubmissionService from '@/services/propertySubmissionService'

const route = useRoute()

// --- Picker mode --------------------------------------------------------
const isPicker = computed(() => typeof route.query.returnTo === 'string' && !!route.query.returnTo)

const pickerCenter = computed(() => {
  const lat = Number(route.query.lat)
  const lng = Number(route.query.lng)
  if (route.query.lat !== undefined && route.query.lng !== undefined && !Number.isNaN(lat) && !Number.isNaN(lng)) {
    return [lng, lat]
  }
  return null
})

const pickerValue = computed(() => {
  const lat = Number(route.query.lat)
  const lng = Number(route.query.lng)
  if (route.query.lat !== undefined && route.query.lng !== undefined && !Number.isNaN(lat) && !Number.isNaN(lng)) {
    return { lat, lng }
  }
  return null
})

// --- Browse mode ----------------------------------------------------------
const intentOptions = [
  { value: '', label: 'All' },
  { value: 'sale', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
]

// Seeded from the query string so a deep link like
// /property-map?listing_type=rent (the Rent page's "View on map" link)
// lands already filtered.
const intent = ref(typeof route.query.listing_type === 'string' ? route.query.listing_type : '')
const selectedType = ref(typeof route.query.type === 'string' ? route.query.type : '')

// Set when a listing's "Enquire" modal links here with ?focus=<id> (see
// PropertyEnquiryModal.vue) — tells PropertyMap.vue to zoom straight to
// that one pin and open its popup, instead of fitting to every pin.
const focusId = computed(() => (typeof route.query.focus === 'string' ? route.query.focus : null))

const allListings = ref([])
const loading = ref(false)
const loadError = ref('')

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}

async function loadListings() {
  loading.value = true
  loadError.value = ''
  try {
    // getFeatured only ever returns admin-approved (status === 'featured')
    // submissions — the same rule Buypage.vue/Rentpage.vue rely on.
    // Leaving listing_type unset (intent === 'All') deliberately returns
    // BOTH sale and rent listings, so "All" really does mean all four
    // pin colors on the map at once.
    const { data } = await propertySubmissionService.getFeatured({
      listing_type: intent.value || undefined,
      type: selectedType.value || undefined,
    })
    const rows = data.data || data
    allListings.value = rows.map((s) => ({
      id: s.id,
      type: s.type,
      listingType: s.listing_type,
      title: s.type,
      subtitle: s.location,
      price: s.price_range,
      fullName: s.full_name,
      email: s.email,
      // Assumes the API echoes back the latitude/longitude submitted via
      // Listaproperty.vue's map picker. Listings submitted without a pin
      // simply won't have a marker (see `markers` below).
      lat: toNumberOrNull(s.latitude),
      lng: toNumberOrNull(s.longitude),
    }))
  } catch (e) {
    loadError.value = 'Could not load properties. Please refresh and try again.'
    allListings.value = []
  } finally {
    loading.value = false
  }
}

// Only listings with a resolvable pin can appear on the map — a listing
// submitted without one (the picker in Listaproperty.vue is optional)
// just doesn't get a marker, the same way it wouldn't appear on a paper
// map without an address.
const markers = computed(() =>
  allListings.value.filter((s) => typeof s.lat === 'number' && typeof s.lng === 'number')
)

const emptyMessage = computed(() =>
  loading.value
    ? 'Loading properties…'
    : 'No approved properties match these filters yet.'
)

onMounted(() => {
  if (!isPicker.value) loadListings()
})
watch([intent, selectedType], () => {
  if (!isPicker.value) loadListings()
})
</script>

<style scoped>
.property-map-page {
  width: 100%;
  height: 100%;
}

.map-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.map-filters__intent {
  display: flex;
  gap: 6px;
}

.map-filters__pill {
  font-family: var(--font-body, sans-serif);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--bone-dim, #cfc8b6);
  background: rgba(237, 231, 218, 0.06);
  border: 1px solid rgba(237, 231, 218, 0.15);
  border-radius: 999px;
  padding: 6px 14px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.map-filters__pill:hover {
  color: var(--bone, #eae5d8);
  border-color: rgba(169, 129, 75, 0.5);
}

.map-filters__pill--active {
  background: var(--brass, #a9814b);
  border-color: var(--brass, #a9814b);
  color: var(--ink, #14171c);
}

.map-filters__type {
  min-width: 150px;
  background: rgba(237, 231, 218, 0.06);
  border: 1px solid rgba(237, 231, 218, 0.15);
  border-radius: 999px;
  padding: 0 4px;
}

.map-filters__type :deep(.property-type-dropdown__select) {
  padding: 6px 10px;
  font-size: 12.5px;
}

.map-filters__count {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  color: var(--bone-dim, #cfc8b6);
  white-space: nowrap;
}

.map-filters__error {
  margin: 8px 0 0;
  font-size: 12px;
  color: #d98b6a;
}
</style>