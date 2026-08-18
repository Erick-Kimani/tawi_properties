// Thin wrapper around Google Identity Services (GIS). We deliberately
// don't use Google's stock rendered button — GoogleButton.vue draws its
// own button with the real multi-colour "G" mark — so instead we use
// GIS's token client, which lets any element trigger the OAuth popup via
// requestAccessToken().
//
// Flow: click our button -> Google popup -> user picks account -> GIS
// hands us an access_token -> we send that to the backend, which verifies
// it directly with Google and logs the user in/registers them.

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

let scriptPromise = null
let tokenClient = null

function loadGisScript() {
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve(window.google)
      return
    }

    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.google)
    script.onerror = () => reject(new Error('Failed to load Google Identity Services.'))
    document.head.appendChild(script)
  })

  return scriptPromise
}

function getTokenClient(google) {
  if (tokenClient) return tokenClient

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (!clientId) {
    throw new Error('VITE_GOOGLE_CLIENT_ID is not set — Google sign-in is not configured.')
  }

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'openid email profile',
    // callback is (re)assigned per-request in requestGoogleAccessToken,
    // since each click needs its own resolve/reject pair.
    callback: () => {}
  })

  return tokenClient
}

// Opens the Google account picker popup and resolves with an OAuth
// access_token once the user completes it. Rejects if they close the
// popup or something goes wrong.
export async function requestGoogleAccessToken() {
  const google = await loadGisScript()
  const client = getTokenClient(google)

  return new Promise((resolve, reject) => {
    client.callback = (response) => {
      if (response.error) {
        reject(new Error(response.error_description || response.error))
        return
      }
      resolve(response.access_token)
    }

    // error_callback covers the user closing the popup without picking
    // an account — otherwise the promise would hang forever.
    client.error_callback = (error) => {
      reject(new Error(error?.message || 'Google sign-in was cancelled.'))
    }

    client.requestAccessToken({ prompt: '' })
  })
}