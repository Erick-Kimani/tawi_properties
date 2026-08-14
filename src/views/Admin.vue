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

        <!-- Separate axis from status above: this filters by the seller's
             listing_type (sale/rent), not by review status. Kept as its own
             pill group rather than merged into `filters` so the two
             questions ("is it reviewed?" vs "sale or rent?") stay distinct
             and can be combined freely. -->
        <div class="admin__filters">
          <button
            v-for="lf in listingFilters"
            :key="lf"
            class="filter-pill"
            :class="{ 'filter-pill--active': activeListingFilter === lf }"
            @click="activeListingFilter = lf"
          >
            {{ lf }}
          </button>
        </div>
      </div>

    <p v-if="loading" class="admin__status-text">Loading submissions…</p>
    <p v-if="loadError" class="admin__status-text admin__status-text--error">{{ loadError }}</p>

    <div class="admin__table card-surface" ref="tableRef" v-if="rows.length && filteredRows.length">
      <table>
        <thead>
          <tr>
            <th>Listing</th>
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
              <span
                class="badge badge--listing"
                :class="row.listingType === 'rent' ? 'badge--listing-rent' : 'badge--listing-sale'"
              >
                {{ row.listingType === 'rent' ? 'Rent' : 'Sell' }}
              </span>
            </td>
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
                @click="handleFeature(row.id)"
              >
                Feature
              </button>
              <button
                v-else
                class="action action--unfeature"
                @click="handleUnfeature(row.id)"
              >
                Unfeature
              </button>
              <button class="action action--delete" @click="handleReject(row.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="admin__empty card-surface" ref="emptyRef" v-else-if="rows.length === 0 && !loading">
      <img
        class="admin__empty-illustration"
        src="/images/Discovery-amico.svg"
        alt="No submissions yet"
      />
      <p>No submissions have been added yet.</p>
    </div>

    <div class="admin__empty card-surface" v-else-if="!loading">
      <p>No submissions match this filter yet.</p>
    </div>

    <section class="admin__messages" ref="messagesRef">
      <div class="admin__counties-head">
        <div>
          <h2 class="admin__counties-title">Messages</h2>
          <p class="admin__counties-sub">
            Sent through the Contact Us page. Every message comes from a signed-in
            account, so there's no email to verify.
          </p>
        </div>
        <div class="admin__stats admin__counties-stats">
          <div class="stat">
            <span class="stat__value">{{ messages.length }}</span>
            <span class="stat__label">Total</span>
          </div>
          <div class="stat">
            <span class="stat__value">{{ newMessagesCount }}</span>
            <span class="stat__label">New</span>
          </div>
        </div>
      </div>

      <div class="admin__toolbar">
        <div class="admin__search">
          <input
            v-model="messageSearchQuery"
            type="search"
            placeholder="Search messages..."
            aria-label="Search messages"
          />
        </div>

        <div class="admin__filters">
          <button
            v-for="f in messageFilters"
            :key="f"
            class="filter-pill"
            :class="{ 'filter-pill--active': activeMessageFilter === f }"
            @click="activeMessageFilter = f"
          >
            {{ f }}
          </button>
        </div>
      </div>

      <p v-if="messagesLoading" class="admin__status-text">Loading messages…</p>
      <p v-if="messagesError" class="admin__status-text admin__status-text--error">
        {{ messagesError }}
      </p>

      <div
        class="admin__table card-surface"
        ref="messagesTableRef"
        v-if="messages.length && filteredMessages.length"
      >
        <table>
          <thead>
            <tr>
              <th>From</th>
              <th>Message</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="msg in filteredMessages"
              :key="msg.id"
              :data-message-row-id="msg.id"
            >
              <td>
                <div class="contact">
                  <span>{{ msg.senderName }}</span>
                  <span class="contact__phone">{{ msg.senderEmail }}</span>
                </div>
              </td>
              <td class="admin__message-text">
                {{ msg.message }}
                <div v-if="msg.replies.length" class="admin__message-thread">
                  <p
                    v-for="r in msg.replies"
                    :key="r.id"
                    class="admin__message-reply"
                    :class="{ 'admin__message-reply--admin': r.isAdmin }"
                  >
                    <span class="admin__message-reply-label">
                      {{ r.isAdmin ? 'You' : msg.senderName }} · {{ r.createdAt }}
                    </span>
                    {{ r.body }}
                  </p>
                </div>
              </td>
              <td>
                <span class="status-pill" :class="'status-pill--' + msg.status">
                  {{ msg.status }}
                </span>
              </td>
              <td class="admin__date">{{ msg.createdAt }}</td>
              <td class="admin__actions">
                <button
                  v-if="msg.status === 'new'"
                  class="action action--feature"
                  @click="handleMarkRead(msg.id)"
                >
                  Mark read
                </button>
                <button class="action action--feature" @click="openReplyModal(msg)">
                  {{ msg.replies.length ? 'Reply again' : 'Reply' }}
                </button>
                <button
                  v-if="msg.status !== 'resolved'"
                  class="action action--unfeature"
                  @click="handleResolve(msg.id)"
                >
                  Resolve
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="admin__empty card-surface" v-else-if="messages.length === 0 && !messagesLoading">
        <p>No messages yet.</p>
      </div>

      <div class="admin__empty card-surface" v-else-if="!messagesLoading">
        <p>No messages match this filter yet.</p>
      </div>
    </section>

    <!-- Reply modal — sends the reply server-side via ContactMessageController@reply,
         which emails replyTargetMessage's sender directly. Not tied to any
         particular row in the DOM, so it works regardless of table scroll
         position/filtering. -->
    <div v-if="replyTarget" class="reply-modal__backdrop" @click.self="closeReplyModal">
      <div class="reply-modal" role="dialog" aria-modal="true" aria-labelledby="reply-modal-title">
        <h3 id="reply-modal-title">Reply to {{ replyTarget.senderName }}</h3>
        <p class="reply-modal__original">{{ replyTarget.message }}</p>

        <textarea
          v-model="replyText"
          rows="5"
          placeholder="Type your reply…"
          :disabled="replySending"
        ></textarea>

        <p v-if="replyError" class="field__error">{{ replyError }}</p>

        <div class="reply-modal__actions">
          <button type="button" class="btn btn--ghost" @click="closeReplyModal" :disabled="replySending">
            Cancel
          </button>
          <button type="button" class="btn btn--primary" @click="submitReply" :disabled="replySending">
            {{ replySending ? 'Sending…' : 'Send reply' }}
          </button>
        </div>
      </div>
    </div>

    <section class="admin__counties" ref="countiesRef">
      <div class="admin__counties-head">
        <div>
          <h2 class="admin__counties-title">Manage counties</h2>
          <p class="admin__counties-sub">
            Pull a county down to hide it from the location dropdown on the Home, Categories,
            Buy and Rent pages. This does not delete it — restore it any time.
          </p>
        </div>
        <div class="admin__stats admin__counties-stats">
          <div class="stat">
            <span class="stat__value">{{ activeCounties.length }}</span>
            <span class="stat__label">Active</span>
          </div>
          <div class="stat">
            <span class="stat__value">{{ hiddenCounties.length }}</span>
            <span class="stat__label">Pulled down</span>
          </div>
        </div>
      </div>

      <div class="admin__toolbar">
        <div class="admin__search">
          <input
            v-model="countyQuery"
            type="search"
            placeholder="Search counties..."
            aria-label="Search counties"
          />
        </div>

        <div class="admin__filters">
          <button
            v-for="f in countyFilters"
            :key="f"
            class="filter-pill"
            :class="{ 'filter-pill--active': activeCountyFilter === f }"
            @click="activeCountyFilter = f"
          >
            {{ f }}
          </button>
        </div>
      </div>

      <p v-if="countiesLoading" class="admin__status-text">Loading counties…</p>
      <p v-if="countiesError" class="admin__status-text admin__status-text--error">
        {{ countiesError }}
      </p>
      <p v-if="countyActionError" class="admin__status-text admin__status-text--error">
        {{ countyActionError }}
      </p>

      <div class="admin__table card-surface" v-if="filteredCounties.length">
        <table>
          <thead>
            <tr>
              <th>County</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="county in filteredCounties" :key="county">
              <td>{{ county }}</td>
              <td>
                <span
                  class="status-pill"
                  :class="isHidden(county) ? 'status-pill--pending' : 'status-pill--featured'"
                >
                  {{ isHidden(county) ? 'Pulled down' : 'Active' }}
                </span>
              </td>
              <td class="admin__actions">
                <button
                  v-if="!isHidden(county)"
                  class="action action--delete"
                  @click="handlePullDown(county)"
                >
                  Pull down
                </button>
                <button
                  v-else
                  class="action action--feature"
                  @click="handleRestore(county)"
                >
                  Restore
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="admin__empty card-surface" v-else-if="!countiesLoading">
        <p>No counties match this search.</p>
      </div>
    </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import { animate } from 'animejs'
