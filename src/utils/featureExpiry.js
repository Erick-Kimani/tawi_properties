const FEATURE_MONTHS = 1
const FEATURE_STORAGE_PREFIX = 'tawi_admin_featured_at:'

export function getStoredFeaturedAt(id) {
  try {
    return localStorage.getItem(FEATURE_STORAGE_PREFIX + id)
  } catch (error) {
    return null
  }
}

export function setStoredFeaturedAt(id, iso) {
  try {
    localStorage.setItem(FEATURE_STORAGE_PREFIX + id, iso)
  } catch (error) {
    // Keep the timer usable when browser storage is unavailable.
  }
}

export function clearStoredFeaturedAt(id) {
  try {
    localStorage.removeItem(FEATURE_STORAGE_PREFIX + id)
  } catch (error) {
    // Keep the timer usable when browser storage is unavailable.
  }
}

export function getFeaturedAt(id, status, featuredAt) {
  if (featuredAt) return featuredAt
  if (status !== 'featured') return null

  const storedFeaturedAt = getStoredFeaturedAt(id)
  if (storedFeaturedAt) return storedFeaturedAt

  const fallbackFeaturedAt = new Date().toISOString()
  setStoredFeaturedAt(id, fallbackFeaturedAt)
  return fallbackFeaturedAt
}

function addMonths(date, months) {
  const result = new Date(date)
  const originalDay = result.getDate()
  result.setMonth(result.getMonth() + months)
  if (result.getDate() !== originalDay) {
    result.setDate(0)
  }
  return result
}

export function getFeatureExpiryInfo(featuredAt, now = Date.now()) {
  if (!featuredAt) return null

  const featuredDate = new Date(featuredAt)
  if (Number.isNaN(featuredDate.getTime())) return null

  const expiresAt = addMonths(featuredDate, FEATURE_MONTHS)
  const msLeft = expiresAt.getTime() - now
  const expired = msLeft <= 0
  const absMs = Math.max(msLeft, 0)
  const days = Math.floor(absMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((absMs % (1000 * 60)) / 1000)

  let severity = 'ok'
  if (expired) severity = 'expired'
  else if (days < 1) severity = 'critical'
  else if (days <= 5) severity = 'warning'

  return { expiresAt, expired, severity, days, hours, minutes, seconds }
}

export function getTimeUnits(info) {
  if (!info) return []
  return [
    { key: 'days', label: 'Days', digits: String(info.days).padStart(2, '0').split('') },
    { key: 'hours', label: 'Hours', digits: String(info.hours).padStart(2, '0').split('') },
    { key: 'minutes', label: 'Minutes', digits: String(info.minutes).padStart(2, '0').split('') },
    { key: 'seconds', label: 'Seconds', digits: String(info.seconds).padStart(2, '0').split('') }
  ]
}

export function getCalendarUnits(info) {
  if (!info) return []
  const date = info.expiresAt
  return [
    { key: 'date', label: 'Date', value: String(date.getDate()).padStart(2, '0') },
    { key: 'month', label: 'Month', value: date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase() },
    { key: 'year', label: 'Year', value: String(date.getFullYear()) }
  ]
}
