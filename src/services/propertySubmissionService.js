import apiClient from './api'

export const propertySubmissionService = {
  // Requires auth (apiClient's interceptor attaches the Bearer token
  // automatically). formData must be a FormData instance — see
  // Listaproperty.vue for how it's built from the form fields + photo file.
  submit(formData) {
    return apiClient.post('/property-submissions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // PUBLIC — no auth required. Powers Buypage.vue / Rentpage.vue.
  // Only ever returns status === 'featured' submissions.
  //
  // filters:
  //   - listing_type: 'sale' | 'rent' — the seller's intent, set on submit.
  //     Buypage always passes 'sale', Rentpage always passes 'rent'. This is
  //     what separates the two pages; it is NOT the same thing as `type`.
  //   - type: property category (e.g. "Apartments", "Land/Plot") — optional,
  //     used for the in-page category dropdown on both Buy and Rent.
  getFeatured(filters = {}) {
    const params = {}
    if (filters.listing_type) params.listing_type = filters.listing_type
    if (filters.type) params.type = filters.type
    return apiClient.get('/property-listings', { params })
  },

  // Admin only
  getAll(params) {
    return apiClient.get('/property-submissions', { params })
  },

  getById(id) {
    return apiClient.get(`/property-submissions/${id}`)
  },

  feature(id, reviewNote) {
    return apiClient.put(`/property-submissions/${id}/feature`, { review_note: reviewNote })
  },

  unfeature(id) {
    return apiClient.put(`/property-submissions/${id}/unfeature`)
  },

  reject(id, reviewNote) {
    return apiClient.put(`/property-submissions/${id}/reject`, { review_note: reviewNote })
  }
}

export default propertySubmissionService