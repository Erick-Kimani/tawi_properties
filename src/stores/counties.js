// Single source of truth for which Kenyan counties are shown in every
// location dropdown across the app (Home, Categories, Buy, Rent).
//
// Previously this store layered "active/hidden" state (kept in
// localStorage) on top of the static list in `src/data/kenyanCounties.js`.
// The county list AND its status now both live on the backend (see the
// `counties` table / CountyController), so there's a single source of
// truth shared by every admin and every device — no more resets on
// refresh or login.
//
// The public API (allCounties, activeCounties, hiddenCounties, isHidden,
// hideCounty, restoreCounty, toggleCounty) is unchanged so existing
// components — including Admin.vue and the public dropdowns — keep working
// with only small additions (loading/error state, and fetchCounties()
// needs to be called once, e.g. from App.vue or an onMounted hook).

import { reactive, computed } from 'vue'
import countyService from '@/services/countyService'

// Module-scoped (singleton) reactive state shared by every component that
// imports this store.
const state = reactive({
  counties: [], // [{ id, name, status }]
  loading: false,
  error: '',
  fetched: false
})

export function useCounties() {
  // Fetches from the backend once per session; safe to call from every
  // component that uses this store (Home, Categories, Buy, Rent, Admin) —
  // subsequent calls are no-ops unless force is true.
  async function fetchCounties(force = false) {
    if (state.fetched && !force) return
    state.loading = true
    state.error = ''
    try {
      const { data } = await countyService.getAll()
      state.counties = data
      state.fetched = true
    } catch (e) {
      state.error = 'Could not load counties. Please refresh and try again.'
    } finally {
      state.loading = false
    }
  }

  // The full list of all counties (master data), regardless of status.
  const allCounties = computed(() => state.counties.map((c) => c.name))

  // What every public dropdown (Home, Categories, Buy, Rent) should render.
  const activeCounties = computed(() =>
    state.counties.filter((c) => c.status === 'active').map((c) => c.name)
  )

  // What the Admin page lists as "pulled down".
  const hiddenCounties = computed(() =>
    state.counties.filter((c) => c.status === 'pulled_down').map((c) => c.name)
  )

  function findByName(name) {
    return state.counties.find((c) => c.name === name)
  }

  function isHidden(name) {
    const county = findByName(name)
    return county ? county.status === 'pulled_down' : false
  }

  // Pull a county down from the public dropdowns (does NOT delete it).
  // Optimistic update with rollback on failure, same pattern as
  // handleFeature/handleReject in Admin.vue.
  async function hideCounty(name) {
    const county = findByName(name)
    if (!county || county.status === 'pulled_down') return
    const previousStatus = county.status
    county.status = 'pulled_down'
    try {
      await countyService.pullDown(county.id)
    } catch (e) {
      county.status = previousStatus
      throw e
    }
  }

  // Restore a previously pulled-down county to the public dropdowns.
  async function restoreCounty(name) {
    const county = findByName(name)
    if (!county || county.status === 'active') return
    const previousStatus = county.status
    county.status = 'active'
    try {
      await countyService.restore(county.id)
    } catch (e) {
      county.status = previousStatus
      throw e
    }
  }

  async function toggleCounty(name) {
    if (isHidden(name)) {
      await restoreCounty(name)
    } else {
      await hideCounty(name)
    }
  }

  return {
    allCounties,
    activeCounties,
    hiddenCounties,
    isHidden,
    hideCounty,
    restoreCounty,
    toggleCounty,
    fetchCounties,
    countiesLoading: computed(() => state.loading),
    countiesError: computed(() => state.error)
  }
}

export default useCounties