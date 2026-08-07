<template>
  <div class="property-map" :class="{ 'property-map--full': isFullPage }" :style="rootStyle">
    <div class="property-map__stage">
      <div v-if="searchable" class="property-map__toolbar">
        <div class="property-map__search">
          <svg class="property-map__search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6.25" stroke="currentColor" stroke-width="1.5" />
            <path d="M18 18l-4.5-4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="property-map__search-input"
            placeholder="Search an area, estate, or landmark…"
            @input="onSearchInput"
            @focus="onSearchInput"
            @blur="onSearchBlur"
            @keydown.esc="closeResults"
          />
          <span v-if="searching" class="property-map__search-spinner" aria-hidden="true"></span>
        </div>

        <ul v-if="showResults && searchResults.length" class="property-map__results">
          <li
            v-for="result in searchResults"
            :key="result.id"
            class="property-map__result"
            @mousedown.prevent="selectResult(result)"
          >
            <span class="property-map__result-name">{{ result.mainText }}</span>
            <span v-if="result.secondaryText" class="property-map__result-sub">{{ result.secondaryText }}</span>
          </li>
        </ul>
        <p
          v-else-if="showResults && !searching && searchQuery.trim().length >= 3 && searchAttempted"
          class="property-map__no-results"
        >
          No matches for "{{ searchQuery }}"
        </p>
      </div>

      <div ref="mapEl" class="property-map__canvas" :style="isFullPage ? {} : { height }"></div>

      <p v-if="mode === 'picker' && isFullPage" class="property-map__hint property-map__hint--floating">
        <span v-if="coords">
          Pinned at {{ coords.lat.toFixed(5) }}, {{ coords.lng.toFixed(5) }}
        </span>
        <span v-else>Search above, or click anywhere on the map, to drop a pin.</span>
      </p>
    </div>

    <p v-if="mode === 'picker' && !isFullPage" class="property-map__hint">
      <span v-if="coords">
        Pinned at {{ coords.lat.toFixed(5) }}, {{ coords.lng.toFixed(5) }}
      </span>
      <span v-else>Search above, or click anywhere on the map, to drop a pin at the property's location.</span>
    </p>
  </div>
</template>

<script setup>
/**
 * PropertyMap.vue
 * ----------------
 * Thin Vue 3 wrapper around MapLibre GL JS, using OpenFreeMap vector tiles
 * (https://openfreemap.org) — free, no API key, no usage cap — plus a
 * type-ahead location search backed by Photon (https://photon.komoot.io),
 * which (unlike Nominatim's public server) is built for autocomplete use.
 *
 * Two modes:
 *  - "picker":  click the map (or search + select a result) to drop/move a
 *               single pin. Used when an owner lists a property, or an
 *               admin edits one, so the exact coordinates get attached to
 *               that listing.
 *  - "display": renders one pin per entry in `markers`, each with a popup.
 *               Used anywhere you want to show where a property (or set of
 *               properties) actually sits on the map. Search here just
 *               recenters the map — it doesn't drop a pin.
 *
 * Layout:
 *  - By default the map sits in-flow as a rounded card (unchanged
 *    behavior for places like the "list a property" form).
 *  - Pass `full-page` to make it fill the viewport edge-to-edge below a
 *    fixed/sticky navbar. The navbar's rendered height is auto-detected
 *    (looks for <header>, <nav>, or [data-app-navbar] pinned to the top
 *    of the viewport) so the map and search bar never sit underneath it.
 *    If auto-detection picks the wrong element, pass `nav-offset` with
 *    an explicit pixel value instead.
 */
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Map as MapLibreMap, Marker, Popup, NavigationControl, LngLatBounds, setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

// MapLibre v6 is ESM-only and parses vector tiles in a separate worker
// module. Vite/webpack/esbuild can't auto-resolve that worker's URL, so it
// has to be registered once, up front, or the worker silently fails to
// load and no tile data ever renders (you just get the style's background
// fill color). This only needs to run once per page load.
setWorkerUrl(maplibreWorkerUrl)

const route = useRoute()

