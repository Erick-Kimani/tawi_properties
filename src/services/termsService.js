import apiClient from './api'

export const termsService = {
  // PUBLIC — the versions the backend currently considers current, one
  // per audience. Useful as a boot-time sanity check: if this disagrees
  // with TERMS_VERSION in src/data/terms.js, the two sides have drifted
  // and submissions will start getting rejected with a 409.
  current() {
    return apiClient.get('/terms/current')
  },

  // Requires auth. What the signed-in user has accepted so far:
  // { general: { version, accepted_at, is_current }, seller: {...} | null }
  status() {
    return apiClient.get('/terms/status')
  },

  // Requires auth. Records an acceptance on its own — used when someone
  // accepts outside a form that already carries the flags (e.g. a
  // re-acceptance prompt after we publish a new version).
  //
  // Registration and property submission do NOT go through here: they
  // send accepted_terms/accepted_terms_version with their own request so
  // the acceptance and the thing it authorizes are written in the same
  // transaction.
  accept(audience, version, context = null) {
    return apiClient.post('/terms/accept', {
      audience,
      version,
      context
    })
  }
}

export default termsService