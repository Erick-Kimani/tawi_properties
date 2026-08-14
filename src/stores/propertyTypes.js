// Single source of truth for the property types shown in every "Type"
// dropdown across the app (Home, Buy, Rent, List a property).
//
// Mirrors the pattern in `src/stores/counties.js`: a module-level reactive
// singleton so every component that calls `usePropertyTypes()` shares the
// same data and the API is only ever fetched once per page load.

import { reactive, computed } from 'vue'
import propertyTypeService from '@/services/propertyTypeService'

// Used only until the API call resolves, or if it fails outright, so every
// dropdown still has sensible options instead of rendering empty.
//
// NOTE: these are property *categories* only (what kind of property it is).
// Whether a listing is for sale or for rent is a separate field —
// `listing_type` — set via the "I want to" toggle on Listaproperty.vue, not
// a category here. Don't add "Rent"/"Rentals" back into this list.
const FALLBACK_PROPERTY_TYPES = ['Land/Plot', 'Houses', 'Commercial Buildings', 'Apartments']

const state = reactive({
  types: [...FALLBACK_PROPERTY_TYPES],
  loading: false,
  loaded: false,
  error: ''
})

let fetchPromise = null

function fetchPropertyTypes() {
  // Already fetched (or in flight) this session — reuse it rather than
  // hitting the API again every time a component mounts.
  if (fetchPromise) return fetchPromise

  state.loading = true
  state.error = ''

  fetchPromise = propertyTypeService
    .getActivePropertyTypes()
    .then(({ data }) => {
      if (Array.isArray(data) && data.length) {
        state.types = data.map((t) => t.name)
      }
      state.loaded = true
    })
    .catch(() => {
      state.error = 'Could not load property types — showing defaults.'
      state.loaded = true
    })
    .finally(() => {
      state.loading = false
    })

  return fetchPromise
}

export function usePropertyTypes() {
  if (!state.loaded) fetchPropertyTypes()

  return {
    propertyTypes: computed(() => state.types),
    loading: computed(() => state.loading),
    error: computed(() => state.error),
    refresh: fetchPropertyTypes
  }
}

export default usePropertyTypes