const props = defineProps({
  mode: {
    type: String,
    default: 'display', // 'picker' | 'display' | 'route'
  },
  // Picker mode: v-model of { lat, lng } | null
  // Route mode: v-model of [{ lat, lng }, ...] | null
  modelValue: {
    type: [Object, Array],
    default: null,
  },
  // Display mode: [{ id, lat, lng, title, subtitle, price, type }]
  markers: {
    type: Array,
    default: () => [],
  },
  // [lng, lat] — defaults to Nairobi, since that's where most Tawi listings sit
  center: {
    type: Array,
    default: () => [36.8219, -1.2921],
  },
  zoom: {
    type: Number,
    default: 12,
  },
  // Used only when fullPage is false — the map sits in-flow at this height
  height: {
    type: String,
    default: '74vh',
  },
  // Show the location search bar above the map
  searchable: {
    type: Boolean,
    default: true,
  },
  // Make the map fill the viewport edge-to-edge, below the navbar,
  // instead of sitting in-flow as a rounded card
  fullPage: {
    type: Boolean,
    default: false,
  },
  // Explicit navbar height in px, e.g. 84. Skips auto-detection.
  navOffset: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'marker-click'])

const mapEl = ref(null)
const coords = ref(props.modelValue && !Array.isArray(props.modelValue) ? props.modelValue : null)
const routePoints = ref(Array.isArray(props.modelValue) ? props.modelValue.slice() : [])
const detectedNavOffset = ref(84) // sane fallback until measured

let navResizeObserver = null

function findNavbarEl() {
  const candidates = document.querySelectorAll('header, nav, [data-app-navbar]')
  for (const el of candidates) {
    const rect = el.getBoundingClientRect()
    const style = window.getComputedStyle(el)
    const pinnedToTop = (style.position === 'fixed' || style.position === 'sticky') && rect.top <= 0
    if (pinnedToTop && rect.height > 0) return el
  }
  return null
}

function measureNavOffset() {
  if (props.navOffset !== null) return
  const navEl = findNavbarEl()
  if (navEl) {
    detectedNavOffset.value = Math.ceil(navEl.getBoundingClientRect().bottom)
  }
}

const isFullPage = computed(() => props.fullPage || route.name === 'property-map')

const rootStyle = computed(() => {
  if (!isFullPage.value) return {}
  const offset = props.navOffset !== null ? props.navOffset : detectedNavOffset.value
  const offsetPx = typeof offset === 'number' ? `${offset}px` : offset
  return { '--nav-offset': offsetPx }
})

const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const showResults = ref(false)
const searchAttempted = ref(false)

let map = null
let pickerMarker = null
const routeMarkers = []
const displayMarkers = []
let searchDebounce = null
let searchAbortController = null

// OpenFreeMap: free vector tile hosting, no API key, no usage cap.
// "liberty" is the closest to a classic OSM street map — swap for
// "positron" or "bright" if you want a lighter look.
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'

// Photon (Komoot's OSM geocoder): built for search-as-you-type, free,
// no API key. Biased toward Kenya via lat/lon since that's where Tawi
// listings are. For heavy production traffic, self-hosting Photon (or
// switching to a paid geocoder) is worth considering — the public demo
// server asks for "fair" usage, not high-volume automated traffic.
const SEARCH_URL = 'https://photon.komoot.io/api/'

function onSearchInput() {
  showResults.value = true
  searchAttempted.value = false
  clearTimeout(searchDebounce)

  const query = searchQuery.value.trim()
  if (query.length < 3) {
    searchResults.value = []
    searching.value = false
    return
  }

  searchDebounce = setTimeout(() => runSearch(query), 350)
}

function onSearchBlur() {
  // Delay so a click on a result (mousedown) registers before the list
  // disappears.
  setTimeout(() => {
    showResults.value = false
  }, 150)
}

function closeResults() {
  showResults.value = false
}

