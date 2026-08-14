import apiClient from './api'

export const contactMessageService = {
  // Requires auth (apiClient's interceptor attaches the Bearer token
  // automatically). No email/name fields — the sender is identified by
  // their token, not by anything typed in the form.
  send(message) {
    return apiClient.post('/contact-messages', { message })
  },

  // The signed-in user's own threads, each with its full reply history —
  // powers the Contact page's "your conversations" view.
  getMine() {
    return apiClient.get('/contact-messages/mine')
  },

  // Post a reply on a thread. Works for both the owning user (continuing
  // their own conversation) and an admin (replying from the inbox) — the
  // backend decides is_admin from who's authenticated, not from anything
  // the client sends.
  addReply(id, body) {
    return apiClient.post(`/contact-messages/${id}/replies`, { body })
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