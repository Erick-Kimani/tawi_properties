<template>
  <div class="admin">
    <section class="admin-hero" ref="heroRef">
      <div class="admin-hero__inner" ref="heroInnerRef">
        <p class="admin-hero__eyebrow">Dashboard</p>
        <h1 class="admin-hero__title">Property submissions</h1>
        <p class="admin-hero__sub">
          Requests submitted through the "List a property" form. Feature a listing
          to make it public on its category page, or remove it.
        </p>
      </div>
    </section>

    <div class="admin__body">
      <div class="admin__stats" ref="statsRef">
        <div class="stat">
          <span class="stat__value">{{ rows.length }}</span>
          <span class="stat__label">Total</span>
        </div>
        <div class="stat">
          <span class="stat__value">{{ featuredCount }}</span>
          <span class="stat__label">Featured</span>
        </div>
        <div class="stat">
          <span class="stat__value">{{ pendingCount }}</span>
          <span class="stat__label">Pending</span>
        </div>
      </div>

      <div class="admin__toolbar" ref="toolbarRef">
        <div class="admin__search">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search submissions..."
            aria-label="Search submissions"
          />
        </div>

        <div class="admin__filters">
          <button
            v-for="f in filters"
            :key="f"
            class="filter-pill"
            :class="{ 'filter-pill--active': activeFilter === f }"
            @click="activeFilter = f"
          >
            {{ f }}
          </button>
        </div>
      </div>

    <div class="admin__table card-surface" ref="tableRef" v-if="filteredRows.length">
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Submitted by</th>
            <th>Contact</th>
            <th>Price</th>
            <th>Location</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filteredRows" :key="row.id" :data-row-id="row.id">
            <td>
              <span class="badge" :class="'badge--' + row.type.toLowerCase()">{{ row.type }}</span>
            </td>
            <td>{{ row.fullName }}</td>
            <td>
              <div class="contact">
                <span>{{ row.email }}</span>
                <span class="contact__phone">{{ row.phone }}</span>
              </div>
            </td>
            <td>{{ row.priceRange }}</td>
            <td>{{ row.location }}</td>
            <td>
              <span class="status-pill" :class="'status-pill--' + row.status">{{ row.status }}</span>
            </td>
            <td class="admin__date">{{ row.submittedAt }}</td>
            <td class="admin__actions">
              <button
                v-if="row.status !== 'featured'"
                class="action action--feature"
                @click="setStatus(row.id, 'featured')"
              >
                Feature
              </button>
              <button
                v-else
                class="action action--unfeature"
                @click="setStatus(row.id, 'pending')"
              >
                Unfeature
              </button>
              <button class="action action--delete" @click="removeRow(row.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="admin__empty card-surface" ref="emptyRef" v-else>
      <p>No submissions match this filter yet.</p>
    </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import { animate } from 'animejs'

const STORAGE_KEY = 'tawi_admin_feature_requests'

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
      phone: '+254 722 445 108',
      priceRange: 'KES 18,500,000',
      location: 'Karen, Nairobi',
      latitude: -1.3193,
      longitude: 36.7076,
      photo: '/images/Picture4.jpg',
      status: 'featured',
      submittedAt: '2026-07-02'
    },
    {
      id: makeId(),
      type: 'Rental',
      fullName: 'Brian Otieno',
      email: 'brian.otieno@example.com',
      phone: '+254 733 998 214',
      priceRange: 'KES 95,000 / month',
      location: 'Westlands, Nairobi',
      latitude: -1.2657,
      longitude: 36.8064,
      photo: '/images/Picture6.jpg',
      status: 'featured',
      submittedAt: '2026-07-09'
    },
    {
      id: makeId(),
      type: 'Land',
      fullName: 'Mary Achieng',
      email: 'mary.achieng@example.com',
      phone: '+254 700 112 233',
      priceRange: 'KES 6,200,000',
      location: 'Kiambu Road',
      latitude: -1.1966,
      longitude: 36.8390,
      photo: '/images/Picture7.jpg',
      status: 'pending',
      submittedAt: '2026-07-11'
    },
    {
      id: makeId(),
      type: 'Commercial',
      fullName: 'Samuel Kariuki',
      email: 'samuel.kariuki@example.com',
      phone: '+254 711 224 560',
      priceRange: 'KES 350,000 / month',
      location: 'Upper Hill, Nairobi',
      latitude: -1.2996,
      longitude: 36.8125,
      photo: '/images/Picture5.jpg',
      status: 'featured',
      submittedAt: '2026-07-28'
    }
  ]
}