async function runSearch(query) {
  searching.value = true
  if (searchAbortController) searchAbortController.abort()
  searchAbortController = new AbortController()

  try {
    const [biasLng, biasLat] = props.center
    const params = new URLSearchParams({
      q: query,
      limit: '6',
      lat: String(biasLat),
      lon: String(biasLng),
    })

    const res = await fetch(`${SEARCH_URL}?${params}`, {
      signal: searchAbortController.signal,
    })
    if (!res.ok) throw new Error('Search request failed')

    const data = await res.json()
    searchResults.value = (data.features || []).map((feature, i) => {
      const p = feature.properties || {}
      const parts = [p.street, p.district, p.city, p.state, p.country].filter(Boolean)
      return {
        id: `${p.osm_type || 'r'}-${p.osm_id || i}`,
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        mainText: p.name || parts[0] || query,
        secondaryText: parts.filter((part) => part !== p.name).slice(0, 3).join(', '),
      }
    })
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Location search failed:', err)
      searchResults.value = []
    }
  } finally {
    searching.value = false
    searchAttempted.value = true
  }
}

function selectResult(result) {
  searchQuery.value = result.mainText
  showResults.value = false
  searchResults.value = []

  if (map) {
    map.flyTo({ center: [result.lng, result.lat], zoom: Math.max(props.zoom, 15), speed: 1.4 })
  }

  if (props.mode === 'picker') {
    coords.value = { lat: result.lat, lng: result.lng }
    setPickerMarker([result.lng, result.lat])
    emit('update:modelValue', coords.value)
  } else if (props.mode === 'route') {
    addRoutePoint({ lat: result.lat, lng: result.lng })
  }
}

function clearDisplayMarkers() {
  displayMarkers.forEach((m) => m.remove())
  displayMarkers.length = 0
}

function clearRouteMarkers() {
  routeMarkers.forEach((m) => m.remove())
  routeMarkers.length = 0
}

function updateRouteLine() {
  if (!map) return
  const coordinates = routePoints.value.map((point) => [point.lng, point.lat])

  if (!map.getSource('route-line')) {
    map.addSource('route-line', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates,
        },
      },
    })

    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route-line',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#a9814b',
        'line-width': 4,
        'line-opacity': 0.9,
      },
    })
  } else {
    const source = map.getSource('route-line')
    source.setData({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates,
      },
    })
  }
}

function addRoutePoint(point) {
  routePoints.value.push(point)
  setRouteMarker([point.lng, point.lat], routePoints.value.length)
  updateRouteLine()
  emit('update:modelValue', routePoints.value.slice())
}

function setRouteMarker(lngLat, index) {
  if (!map) return
  const el = document.createElement('div')
  el.className = 'property-map__pin property-map__pin--route'
  el.textContent = index || routeMarkers.length + 1
  el.style.display = 'flex'
  el.style.alignItems = 'center'
  el.style.justifyContent = 'center'
  el.style.color = '#14171c'
  el.style.fontSize = '12px'
  el.style.fontWeight = '700'
  el.style.textShadow = '0 1px 0 rgba(255,255,255,0.6)'

  const marker = new Marker({ element: el, anchor: 'bottom', draggable: true })
    .setLngLat(lngLat)
    .addTo(map)

  marker.on('dragend', () => {
    const pos = marker.getLngLat()
    const idx = routeMarkers.indexOf(marker)
    if (idx !== -1) {
      routePoints.value[idx] = { lat: pos.lat, lng: pos.lng }
      updateRouteLine()
      emit('update:modelValue', routePoints.value.slice())
    }
  })

  routeMarkers.push(marker)
}