import { useCounties } from '@/stores/counties'
import propertySubmissionService from '@/services/propertySubmissionService'
import contactMessageService from '@/services/contactMessageService'

const rows = ref([])
const loading = ref(true)
const loadError = ref('')
const heroRef = ref(null)
const heroInnerRef = ref(null)
const statsRef = ref(null)
const toolbarRef = ref(null)
const tableRef = ref(null)
const emptyRef = ref(null)
const messagesRef = ref(null)

// Maps the API's snake_case submission shape onto what the template expects.
function mapSubmission(s) {
  return {
    id: s.id,
    type: s.type,
    listingType: s.listing_type, // 'sale' | 'rent' — seller's intent, distinct from `type`
    fullName: s.full_name,
    email: s.email,
    phone: s.phone,
    priceRange: s.price_range,
    location: s.location,
    status: s.status,
    photo: s.photo_url,
    submittedAt: s.created_at ? s.created_at.slice(0, 10) : ''
  }
}

async function loadRows() {
  loading.value = true
  loadError.value = ''
  try {
    const { data } = await propertySubmissionService.getAll()
    // Laravel's paginate() wraps results in a `data` key.
    rows.value = (data.data || data).map(mapSubmission)
  } catch (e) {
    loadError.value = 'Could not load submissions. Please refresh and try again.'
  } finally {
    loading.value = false
    // The watch(filteredRows, ...) below handles animating rows in once
    // they arrive. We only need to handle the empty-state fade here.
    nextTick(() => {
      if (!filteredRows.value.length && emptyRef.value) {
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

// "Feature" — publishes the submission to Buy/Rent.
async function handleFeature(id) {
  const row = rows.value.find((r) => r.id === id)
  if (!row) return
  loadError.value = ''
  try {
    await propertySubmissionService.feature(id)
    row.status = 'featured'
    animateStatusPulse(id)
  } catch (e) {
    loadError.value = 'Could not feature this submission. Please try again.'
  }
}

// "Unfeature" — pulls it back to pending for re-review.
async function handleUnfeature(id) {
  const row = rows.value.find((r) => r.id === id)
  if (!row) return
  loadError.value = ''
  try {
    await propertySubmissionService.unfeature(id)
    row.status = 'pending'
    animateStatusPulse(id)
  } catch (e) {
    loadError.value = 'Could not unfeature this submission. Please try again.'
  }
}

// "Delete" — soft delete: marks it rejected, keeps the record for history.
async function handleReject(id) {
  const row = rows.value.find((r) => r.id === id)
  if (!row) return
  loadError.value = ''
  try {
    await propertySubmissionService.reject(id)
    row.status = 'rejected'
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
  } catch (e) {
    loadError.value = 'Could not reject this submission. Please try again.'
  }
}

const filters = ['All', 'Featured', 'Pending', 'Rejected']
const activeFilter = ref('All')

// Listing-type filter — orthogonal to the status filter above (see the
// comment in the template). 'All' means don't filter by it at all.
const listingFilters = ['All', 'Sell', 'Rent']
const activeListingFilter = ref('All')

const searchQuery = ref('')

const filteredRows = computed(() => {
  let result = rows.value

  if (activeFilter.value === 'Featured') {
    result = result.filter((r) => r.status === 'featured')
  } else if (activeFilter.value === 'Pending') {
    result = result.filter((r) => r.status === 'pending')
  } else if (activeFilter.value === 'Rejected') {
    result = result.filter((r) => r.status === 'rejected')
  }

  if (activeListingFilter.value === 'Sell') {
    result = result.filter((r) => r.listingType === 'sale')
  } else if (activeListingFilter.value === 'Rent') {
    result = result.filter((r) => r.listingType === 'rent')
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
      row.listingType === 'rent' ? 'rent' : 'sell',
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

// --- Contact messages --------------------------------------------------
const messages = ref([])
const messagesLoading = ref(true)
const messagesError = ref('')
const messagesTableRef = ref(null)

function mapMessage(m) {
  return {
    id: m.id,
    senderName: m.sender?.name || 'Unknown',
    senderEmail: m.sender?.email || '',
    message: m.message,
    // Full back-and-forth thread — both the admin's replies and any
    // follow-ups from the sender, oldest first (matches the backend's
    // `replies()` ordering). Each entry: { id, body, isAdmin, authorName, createdAt }.
    replies: (m.replies || []).map((r) => ({
      id: r.id,
      body: r.body,
      isAdmin: !!r.is_admin,
      authorName: r.user?.name || (r.is_admin ? 'Support' : 'Unknown'),
      createdAt: r.created_at ? r.created_at.slice(0, 10) : ''
    })),
    status: m.status,
    createdAt: m.created_at ? m.created_at.slice(0, 10) : ''
  }
}

async function loadMessages() {
  messagesLoading.value = true
  messagesError.value = ''
  try {
    const { data } = await contactMessageService.getAll()
    messages.value = (data.data || data).map(mapMessage)
  } catch (e) {
    messagesError.value = 'Could not load messages. Please refresh and try again.'
  } finally {
    messagesLoading.value = false
  }
}

async function handleMarkRead(id) {
  const msg = messages.value.find((m) => m.id === id)
  if (!msg) return
  messagesError.value = ''
  try {
    await contactMessageService.markRead(id)
    msg.status = 'read'
  } catch (e) {
    messagesError.value = 'Could not mark this message as read. Please try again.'
  }
}

async function handleResolve(id) {
  const msg = messages.value.find((m) => m.id === id)
  if (!msg) return
  messagesError.value = ''
  try {
    await contactMessageService.resolve(id)
    msg.status = 'resolved'
  } catch (e) {
    messagesError.value = 'Could not resolve this message. Please try again.'
  }
}

// --- Reply modal ---------------------------------------------------------
// replyTarget holds the *mapped* message object (not just an id) so the
// modal can show the sender's name/original text without re-finding it.
const replyTarget = ref(null)
const replyText = ref('')
const replySending = ref(false)
const replyError = ref('')

function openReplyModal(msg) {
  replyTarget.value = msg
  replyText.value = ''
  replyError.value = ''
}

function closeReplyModal() {
  if (replySending.value) return // don't let a backdrop click cancel mid-send
  replyTarget.value = null
  replyText.value = ''
  replyError.value = ''
}

async function submitReply() {
  if (!replyTarget.value) return

  const text = replyText.value.trim()
  if (text.length < 2) {
    replyError.value = 'Please write a reply before sending.'
    return
  }

  replySending.value = true
  replyError.value = ''

  try {
    const { data } = await contactMessageService.reply(replyTarget.value.id, text)

    const msg = messages.value.find((m) => m.id === replyTarget.value.id)
    if (msg) {
      // Trust the server's copy of the thread rather than guessing the new
      // reply's id/author/timestamp client-side.
      msg.replies = (data.contact_message?.replies || []).map((r) => ({
        id: r.id,
        body: r.body,
        isAdmin: !!r.is_admin,
        authorName: r.user?.name || (r.is_admin ? 'Support' : 'Unknown'),
        createdAt: r.created_at ? r.created_at.slice(0, 10) : ''
      }))
      if (msg.status !== 'resolved') msg.status = 'replied'
    }

    replyTarget.value = null
    replyText.value = ''
  } catch (e) {
    replyError.value = e.response?.data?.message
      || 'Could not send this reply. Please try again.'
  } finally {
    replySending.value = false
  }
}

const messageFilters = ['All', 'New', 'Read', 'Replied', 'Resolved']
const activeMessageFilter = ref('All')
const messageSearchQuery = ref('')

const filteredMessages = computed(() => {
  let result = messages.value

  if (activeMessageFilter.value !== 'All') {
    result = result.filter((m) => m.status === activeMessageFilter.value.toLowerCase())
  }

  const query = messageSearchQuery.value.trim().toLowerCase()
  if (!query) return result

  return result.filter((m) => {
    const haystack = [
      m.senderName,
      m.senderEmail,
      m.message,
      ...m.replies.map((r) => r.body),
      m.status
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(query)
  })
})

const newMessagesCount = computed(() => messages.value.filter((m) => m.status === 'new').length)

// --- Manage counties -------------------------------------------------
// Pulling a county down here hides it from the LocationDropdown used on
// the Home, Categories, Buy and Rent pages (see src/stores/counties.js).
// It stays in the master list and can be restored at any time.
const {
  allCounties,
  activeCounties,
  hiddenCounties,
  isHidden,
  hideCounty,
  restoreCounty,
  fetchCounties,
  countiesLoading,
  countiesError
} = useCounties()

const countiesRef = ref(null)
const countyQuery = ref('')
const countyFilters = ['All', 'Active', 'Pulled down']
const activeCountyFilter = ref('All')
const countyActionError = ref('')

// "Pull down" — hides the county from the public dropdowns.
async function handlePullDown(county) {
  countyActionError.value = ''
  try {
    await hideCounty(county)
  } catch (e) {
    countyActionError.value = `Could not pull down ${county}. Please try again.`
  }
}

// "Restore" — brings a pulled-down county back into the public dropdowns.
async function handleRestore(county) {
  countyActionError.value = ''
  try {
    await restoreCounty(county)
  } catch (e) {
    countyActionError.value = `Could not restore ${county}. Please try again.`
  }
}

const filteredCounties = computed(() => {
  let result = allCounties.value

  if (activeCountyFilter.value === 'Active') {
    result = activeCounties.value
  } else if (activeCountyFilter.value === 'Pulled down') {
    result = hiddenCounties.value
  }

  const query = countyQuery.value.trim().toLowerCase()
  if (!query) return result

  return result.filter((county) => county.toLowerCase().includes(query))
})

onMounted(() => {
  loadRows()
  loadMessages()
  fetchCounties()

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
  })
})

watch(filteredRows, () => {
  nextTick(() => {
    if (filteredRows.value.length) {
      animateRows()
    }
  })
}, { flush: 'post' })

watch(filteredMessages, () => {
  nextTick(() => {
    if (!messagesTableRef.value) return
    const rowsInTable = messagesTableRef.value.querySelectorAll('tbody tr')
    if (!rowsInTable.length) return
    animate({
      targets: rowsInTable,
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 480,
      delay: (el, i) => i * 70,
      easing: 'easeOutQuad'
    })
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

.admin__status-text {
  font-size: 13.5px;
  color: var(--bone-dim);
  margin: 0 0 16px;
}

.admin__status-text--error {
  color: #dd7f75;
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

.admin__empty-illustration {
  display: block;
  width: min(280px, 100%);
  margin: 0 auto 18px;
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

/* Listing badge (sale vs rent) — deliberately styled apart from the
   property-type badges above so the two axes never look like the same
   kind of thing at a glance. */
.badge--listing {
  font-weight: 600;
}

.badge--listing-sale {
  color: var(--brass-bright);
  border-color: rgba(209, 178, 127, 0.45);
  background: rgba(209, 178, 127, 0.12);
}

.badge--listing-rent {
  color: var(--pine-bright);
  border-color: rgba(126, 162, 127, 0.45);
  background: rgba(126, 162, 127, 0.12);
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

.status-pill--rejected {
  color: #d98b6a;
  background: rgba(217, 139, 106, 0.14);
}

.status-pill--new {
  color: var(--sky);
  background: rgba(123, 183, 214, 0.14);
}

.status-pill--read {
  color: var(--bone-dim);
  background: rgba(237, 231, 218, 0.08);
}

.status-pill--replied {
  color: var(--sky);
  background: rgba(123, 183, 214, 0.14);
}

.status-pill--resolved {
  color: var(--pine-bright);
  background: rgba(126, 162, 127, 0.14);
}

.admin__message-text {
  max-width: 360px;
  white-space: normal;
  line-height: 1.5;
}

.admin__message-thread {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(237, 231, 218, 0.15);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin__message-reply {
  margin: 0;
  font-size: 13px;
  color: var(--bone-dim);
}

.admin__message-reply--admin {
  padding-left: 10px;
  border-left: 2px solid rgba(209, 178, 127, 0.4);
}

.admin__message-reply-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--brass-bright);
  margin-bottom: 4px;
}

/* ---------- Reply modal ---------- */
.reply-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(15, 19, 24, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.reply-modal {
  width: 100%;
  max-width: 480px;
  background: var(--slate);
  border: 1px solid rgba(169, 129, 75, 0.3);
  border-radius: 6px;
  padding: 28px 26px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
}

.reply-modal h3 {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 19px;
  color: var(--bone);
  margin: 0 0 12px;
}

.reply-modal__original {
  font-size: 13px;
  line-height: 1.6;
  color: var(--bone-dim);
  background: rgba(237, 231, 218, 0.05);
  border: 1px solid rgba(237, 231, 218, 0.1);
  border-radius: 4px;
  padding: 10px 12px;
  margin: 0 0 18px;
  max-height: 100px;
  overflow-y: auto;
}

.reply-modal textarea {
  width: 100%;
  background: var(--ink);
  border: 1px solid rgba(237, 231, 218, 0.15);
  border-radius: 4px;
  color: var(--bone);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 12px 14px;
  resize: vertical;
}

.reply-modal textarea:focus {
  outline: none;
  border-color: var(--brass);
}

.reply-modal textarea:disabled {
  opacity: 0.6;
}

.reply-modal .field__error {
  margin: 10px 0 0;
  font-size: 12px;
  color: #d98b6a;
}

.reply-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

.reply-modal .btn {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.02em;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.reply-modal .btn--primary {
  background: var(--brass);
  color: var(--ink);
}
.reply-modal .btn--primary:hover:not(:disabled) { background: var(--brass-bright); }

.reply-modal .btn--ghost {
  background: transparent;
  border-color: rgba(237, 231, 218, 0.2);
  color: var(--bone-dim);
}
.reply-modal .btn--ghost:hover:not(:disabled) { color: var(--bone); border-color: var(--brass); }

.reply-modal .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.admin__messages {
  margin-top: 56px;
  padding-top: 32px;
  border-top: 1px solid rgba(237, 231, 218, 0.12);
}

.admin__counties {
  margin-top: 56px;
  padding-top: 32px;
  border-top: 1px solid rgba(237, 231, 218, 0.12);
}

.admin__counties-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.admin__counties-title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 22px;
  color: var(--bone);
  margin: 0 0 8px;
}

.admin__counties-sub {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--bone-dim);
  margin: 0;
  max-width: 480px;
}

.admin__counties-stats {
  margin-bottom: 0;
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