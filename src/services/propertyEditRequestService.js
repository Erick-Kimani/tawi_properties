import apiClient from './api'

export const propertyEditRequestService = {
  // Requires auth — propose a change to one of the caller's own listings.
  // payload may include any of: type, description, latitude, longitude,
  // phone (only the fields actually being changed — omit the rest) plus
  // the required seller_note explaining why. Only ever creates a pending
  // request; nothing here touches the live listing (see
  // PropertyEditRequestController::store on the backend).
  // payload is a plain object, or a FormData when replacement photos
  // (photo, photo_2, photo_3) are included.
  submit(submissionId, payload) {
    const config = payload instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : undefined
    return apiClient.post(`/property-submissions/${submissionId}/edit-requests`, payload, config)
  },

  // Admin only — top up one listing's edit-request allowance for a seller
  // who's used theirs up. count defaults to 1 server-side (max 5 per grant).
  grantExtra(submissionId, count = 1) {
    return apiClient.post(`/property-submissions/${submissionId}/grant-edit-requests`, { count })
  },

  // Admin only — the review queue. status defaults to 'pending' server-side
  // when omitted; pass 'all' for the full history.
  getAll(status) {
    const params = {}
    if (status) params.status = status
    return apiClient.get('/edit-requests', { params })
  },

  // Admin only — applies exactly the fields the request proposed onto the
  // live listing. adminNote is optional here (approval is self-explanatory).
  approve(id, adminNote) {
    return apiClient.put(`/edit-requests/${id}/approve`, { admin_note: adminNote || undefined })
  },

  // Admin only — adminNote is REQUIRED by the backend (min 5 chars): a
  // rejection is the one outcome the seller needs an explanation for.
  reject(id, adminNote) {
    return apiClient.put(`/edit-requests/${id}/reject`, { admin_note: adminNote })
  }
}

export default propertyEditRequestService