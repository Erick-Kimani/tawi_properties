// Single source of truth for the four property categories shown on the
// homepage and used to filter listings on the category page.
//
// Real submissions carry a `type` value that comes from the backend's
// property-types table (see src/stores/propertyTypes.js) and can vary in
// exact wording ("Land", "Land/Plot", "Houses", "Apartments", "Commercial
// Buildings", etc). Rather than requiring an exact string match, each
// category defines a `matches(item)` predicate that does a loose,
// case-insensitive keyword check — the same approach already used for
// map-pin coloring in src/utils/propertyPinColors.js — so real listings
// surface here regardless of exactly how the type is worded.
//
// `item` is the camelCase shape used across Buypage/Rentpage/Categorylisting:
// { type, listingType, ... }. Land/Commercial/Houses match on `type` alone,
// so a matching listing shows up here whether it's for sale or for rent —
// per product requirement, clicking "Land" should show all land listings,
// sale and rental alike. "Rentals" is the odd one out: it's not a property
// type, it's a listing status, so it matches purely on `listingType`
// regardless of what kind of property it is.

function typeOf(item) {
  return String(item?.type ?? '').toLowerCase()
}

function listingTypeOf(item) {
  return String(item?.listingType ?? item?.listing_type ?? '').toLowerCase()
}

export const categories = [
  {
    slug: 'land',
    eyebrow: 'For Sale',
    title: 'Land',
    tagline: 'Plots & acreage',
    description: 'Surveyed, ready-to-build parcels and investment acreage on the outskirts of the city.',
    image: '/images/Picture7.jpg',
    matches(item) {
      const type = typeOf(item)
      return type.includes('land') || type.includes('plot')
    }
  },
  {
    slug: 'rentals',
    eyebrow: 'For Rent',
    title: 'Rentals',
    tagline: 'Monthly lets',
    description: 'Furnished and unfurnished homes available on flexible, month-to-month leases.',
    image: '/images/Picture8.jpg',
    matches(item) {
      return listingTypeOf(item) === 'rent'
    }
  },
  {
    slug: 'commercial',
    eyebrow: 'For Sale & Lease',
    title: 'Commercial',
    tagline: 'Offices & retail',
    description: 'Office floors, retail units and mixed-use premises in prime business districts.',
    image: '/images/Picture3.jpg',
    matches(item) {
      const type = typeOf(item)
      return type.includes('commercial') || type.includes('office') || type.includes('shop')
    }
  },
  {
    slug: 'houses',
    eyebrow: 'For Sale',
    title: 'Houses & Apartments',
    tagline: 'Homes & flats',
    description: 'Family houses, townhouses and apartments across Nairobi\'s most sought-after suburbs.',
    image: '/images/Picture4.jpg',
    matches(item) {
      const type = typeOf(item)
      return type.includes('house') || type.includes('apartment') || type.includes('flat')
    }
  }
]

export function getCategoryBySlug(slug) {
  return categories.find((c) => c.slug === slug) || null
}