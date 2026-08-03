<template>
  <div class="admin">
    <!-- Header / hero band -->
    <section class="admin__hero">
      <div class="admin__hero-inner">
        <p class="admin__eyebrow">Internal · Owner submissions</p>
        <h1 class="admin__title">Admin Dashboard</h1>
        <p class="admin__sub">
          Review property owners who want their listing featured on Tawi Properties —
          verify their details, then feature or dismiss each request.
        </p>
      </div>
    </section>

    <section class="admin__body">
      <!-- Stat cards -->
      <div class="stats">
        <div class="stat-card" v-for="s in stats" :key="s.label">
          <span class="stat-card__value">{{ s.value }}</span>
          <span class="stat-card__label">{{ s.label }}</span>
        </div>
      </div>

      <!-- Overview map: every submission that has a pinned location -->
      <div class="map-overview" v-if="pinnedSubmissions.length">
        <div class="map-overview__header">
          <h3>Pinned locations</h3>
          <span class="map-overview__count">{{ pinnedSubmissions.length }} of {{ submissions.length }} pinned</span>
        </div>
        <PropertyMap
          mode="display"
          :markers="pinnedSubmissions"
          height="320px"
        />
      </div>

      <!-- Controls: type filter, search, add -->
      <div class="controls">
        <div class="controls__filters">
          <button
            v-for="t in typeFilters"
            :key="t"
            type="button"
            class="chip"
            :class="{ 'chip--active': activeType === t }"
            @click="activeType = t"
          >
            {{ t }}
          </button>
        </div>

        <div class="controls__right">
          <input
            v-model="search"
            type="text"
            class="controls__search"
            placeholder="Search name, email, phone, location..."
          />
          <button type="button" class="btn btn--primary" @click="openForm">
            + New submission
          </button>
        </div>
      </div>

      <!-- Submissions table -->
      <div class="table-wrap" v-if="filtered.length">
        <table class="table">
          <thead>
            <tr>
              <th class="col-photo"></th>
              <th>Type</th>
              <th>Owner</th>
              <th>Contact</th>
              <th>Price range</th>
              <th>Location</th>
              <th>Status</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filtered" :key="row.id">
              <td class="col-photo">
                <div class="thumb" v-if="row.photo">
                  <img :src="row.photo" :alt="row.location" />
                </div>
                <div class="thumb thumb--placeholder" v-else>
                  {{ initials(row.fullName) }}
                </div>
              </td>
              <td>
                <span class="badge" :class="'badge--' + row.type.toLowerCase()">{{ row.type }}</span>
              </td>
              <td>
                <span class="owner-name">{{ row.fullName }}</span>
                <span class="owner-date">Submitted {{ formatDate(row.submittedAt) }}</span>
              </td>
              <td>
                <a class="contact-line" :href="'mailto:' + row.email">{{ row.email }}</a>
                <span class="contact-line contact-line--dim">{{ row.phone }}</span>
              </td>
              <td>{{ row.priceRange }}</td>
              <td>
                {{ row.location }}
                <span v-if="hasPin(row)" class="pin-flag" title="Coordinates pinned">📍</span>
              </td>
              <td>
                <span class="status" :class="'status--' + row.status">
                  {{ row.status === 'featured' ? 'Featured' : 'Pending' }}
                </span>
              </td>
              <td class="col-actions">
                <button
                  type="button"
                  class="btn btn--ghost"
                  @click="editSubmission(row)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="btn btn--ghost"
                  @click="toggleFeature(row.id)"
                >
                  {{ row.status === 'featured' ? 'Unfeature' : 'Feature' }}
                </button>
                <button
                  type="button"
                  class="btn btn--danger"
                  @click="removeSubmission(row.id)"
                >
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty" v-else>
        <p>No submissions match your filters yet.</p>
      </div>
    </section>

    <!-- Add submission modal -->
    <div class="modal-backdrop" v-if="showForm" @click.self="closeForm">
      <div class="modal">
        <div class="modal__header">
          <h2>{{ editingId ? 'Edit submission' : 'New feature request' }}</h2>
          <button type="button" class="modal__close" @click="closeForm" aria-label="Close">×</button>
        </div>

        <form class="modal__form" @submit.prevent="submitForm">
          <div class="field">
            <label for="type">Property type</label>
            <select id="type" v-model="form.type">
              <option v-for="t in propertyTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <div class="field">
            <label for="fullName">Owner full name</label>
            <input id="fullName" v-model="form.fullName" type="text" placeholder="e.g. Firstname Lastname" required />
          </div>

          <div class="field-row">
            <div class="field">
              <label for="email">Email</label>
              <input id="email" v-model="form.email" type="email" placeholder="owner@example.com" required />
            </div>
            <div class="field">
              <label for="phone">Phone number</label>
              <input id="phone" v-model="form.phone" type="tel" placeholder="+254 7xx xxx xxx" required />
            </div>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="priceRange">Price range</label>
              <input id="priceRange" v-model="form.priceRange" type="text" placeholder="e.g. KES 8M – 12M" required />
            </div>
            <div class="field">
              <label for="location">Location</label>
              <input id="location" v-model="form.location" type="text" placeholder="e.g. Karen, Nairobi" required />
            </div>
          </div>

          <div class="field">
            <label>Pin exact location on map <span class="field__optional">(optional)</span></label>
            <PropertyMap mode="picker" v-model="pin" height="260px" />
          </div>

          <div class="field">
            <label for="photo">Property photo <span class="field__optional">(optional)</span></label>
            <input id="photo" type="file" accept="image/*" @change="handlePhoto" />
            <div class="photo-preview" v-if="form.photo">
              <img :src="form.photo" alt="Preview" />
              <button type="button" class="photo-preview__remove" @click="form.photo = ''">Remove photo</button>
            </div>
          </div>

          <div class="modal__actions">
            <button type="button" class="btn btn--ghost" @click="closeForm">Cancel</button>
            <button type="submit" class="btn btn--primary">{{ editingId ? 'Save changes' : 'Save submission' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import PropertyMap from '@/components/PropertyMap.vue'

const STORAGE_KEY = 'tawi_admin_feature_requests'

const propertyTypes = ['Flat', 'Rental', 'Land', 'House']
const typeFilters = ['All', ...propertyTypes]

const activeType = ref('All')
const search = ref('')
const showForm = ref(false)
const submissions = ref([])

function blankForm() {
  return {
    type: 'Flat',
    fullName: '',
    email: '',
    phone: '',
    priceRange: '',
    location: '',
    photo: ''
  }
}

const form = reactive(blankForm())
const pin = ref(null) // { lat, lng } | null — set via the PropertyMap picker
const editingId = ref(null) // set when the modal is opened to edit an existing row

function makeId() {
  return (crypto.randomUUID && crypto.randomUUID()) || `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function seedData() {
  return [
    {
      id: makeId(),
      type: 'House',
      fullName: 'Grace Wanjiku',
      email: 'grace.wanjiku@example.com',
      phone: '+254 712 345 678',
      priceRange: 'KES 18M – 22M',
      location: 'Karen, Nairobi',
      latitude: -1.3197,
      longitude: 36.7076,
      photo: '/images/Picture3.jpg',
      status: 'featured',
      submittedAt: '2026-07-18'
    },
    {
      id: makeId(),
      type: 'Flat',
      fullName: 'Brian Otieno',
      email: 'brian.otieno@example.com',
      phone: '+254 700 112 233',
      priceRange: 'KES 9.5M',
      location: 'Kilimani, Nairobi',
      latitude: -1.2905,
      longitude: 36.7873,
      photo: '',
      status: 'pending',
      submittedAt: '2026-07-22'
    },
    {
      id: makeId(),
      type: 'Rental',
      fullName: 'Amina Yusuf',
      email: 'amina.yusuf@example.com',
      phone: '+254 733 998 211',
      priceRange: 'KES 65,000 / month',
      location: 'Westlands, Nairobi',
      latitude: -1.2673,
      longitude: 36.8055,
      photo: '/images/Picture2.jpg',
      status: 'pending',
      submittedAt: '2026-07-25'
    },
    {
      id: makeId(),
      type: 'Land',
      fullName: 'Peter Mwangi',
      email: 'peter.mwangi@example.com',
      phone: '+254 720 556 890',
      priceRange: 'KES 4M / half acre',
      location: 'Kitengela',
      latitude: -1.4744,
      longitude: 36.9583,
      photo: '',
      status: 'featured',
      submittedAt: '2026-07-11'
    }
  ]
}

onMounted(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    submissions.value = raw ? JSON.parse(raw) : seedData()
  } catch (e) {
    submissions.value = seedData()
  }
})

watch(
  submissions,
  (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    } catch (e) {
      // storage unavailable — ignore, data stays in memory for this session
    }
  },
  { deep: true }
)

const stats = computed(() => {
  const total = submissions.value.length
  const featured = submissions.value.filter((s) => s.status === 'featured').length
  return [
    { label: 'Total submissions', value: total },
    { label: 'Featured', value: featured },
    { label: 'Pending review', value: total - featured }
  ]
})

const pinnedSubmissions = computed(() =>
  submissions.value
    .filter((s) => typeof s.latitude === 'number' && typeof s.longitude === 'number')
    .map((s) => ({
      id: s.id,
      lat: s.latitude,
      lng: s.longitude,
      title: s.location,
      subtitle: `${s.type} · ${s.fullName}`,
      price: s.priceRange
    }))
)

function hasPin(row) {
  return typeof row.latitude === 'number' && typeof row.longitude === 'number'
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return submissions.value
    .filter((s) => activeType.value === 'All' || s.type === activeType.value)
    .filter((s) => {
      if (!q) return true
      return [s.fullName, s.email, s.phone, s.location].some((field) =>
        field.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
})

function openForm() {
  Object.assign(form, blankForm())
  pin.value = null
  editingId.value = null
  showForm.value = true
}

function editSubmission(row) {
  Object.assign(form, {
    type: row.type,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    priceRange: row.priceRange,
    location: row.location,
    photo: row.photo || ''
  })
  pin.value = hasPin(row) ? { lat: row.latitude, lng: row.longitude } : null
  editingId.value = row.id
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

function handlePhoto(event) {
  const file = event.target.files && event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.photo = reader.result
  }
  reader.readAsDataURL(file)
}

function submitForm() {
  const coords = {
    latitude: pin.value ? pin.value.lat : null,
    longitude: pin.value ? pin.value.lng : null
  }

  if (editingId.value) {
    const existing = submissions.value.find((s) => s.id === editingId.value)
    if (existing) Object.assign(existing, form, coords)
  } else {
    submissions.value.unshift({
      id: makeId(),
      ...form,
      ...coords,
      status: 'pending',
      submittedAt: new Date().toISOString().slice(0, 10)
    })
  }
  closeForm()
}

function toggleFeature(id) {
  const item = submissions.value.find((s) => s.id === id)
  if (item) item.status = item.status === 'featured' ? 'pending' : 'featured'
}

function removeSubmission(id) {
  if (confirm('Remove this submission? This cannot be undone.')) {
    submissions.value = submissions.value.filter((s) => s.id !== id)
  }
}

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.admin {
  min-height: 100vh;
  background: var(--ink);
}

/* ---------- Hero band ---------- */
.admin__hero {
  position: relative;
  padding: 150px var(--gutter) 60px;
  background-image:
    linear-gradient(rgba(20, 23, 28, 0.86), rgba(20, 23, 28, 0.94)),
    url('/images/Picture2.jpg');
  background-size: cover;
  background-position: center;
  border-bottom: 1px solid rgba(169, 129, 75, 0.25);
}

.admin__hero-inner {
  max-width: 1320px;
  margin: 0 auto;
}

.admin__eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brass-bright);
  margin: 0 0 12px;
}

.admin__title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(30px, 4vw, 44px);
  color: var(--bone);
  margin: 0 0 14px;
}

.admin__sub {
  font-size: 15px;
  line-height: 1.6;
  color: var(--bone-dim);
  margin: 0;
  max-width: 640px;
}

/* ---------- Body ---------- */
.admin__body {
  max-width: 1320px;
  margin: 0 auto;
  padding: 40px var(--gutter) 90px;
}

/* Stat cards */
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--slate);
  border: 1px solid rgba(169, 129, 75, 0.2);
  border-radius: 6px;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-card__value {
  font-family: var(--font-display);
  font-size: 32px;
  color: var(--brass-bright);
}

.stat-card__label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--bone-dim);
}

/* Overview map */
.map-overview {
  margin-bottom: 28px;
}

.map-overview__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
}

.map-overview__header h3 {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 16px;
  color: var(--bone);
  margin: 0;
}

.map-overview__count {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--bone-dim);
}

.pin-flag {
  margin-left: 4px;
  font-size: 11px;
}

/* Controls */
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.controls__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  background: var(--slate);
  border: 1px solid rgba(237, 231, 218, 0.12);
  color: var(--bone-dim);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.03em;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.chip:hover {
  color: var(--bone);
  border-color: rgba(169, 129, 75, 0.4);
}

.chip--active {
  background: var(--brass);
  border-color: var(--brass);
  color: var(--ink);
}

.controls__right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.controls__search {
  background: var(--slate);
  border: 1px solid rgba(237, 231, 218, 0.15);
  border-radius: 4px;
  color: var(--bone);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 10px 14px;
  min-width: 260px;
}

.controls__search::placeholder { color: rgba(237, 231, 218, 0.35); }
.controls__search:focus { outline: none; border-color: var(--brass); }

/* Buttons */
.btn {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.02em;
  border-radius: 4px;
  padding: 10px 18px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  white-space: nowrap;
}

.btn--primary {
  background: var(--brass);
  color: var(--ink);
}
.btn--primary:hover { background: var(--brass-bright); }

.btn--ghost {
  background: transparent;
  border-color: rgba(237, 231, 218, 0.2);
  color: var(--bone-dim);
  padding: 8px 14px;
  font-size: 12px;
}
.btn--ghost:hover { color: var(--bone); border-color: var(--brass); }

.btn--danger {
  background: transparent;
  border-color: rgba(217, 139, 106, 0.35);
  color: #d98b6a;
  padding: 8px 14px;
  font-size: 12px;
}
.btn--danger:hover { background: rgba(217, 139, 106, 0.12); }

/* ---------- Table ---------- */
.table-wrap {
  background: var(--slate);
  border: 1px solid rgba(169, 129, 75, 0.2);
  border-radius: 6px;
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.table thead th {
  text-align: left;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--bone-dim);
  padding: 16px 18px;
  border-bottom: 1px solid rgba(237, 231, 218, 0.1);
  white-space: nowrap;
}

.table tbody tr {
  border-bottom: 1px solid rgba(237, 231, 218, 0.06);
}

.table tbody tr:last-child { border-bottom: none; }
.table tbody tr:hover { background: rgba(169, 129, 75, 0.05); }

.table td {
  padding: 14px 18px;
  color: var(--bone);
  font-size: 14px;
  vertical-align: middle;
}

.col-photo { width: 64px; }
.col-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.thumb {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--ink-soft);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--bone-dim);
  border: 1px dashed rgba(237, 231, 218, 0.2);
}

.owner-name {
  display: block;
  font-weight: 500;
  color: var(--bone);
}

.owner-date {
  display: block;
  font-size: 12px;
  color: var(--bone-dim);
  margin-top: 2px;
}

.contact-line {
  display: block;
  color: var(--bone);
  text-decoration: none;
  font-size: 13px;
}

.contact-line:hover { color: var(--brass-bright); }

.contact-line--dim {
  color: var(--bone-dim);
  margin-top: 2px;
}

/* Type badges */
.badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 3px;
  border: 1px solid transparent;
}

.badge--flat {
  color: var(--brass-bright);
  border-color: rgba(169, 129, 75, 0.4);
  background: rgba(169, 129, 75, 0.1);
}

.badge--house {
  color: var(--brass-bright);
  border-color: rgba(201, 160, 106, 0.5);
  background: rgba(201, 160, 106, 0.14);
}

.badge--rental {
  color: var(--pine-bright);
  border-color: rgba(124, 154, 114, 0.4);
  background: rgba(124, 154, 114, 0.1);
}

.badge--land {
  color: var(--bone-dim);
  border-color: rgba(237, 231, 218, 0.2);
  background: rgba(237, 231, 218, 0.06);
}

/* Status pill */
.status {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 20px;
}

.status--pending {
  color: var(--bone-dim);
  background: rgba(237, 231, 218, 0.08);
}

.status--featured {
  color: var(--ink);
  background: var(--brass-bright);
}

/* Empty state */
.empty {
  background: var(--slate);
  border: 1px dashed rgba(237, 231, 218, 0.15);
  border-radius: 6px;
  padding: 60px 20px;
  text-align: center;
  color: var(--bone-dim);
  font-size: 14px;
}

/* ---------- Modal ---------- */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(20, 23, 28, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 100;
}

.modal {
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--slate);
  border: 1px solid rgba(169, 129, 75, 0.25);
  border-radius: 8px;
  padding: 28px 30px 30px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal__header h2 {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 22px;
  color: var(--bone);
  margin: 0;
}

.modal__close {
  background: none;
  border: none;
  color: var(--bone-dim);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 4px;
}

.modal__close:hover { color: var(--bone); }

.modal__form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-row {
  display: flex;
  gap: 16px;
}

.field-row .field { flex: 1; }

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--bone-dim);
}

.field__optional {
  text-transform: none;
  letter-spacing: normal;
  opacity: 0.7;
}

.field input,
.field select {
  width: 100%;
  background: var(--ink);
  border: 1px solid rgba(237, 231, 218, 0.15);
  border-radius: 4px;
  color: var(--bone);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 12px 14px;
}

.field input::placeholder { color: rgba(237, 231, 218, 0.3); }
.field input:focus,
.field select:focus { outline: none; border-color: var(--brass); }

.field input[type='file'] {
  padding: 10px 12px;
  color: var(--bone-dim);
  font-size: 13px;
}

.photo-preview {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.photo-preview img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 6px;
}

.photo-preview__remove {
  background: none;
  border: none;
  color: #d98b6a;
  font-family: var(--font-mono);
  font-size: 12px;
  cursor: pointer;
  padding: 0;
}

.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

/* ---------- Responsive ---------- */
@media (max-width: 720px) {
  .admin__hero { padding: 130px 20px 40px; }
  .admin__body { padding: 32px 20px 60px; }
  .field-row { flex-direction: column; }
  .controls__search { min-width: 0; flex: 1; }
  .col-actions { flex-direction: column; align-items: stretch; }
}
</style>