function loadRows() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch (e) {
    // fall through to seed data
  }
  const seeded = seedData()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
  } catch (e) {
    // storage unavailable — seed data still renders this session
  }
  return seeded
}

const rows = ref(loadRows())
const heroRef = ref(null)
const heroInnerRef = ref(null)
const statsRef = ref(null)
const toolbarRef = ref(null)
const tableRef = ref(null)
const emptyRef = ref(null)

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.value))
  } catch (e) {
    // storage unavailable
  }
}

function animateRows() {
  if (!tableRef.value) return

  const rowsInTable = tableRef.value.querySelectorAll('tbody tr')
  if (!rowsInTable.length) return

  animate({
    targets: rowsInTable,
    opacity: [0, 1],
    translateY: [16, 0],
    duration: 480,
    delay: (el, i) => i * 70,
    easing: 'easeOutQuad'
  })
}

function animateStatusPulse(id) {
  const targetRow = tableRef.value?.querySelector(`[data-row-id="${id}"]`)
  if (!targetRow) return

  animate({
    targets: targetRow,
    scale: [1, 1.01, 1],
    duration: 420,
    easing: 'easeOutQuad'
  })
}

function setStatus(id, status) {
  const row = rows.value.find((r) => r.id === id)
  if (row) {
    row.status = status
    persist()
    animateStatusPulse(id)
  }
}

function removeRow(id) {
  rows.value = rows.value.filter((r) => r.id !== id)
  persist()
  nextTick(() => {
    if (filteredRows.value.length) {
      animateRows()
    } else if (emptyRef.value) {
      animate({
        targets: emptyRef.value,
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 320,
        easing: 'easeOutQuad'
      })
    }
  })
}

const filters = ['All', 'Featured', 'Pending']
const activeFilter = ref('All')
const searchQuery = ref('')

const filteredRows = computed(() => {
  let result = rows.value

  if (activeFilter.value === 'Featured') {
    result = result.filter((r) => r.status === 'featured')
  } else if (activeFilter.value === 'Pending') {
    result = result.filter((r) => r.status === 'pending')
  }

  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return result

  return result.filter((row) => {
    const haystack = [
      row.fullName,
      row.email,
      row.phone,
      row.location,
      row.type,
      row.priceRange,
      row.status
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(query)
  })
})

const featuredCount = computed(() => rows.value.filter((r) => r.status === 'featured').length)
const pendingCount = computed(() => rows.value.filter((r) => r.status === 'pending').length)

onMounted(() => {
  nextTick(() => {
    if (heroInnerRef.value) {
      animate({
        targets: heroInnerRef.value,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 700,
        easing: 'easeOutExpo'
      })
    }

    if (statsRef.value) {
      const statCards = statsRef.value.querySelectorAll('.stat')
      animate({
        targets: statCards,
        opacity: [0, 1],
        translateY: [16, 0],
        delay: (el, i) => i * 80,
        duration: 500,
        easing: 'easeOutQuad'
      })
    }

    if (toolbarRef.value) {
      animate({
        targets: toolbarRef.value,
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 500,
        easing: 'easeOutQuad'
      })
    }

    if (filteredRows.value.length) {
      animateRows()
    } else if (emptyRef.value) {
      animate({
        targets: emptyRef.value,
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 320,
        easing: 'easeOutQuad'
      })
    }
  })
})

watch(filteredRows, () => {
  nextTick(() => {
    if (filteredRows.value.length) {
      animateRows()
    }
  })
}, { flush: 'post' })
</script>

<style scoped>
.admin {
  min-height: 100vh;
  background: var(--ink);
}

.admin-hero {
  position: relative;
  height: clamp(290px, 60vh, 600px);
  background-image:
    linear-gradient(180deg, rgba(15, 19, 24, 0.55) 0%, rgba(15, 19, 24, 0.55) 40%, rgba(15, 19, 24, 0.96) 100%),
    url('/images/Picture2.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
}

.admin-hero__inner {
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 var(--gutter) 40px;
}

.admin-hero__eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brass-bright);
  margin: 0 0 10px;
}

.admin-hero__title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(30px, 4vw, 44px);
  color: var(--bone);
  margin: 0 0 12px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
}

.admin-hero__sub {
  font-size: 14px;
  line-height: 1.6;
  color: var(--bone-dim);
  margin: 0;
  max-width: 480px;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
}

.admin__body {
  max-width: 1320px;
  margin: 0 auto;
  padding: 40px var(--gutter) 80px;
}

