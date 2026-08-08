// Single source of truth for which Kenyan counties are shown in every
// location dropdown across the app (Home, Categories, Buy, Rent).
//
// The full list of counties still lives in `src/data/kenyanCounties.js`.
// This store layers an "active / hidden" state on top of that list so the
// Admin dashboard can pull a county down from the public dropdowns without
// ever deleting it from the master data. Hidden counties are persisted to
// localStorage so the change survives page reloads, and the state is a
// module-level singleton so every component that calls `useCounties()`
// shares the same reactive list.

import { reactive, computed, readonly } from 'vue'
import { kenyanCounties } from '@/data/kenyanCounties'

const STORAGE_KEY = 'tawi_hidden_counties'

function loadHidden() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((c) => kenyanCounties.includes(c)) : []
  } catch (e) {
    // storage unavailable or corrupted value — fall back to nothing hidden
    return []
  }
}

// Module-scoped (singleton) reactive state shared by every component that
// imports this store.
const state = reactive({
  hidden: loadHidden()
})

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.hidden))
  } catch (e) {
    // storage unavailable — state still works in-memory for this session
  }
}

export function useCounties() {
  // The full, untouched list of all 47 counties (master data).
  const allCounties = kenyanCounties

  // What every public dropdown (Home, Categories, Buy, Rent) should render.
  const activeCounties = computed(() =>
    allCounties.filter((county) => !state.hidden.includes(county))
  )

  // What the Admin page lists as "pulled down".
  const hiddenCounties = computed(() =>
    allCounties.filter((county) => state.hidden.includes(county))
  )

  function isHidden(county) {
    return state.hidden.includes(county)
  }

  // Pull a county down from the public dropdowns (does NOT delete it).
  function hideCounty(county) {
    if (!state.hidden.includes(county)) {
      state.hidden.push(county)
      persist()
    }
  }

  // Restore a previously pulled-down county to the public dropdowns.
  function restoreCounty(county) {
    const idx = state.hidden.indexOf(county)
    if (idx !== -1) {
      state.hidden.splice(idx, 1)
      persist()
    }
  }

  function toggleCounty(county) {
    if (isHidden(county)) {
      restoreCounty(county)
    } else {
      hideCounty(county)
    }
  }

  return {
    allCounties,
    activeCounties,
    hiddenCounties,
    hiddenList: readonly(state.hidden),
    isHidden,
    hideCounty,
    restoreCounty,
    toggleCounty
  }
}

export default useCounties