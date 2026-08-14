import apiClient from './api'

export const contactMessageService = {
  // Requires auth (apiClient's interceptor attaches the Bearer token
  // automatically). No email/name fields — the sender is identified by
  // their token, not by anything typed in the form.
  send(message) {
    return apiClient.post('/contact-messages', { message })
  },

  // The logged-in user's own messages + reply threads. Scoped server-side
  // to their user_id — never returns anyone else's. Powers Contact.vue's
  // "your messages" view.
  getMine() {
    return apiClient.get('/contact-messages/mine')
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
  },

  // Admin only — appends the admin's reply to the message's thread
  // in-app (see ContactMessageController@reply / contact_message_replies).
  // Not an email — the sender sees it next time they view the thread.
  reply(id, replyText) {
    return apiClient.put(`/contact-messages/${id}/reply`, { reply: replyText })
  }
}

export default contactMessageService