.admin__stats {
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 84px;
  padding: 14px 10px;
  border: 1px solid rgba(237, 231, 218, 0.12);
  background: var(--ink-soft);
}

.stat__value {
  font-family: var(--font-display);
  font-size: 24px;
  color: var(--bone);
}

.stat__label {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--bone-dim);
  margin-top: 4px;
}

.admin__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.admin__search {
  flex: 1 1 260px;
}

.admin__search input {
  width: 100%;
  border: 1px solid rgba(237, 231, 218, 0.18);
  background: var(--ink-soft);
  color: var(--bone);
  padding: 10px 14px;
  font-size: 14px;
  font-family: var(--font-body);
}

.admin__search input::placeholder {
  color: rgba(237, 231, 218, 0.38);
}

.admin__search input:focus {
  outline: none;
  border-color: rgba(209, 178, 127, 0.55);
}

.admin__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-pill {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--bone-dim);
  background: none;
  border: 1px solid rgba(237, 231, 218, 0.18);
  padding: 8px 16px;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.filter-pill:hover { color: var(--bone); }

.filter-pill--active {
  color: var(--ink);
  background: var(--brass-bright);
  border-color: var(--brass-bright);
}

.admin__table {
  overflow-x: auto;
  padding: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 820px;
}

thead th {
  text-align: left;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--bone-dim);
  padding: 14px 16px;
  border-bottom: 1px solid rgba(237, 231, 218, 0.12);
}

tbody td {
  padding: 14px 16px;
  font-size: 13.5px;
  color: var(--bone);
  border-bottom: 1px solid rgba(237, 231, 218, 0.07);
  vertical-align: middle;
}

tbody tr:last-child td { border-bottom: none; }
tbody tr:hover { background: rgba(237, 231, 218, 0.03); }

.contact {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12.5px;
}

.contact__phone { color: var(--bone-dim); }

.admin__date {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--bone-dim);
  white-space: nowrap;
}

.admin__actions {
  display: flex;
  gap: 8px;
  white-space: nowrap;
}

.action {
  font-family: var(--font-mono);
  font-size: 11.5px;
  letter-spacing: 0.03em;
  border: 1px solid rgba(237, 231, 218, 0.2);
  background: none;
  color: var(--bone-dim);
  padding: 7px 12px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.action--feature {
  color: var(--ink);
  background: var(--brass);
  border-color: var(--brass);
}
.action--feature:hover { background: var(--brass-bright); }

.action--unfeature:hover {
  color: var(--bone);
  border-color: var(--brass);
}

.action--delete:hover {
  color: #dd7f75;
  border-color: #dd7f75;
}

.admin__empty {
  padding: 48px 20px;
  text-align: center;
  color: var(--bone-dim);
  font-size: 14px;
}

/* Type badges */
.badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 4px 9px;
  border: 1px solid rgba(237, 231, 218, 0.25);
  border-radius: 2px;
}

.badge--flat {
  color: var(--sky);
  border-color: rgba(123, 183, 214, 0.35);
  background: rgba(123, 183, 214, 0.1);
}

.badge--rental {
  color: var(--pine-bright);
  border-color: rgba(126, 162, 127, 0.4);
  background: rgba(126, 162, 127, 0.1);
}

.badge--house {
  color: var(--brass-bright);
  border-color: rgba(209, 178, 127, 0.4);
  background: rgba(209, 178, 127, 0.1);
}

.badge--land {
  color: var(--bone-dim);
  border-color: rgba(237, 231, 218, 0.2);
  background: rgba(237, 231, 218, 0.06);
}

.badge--commercial {
  color: var(--sky);
  border-color: rgba(123, 183, 214, 0.35);
  background: rgba(123, 183, 214, 0.1);
}

/* Status pill */
.status-pill {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.05em;
  text-transform: capitalize;
  padding: 4px 10px;
  border-radius: 999px;
}

.status-pill--featured {
  color: var(--pine-bright);
  background: rgba(126, 162, 127, 0.14);
}

.status-pill--pending {
  color: var(--brass-bright);
  background: rgba(209, 178, 127, 0.14);
}

@media (max-width: 720px) {
  .admin__body { padding: 32px 20px 60px; }
  .admin-hero__inner { padding-bottom: 28px; }
  .admin__stats { width: 100%; justify-content: space-between; }
  .stat { flex: 1; min-width: 0; }
  .admin__toolbar { align-items: stretch; }
  .admin__search { flex-basis: 100%; }
}
</style>