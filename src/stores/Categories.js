// Single source of truth for the four property categories shown on the
// homepage and used to filter listings on the category page.
// `types` maps each category to the property "type" values used by the
// Admin dashboard / List-a-property form (src/views/Admin.vue,
// src/views/Listaproperty.vue) so real submissions surface automatically.

export const categories = [
  {
    slug: 'land',
    eyebrow: 'For Sale',
    title: 'Land',
    tagline: 'Plots & acreage',
    description: 'Surveyed, ready-to-build parcels and investment acreage on the outskirts of the city.',
    image: '/images/Picture7.jpg',
    types: ['Land']
  },
  {
    slug: 'rentals',
    eyebrow: 'For Rent',
    title: 'Rentals',
    tagline: 'Monthly lets',
    description: 'Furnished and unfurnished homes available on flexible, month-to-month leases.',
    image: '/images/Picture6.jpg',
    types: ['Rental']
  },
  {
    slug: 'commercial',
    eyebrow: 'For Sale & Lease',
    title: 'Commercial',
    tagline: 'Offices & retail',
    description: 'Office floors, retail units and mixed-use premises in prime business districts.',
    image: '/images/Picture3.jpg',
    types: ['Commercial']
  },
  {
    slug: 'houses',
    eyebrow: 'For Sale',
    title: 'Houses & Apartments',
    tagline: 'Homes & flats',
    description: 'Family houses, townhouses and apartments across Nairobi\'s most sought-after suburbs.',
    image: '/images/Picture4.jpg',
    types: ['House', 'Flat']
  }
]

export function getCategoryBySlug(slug) {
  return categories.find((c) => c.slug === slug) || null
}