function renderDisplayMarkers() {
  clearDisplayMarkers()
  if (!map || !props.markers.length) return

  const bounds = new LngLatBounds()

  props.markers.forEach((item) => {
    if (typeof item.lat !== 'number' || typeof item.lng !== 'number') return

    const el = document.createElement('div')
    el.className = 'property-map__pin'

    const popupHtml = `
      <div class="property-map__popup">
        <strong>${escapeHtml(item.title || 'Property')}</strong>
        ${item.subtitle ? `<div class="property-map__popup-sub">${escapeHtml(item.subtitle)}</div>` : ''}
        ${item.price ? `<div class="property-map__popup-price">${escapeHtml(item.price)}</div>` : ''}
      </div>
    `

    const marker = new Marker({ element: el, anchor: 'bottom' })
      .setLngLat([item.lng, item.lat])
      .setPopup(new Popup({ offset: 24, closeButton: false }).setHTML(popupHtml))
      .addTo(map)

    el.addEventListener('click', () => emit('marker-click', item))

    displayMarkers.push(marker)
    bounds.extend([item.lng, item.lat])
  })

  if (props.markers.length === 1) {
    map.jumpTo({ center: bounds.getCenter(), zoom: props.zoom })
  } else if (props.markers.length > 1) {
    map.fitBounds(bounds, { padding: 56, maxZoom: 15, duration: 0 })
  }
}

function setPickerMarker(lngLat) {
  if (!map) return
  if (!pickerMarker) {
    const el = document.createElement('div')
    el.className = 'property-map__pin property-map__pin--picker'
    pickerMarker = new Marker({ element: el, anchor: 'bottom', draggable: true })
      .setLngLat(lngLat)
      .addTo(map)
    pickerMarker.on('dragend', () => {
      const pos = pickerMarker.getLngLat()
      coords.value = { lat: pos.lat, lng: pos.lng }
      emit('update:modelValue', coords.value)
    })
  } else {
    pickerMarker.setLngLat(lngLat)
  }
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

onMounted(async () => {
  await nextTick()

  if (isFullPage.value) {
    measureNavOffset()
    const navEl = findNavbarEl()
    if (navEl && 'ResizeObserver' in window) {
      navResizeObserver = new ResizeObserver(() => measureNavOffset())
      navResizeObserver.observe(navEl)
    }
    window.addEventListener('resize', measureNavOffset)
  }

  map = new MapLibreMap({
    container: mapEl.value,
    style: STYLE_URL,
    center: coords.value ? [coords.value.lng, coords.value.lat] : props.center,
    zoom: props.zoom,
    attributionControl: { compact: true },
  })

  map.addControl(new NavigationControl({ showCompass: false }), 'top-right')

  map.on('load', () => {
    // Guards against a common Vue layout timing issue: if the container's
    // final size wasn't settled when MapLibre first measured it, tiles can
    // render blank until the map is told to resize.
    requestAnimationFrame(() => map.resize())
    if (props.mode === 'display') {
      renderDisplayMarkers()
    } else if (props.mode === 'picker' && coords.value) {
      setPickerMarker([coords.value.lng, coords.value.lat])
    } else if (props.mode === 'route' && routePoints.value.length) {
      routePoints.value.forEach((point, idx) => setRouteMarker([point.lng, point.lat], idx + 1))
      updateRouteLine()
    }
  })

  if (props.mode === 'picker') {
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat
      coords.value = { lat, lng }
      setPickerMarker([lng, lat])
      emit('update:modelValue', coords.value)
    })
  } else if (props.mode === 'route') {
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat
      addRoutePoint({ lat, lng })
    })
  }
})

watch(
  () => props.markers,
  () => {
    if (map && map.isStyleLoaded()) renderDisplayMarkers()
  },
  { deep: true }
)

watch(
  () => props.modelValue,
  (val) => {
    if (props.mode === 'route') {
      routePoints.value = Array.isArray(val) ? val.slice() : []
      if (map) {
        clearRouteMarkers()
        routePoints.value.forEach((point, idx) => setRouteMarker([point.lng, point.lat], idx + 1))
        updateRouteLine()
      }
    } else {
      coords.value = val
      if (map && val) setPickerMarker([val.lng, val.lat])
    }
  }
)

onBeforeUnmount(() => {
  clearTimeout(searchDebounce)
  if (searchAbortController) searchAbortController.abort()
  if (navResizeObserver) navResizeObserver.disconnect()
  window.removeEventListener('resize', measureNavOffset)
  clearDisplayMarkers()
  if (pickerMarker) pickerMarker.remove()
  if (map) map.remove()
})
</script>

