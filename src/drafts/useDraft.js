import { watch, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'

// Frontend-only draft saving for forms that take free-text input.
//
//   const draft = useDraft('list-property', {
//     read:  () => ({ ...form, pin: pin.value }),   // what to save
//     apply: (saved) => { Object.assign(form, saved) }, // how to restore it
//     isEmpty: (v) => !v.description && !v.location,    // skip saving blanks
//   })
//   draft.restore()   // call once on mount
//   draft.clear()     // call after a successful submit / reset
//
// Drafts live in localStorage under a key scoped to the signed-in user
// (or "guest"), so one person's draft is never shown to another on a
// shared device. Every storage call is wrapped in try/catch because
// storage can be blocked (private mode) or full — the form must keep
// working either way.
const PREFIX = 'tawi:draft:'
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // drafts expire after 30 days
const DEBOUNCE_MS = 500

export function useDraft(name, { read, apply, isEmpty = () => false }) {
  const auth = useAuthStore()
  const storageKey = () => `${PREFIX}${name}:${auth.user?.id ?? 'guest'}`

  let timer = null
  let enabled = false // no saving until restore() has run, so a blank
                      // initial form can't overwrite an existing draft

  function save() {
    try {
      const value = read()
      if (isEmpty(value)) {
        localStorage.removeItem(storageKey())
        return
      }
      localStorage.setItem(storageKey(), JSON.stringify({ savedAt: Date.now(), value }))
    } catch { /* storage unavailable or full — ignore */ }
  }

  function clear() {
    clearTimeout(timer)
    try { localStorage.removeItem(storageKey()) } catch { /* ignore */ }
  }

  // Returns true if a draft was found and applied.
  function restore() {
    let restored = false
    try {
      const raw = localStorage.getItem(storageKey())
      if (raw) {
        const { savedAt, value } = JSON.parse(raw)
        if (Date.now() - savedAt > MAX_AGE_MS) {
          localStorage.removeItem(storageKey())
        } else {
          apply(value)
          restored = true
        }
      }
    } catch { /* corrupt JSON etc. — treat as no draft */ }
    enabled = true
    return restored
  }

  watch(read, () => {
    if (!enabled) return
    clearTimeout(timer)
    timer = setTimeout(save, DEBOUNCE_MS)
  }, { deep: true })

  // Flush a pending debounce when leaving the page so the last
  // keystrokes aren't lost to navigation or a tab switch.
  function flush() {
    if (!enabled || timer === null) return
    clearTimeout(timer)
    timer = null
    save()
  }
  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
  onBeforeUnmount(() => {
    flush()
    window.removeEventListener('pagehide', flush)
  })

  return { restore, clear, save }
}