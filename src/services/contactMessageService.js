import apiClient from './api'

export const contactMessageService = {
  // Requires auth (apiClient's interceptor attaches the Bearer token
  // automatically). No email/name fields — the sender is identified by
  // their token, not by anything typed in the form.
  send(message) {
    return apiClient.post('/contact-messages', { message })
  },

  // Admin only — the shared inbox.
  getAll(params) {
    return apiClient.get('/contact-messages', { params })
  },

  getById(id) {
    return apiClient.get(`/contact-messages/${id}`)
  },

  markRead(id) {
    return apiClient.put(`/contact-messages/${id}/read`)
  },

  resolve(id) {
    return apiClient.put(`/contact-messages/${id}/resolve`)
  }
}

export default contactMessageService