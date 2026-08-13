// Mirrors propertySubmissionService.js's conventions exactly.
import apiClient from './api'

export const countyService = {
  // PUBLIC on the read side — every dropdown (Home, Categories, Buy, Rent)
  // and Admin.vue call this. Returns every county with its status.
  getAll() {
    return apiClient.get('/counties')
  },

  // Admin-only — apiClient's interceptor attaches the Bearer token.
  restore(id) {
    return apiClient.patch(`/counties/${id}/restore`)
  },

  // Admin-only — apiClient's interceptor attaches the Bearer token.
  pullDown(id) {
    return apiClient.patch(`/counties/${id}/pull-down`)
  }
}

export default countyService