<style>
/* Unscoped: these style elements MapLibre injects outside this component's DOM tree */
.property-map__pin {
  width: 26px;
  height: 26px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: var(--brass, #a9814b);
  border: 2px solid var(--ink, #14171c);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  cursor: pointer;
}

.property-map__pin--picker {
  background: var(--brass-bright, #c9a06a);
  cursor: grab;
}

.property-map__popup {
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  color: var(--ink, #14171c);
  min-width: 140px;
}

.property-map__popup strong {
  display: block;
  margin-bottom: 2px;
}

.property-map__popup-sub {
  opacity: 0.75;
  font-size: 12px;
}

.property-map__popup-price {
  margin-top: 4px;
  font-weight: 600;
  color: var(--brass, #a9814b);
}

.maplibregl-popup-content {
  border-radius: 6px;
  padding: 10px 12px;
}
</style>

<style scoped>
.property-map {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  width: 100%;
}

/* Full-page mode: breaks out of any parent container width, sits flush
   below the navbar, and fills the rest of the viewport. */
.property-map--full {
  position: fixed;
  top: var(--nav-offset, 84px);
  left: 0;
  right: 0;
  bottom: 0;
  gap: 0;
  width: 100%;
  margin: 0;
  height: auto;
}

.property-map__stage {
  position: relative;
  width: 100%;
  min-height: 100%;
  height: 100%;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(169, 129, 75, 0.22);
}

.property-map--full .property-map__stage {
  border-radius: 0;
  box-shadow: none;
  border: none;
  height: 100%;
}

.property-map__toolbar {
  position: absolute;
  top: 24px;
  left: 16px;
  right: 16px;
  z-index: 5;
  max-width: 440px;
}

.property-map--full .property-map__toolbar {
  top: 72px;
}

.property-map--full .property-map__canvas {
  min-height: 0;
  height: 100%;
}

.property-map__search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(27, 30, 37, 0.94);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(169, 129, 75, 0.35);
  border-radius: 999px;
  padding: 10px 14px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
}

.property-map__search:focus-within {
  border-color: var(--brass, #a9814b);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
}

.property-map__search-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--bone-dim, #cfc8b6);
}

.property-map__search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  color: var(--bone, #eae5d8);
}

.property-map__search-input::placeholder {
  color: var(--bone-dim, #cfc8b6);
  opacity: 0.6;
}

.property-map__search-spinner {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  border: 2px solid rgba(169, 129, 75, 0.3);
  border-top-color: var(--brass, #a9814b);
  border-radius: 50%;
  animation: property-map-spin 0.7s linear infinite;
}

@keyframes property-map-spin {
  to {
    transform: rotate(360deg);
  }
}

.property-map__results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 6px;
  list-style: none;
  background: rgba(27, 30, 37, 0.96);
  border: 1px solid rgba(169, 129, 75, 0.35);
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
  max-height: 260px;
  overflow-y: auto;
}

.property-map__result {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.property-map__result:hover,
.property-map__result:focus {
  background: rgba(169, 129, 75, 0.15);
}

.property-map__result-name {
  font-family: var(--font-body, sans-serif);
  font-size: 13.5px;
  color: var(--bone, #eae5d8);
}

.property-map__result-sub {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  color: var(--bone-dim, #cfc8b6);
  opacity: 0.75;
}

.property-map__no-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 10px 14px;
  background: rgba(27, 30, 37, 0.96);
  border: 1px solid rgba(169, 129, 75, 0.35);
  border-radius: 12px;
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  color: var(--bone-dim, #cfc8b6);
}

.property-map__canvas {
  width: 100%;
  min-height: 280px;
  overflow: hidden;
  background: var(--panel, #1b1e25);
}

.property-map--full .property-map__canvas {
  height: 100%;
}

.property-map__hint {
  margin: 0;
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  letter-spacing: 0.02em;
  color: var(--bone-dim, #cfc8b6);
}

.property-map__hint--floating {
  position: absolute;
  left: 16px;
  bottom: 16px;
  z-index: 5;
  background: rgba(27, 30, 37, 0.9);
  backdrop-filter: blur(8px);
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(169, 129, 75, 0.3);
}
</style>