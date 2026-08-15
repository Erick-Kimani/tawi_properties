// propertyPinColors.js
// ---------------------
// Single source of truth for the four buyer-facing map colors requested
// for Tawi's property types: Land (green), Apartments (blue), Commercial
// Buildings (purple) and Rentals (red). Anything that doesn't match one
// of the four falls back to the app's existing brass pin color.
//
// The app models a listing along two separate axes (see
// stores/propertyTypes.js and Listaproperty.vue):
//   - `type` / `type` category — e.g. "Land/Plot", "Apartments",
//     "Commercial Buildings", "Houses" — what kind of property it is.
//   - `listing_type` — "sale" | "rent" — whether the owner is selling or
//     letting it.
// For map coloring we collapse both into the four requested buckets,
// where "Rentals" wins for anything listed to let, regardless of its
// category — that's the distinction a buyer scanning the map actually
// cares about first.

export const PROPERTY_PIN_COLORS = {
  land: '#3fb26f', // green
  apartments: '#3f8ee0', // blue
  commercial: '#9b6bd9', // purple
  rentals: '#e35b5b', // red
}

// Fallback used for anything that isn't one of the four categories above
// (e.g. a "Houses" listing for sale) — matches the app's existing brass
// picker-pin color so it still reads as "a pin", just not one of the four.
export const DEFAULT_PIN_COLOR = '#a9814b'

export const PIN_LEGEND = [
  { key: 'land', label: 'Land', color: PROPERTY_PIN_COLORS.land },
  { key: 'apartments', label: 'Apartments', color: PROPERTY_PIN_COLORS.apartments },
  { key: 'commercial', label: 'Commercial', color: PROPERTY_PIN_COLORS.commercial },
  { key: 'rentals', label: 'Rentals', color: PROPERTY_PIN_COLORS.rentals },
]

/**
 * Resolve which of the four buckets a listing belongs to for map coloring.
 * Accepts either camelCase (front-end shape, e.g. { type, listingType })
 * or snake_case (raw API shape, e.g. { type, listing_type }).
 * Returns one of 'land' | 'apartments' | 'commercial' | 'rentals' | null.
 */
export function resolvePinCategory(item = {}) {
  const listingType = String(item.listingType ?? item.listing_type ?? '').toLowerCase()
  const type = String(item.type ?? '').toLowerCase()

  if (listingType === 'rent' || type.includes('rent')) return 'rentals'
  if (type.includes('land') || type.includes('plot')) return 'land'
  if (type.includes('apartment') || type.includes('flat')) return 'apartments'
  if (type.includes('commercial') || type.includes('office') || type.includes('shop')) return 'commercial'
  return null
}

export function resolvePinColor(item = {}) {
  const category = resolvePinCategory(item)
  return category ? PROPERTY_PIN_COLORS[category] : DEFAULT_PIN_COLOR
}

export function pinLegendLabel(category) {
  return PIN_LEGEND.find((entry) => entry.key === category)?.label || null
}

export default {
  PROPERTY_PIN_COLORS,
  DEFAULT_PIN_COLOR,
  PIN_LEGEND,
  resolvePinCategory,
  resolvePinColor,
  pinLegendLabel,
}