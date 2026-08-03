<template>
  <div class="property-map">
    <div ref="mapEl" class="property-map__canvas" :style="{ height }"></div>

    <p v-if="mode === 'picker'" class="property-map__hint">
      <span v-if="coords">
        Pinned at {{ coords.lat.toFixed(5) }}, {{ coords.lng.toFixed(5) }}
      </span>
      <span v-else>Click anywhere on the map to drop a pin at the property's location.</span>
    </p>
  </div>
</template>

<script setup>
/**
 * PropertyMap.vue
 * ----------------
 * Thin Vue 3 wrapper around MapLibre GL JS, using OpenFreeMap vector tiles
 * (https://openfreemap.org) — free, no API key, no usage cap.
 *
 * Two modes:
 *  - "picker":  click the map to drop/move a single pin. Used when an owner
 *               lists a property, or an admin edits one, so the exact
 *               coordinates get attached to that listing.
 *  - "display": renders one pin per entry in `markers`, each with a popup.
 *               Used anywhere you want to show where a property (or set of
 *               properties) actually sits on the map.
 */
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { Map as MapLibreMap, Marker, Popup, NavigationControl, LngLatBounds } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const props = defineProps({
  mode: {
    type: String,
    default: 'display', // 'picker' | 'display'
  },
  // Picker mode: v-model of { lat, lng } | null
  modelValue: {
    type: Object,
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
  height: {
    type: String,
    default: '360px',
  },
})

const emit = defineEmits(['update:modelValue', 'marker-click'])

const mapEl = ref(null)
const coords = ref(props.modelValue)

let map = null
let pickerMarker = null
const displayMarkers = []

// Free, no-key vector style. See https://openfreemap.org for the full list.
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'

function clearDisplayMarkers() {
  displayMarkers.forEach((m) => m.remove())
  displayMarkers.length = 0
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
    map.resize()
    if (props.mode === 'display') {
      renderDisplayMarkers()
    } else if (props.mode === 'picker' && coords.value) {
      setPickerMarker([coords.value.lng, coords.value.lat])
    }
  })

  if (props.mode === 'picker') {
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat
      coords.value = { lat, lng }
      setPickerMarker([lng, lat])
      emit('update:modelValue', coords.value)
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
    coords.value = val
    if (map && val) setPickerMarker([val.lng, val.lat])
  }
)

onBeforeUnmount(() => {
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
  gap: 8px;
}

.property-map__canvas {
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(169, 129, 75, 0.25);
}

.property-map__hint {
  margin: 0;
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  letter-spacing: 0.02em;
  color: var(--bone-dim, #cfc8b6);
}
</style>