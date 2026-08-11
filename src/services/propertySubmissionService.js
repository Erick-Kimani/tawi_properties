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
  getFeatured(type) {
    return apiClient.get('/property-listings', { params: type ? { type } : {} })
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