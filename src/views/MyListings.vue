<template>
  <div class="my-listings">
    <section class="my-listings__hero">
      <div class="my-listings__hero-inner">
        <p class="my-listings__eyebrow">Your account</p>
        <h1 class="my-listings__title">My listings</h1>
        <p class="my-listings__sub">
          Every property you've submitted, and its current review status. Each
          listing gets up to two edit requests -- property type, description, map
          position, and phone -- reviewed by our team before they go live.
        </p>
      </div>
    </section>

    <div class="my-listings__body">
      <p v-if="loading" class="my-listings__status-text">Loading your listings…</p>
      <p v-if="loadError" class="my-listings__status-text my-listings__status-text--error">
        {{ loadError }}
      </p>

      <div v-if="successMessage" class="my-listings__status-text my-listings__status-text--success">
        {{ successMessage }}
      </div>

      <div v-if="!loading && rows.length" class="my-listings__grid">
        <div
          v-for="row in rows"
          :key="row.id"
          class="listing-row"
          :class="{ 'listing-row--featured': row.status === 'featured' && row.featured_at }"
        >
          <article class="listing-card card-surface">
            <div class="listing-card__media">
              <img v-if="row.photo_url" :src="row.photo_url" :alt="row.location" />
              <div v-else class="listing-card__media-placeholder">No photo</div>
              <span class="status-pill" :class="'status-pill--' + row.status">{{ row.status }}</span>
            </div>

            <div class="listing-card__body">
              <div class="listing-card__badges">
                <span class="badge" :class="'badge--' + row.type.toLowerCase()">{{ row.type }}</span>
                <span
                  class="badge badge--listing"
                  :class="row.listing_type === 'rent' ? 'badge--listing-rent' : 'badge--listing-sale'"
                >
                  {{ row.listing_type === 'rent' ? 'Rent' : 'Sell' }}
                </span>
              </div>

              <h2 class="listing-card__location">{{ row.location }}</h2>
              <p class="listing-card__price">{{ row.price_range }}</p>

              <p v-if="row.status === 'rejected' && row.review_note" class="listing-card__review-note">
                Admin note: {{ row.review_note }}
              </p>

              <div class="listing-card__edit-row">
                <p v-if="row.has_pending_edit_request" class="listing-card__edit-status">
                  Edit request pending review
                </p>
                <p v-else class="listing-card__edit-status">
                  {{ row.edit_requests_remaining }} of 2 edit requests remaining
                </p>

                <button
                  v-if="row.status !== 'rejected'"
                  type="button"
                  class="action action--feature"
                  @click="openEditModal(row)"
                >
                  Request edit
                </button>
              </div>
            </div>
          </article>

          <aside
            v-if="row.status === 'featured' && row.featured_at"
            class="listing-row__renewal"
            aria-label="Property renewal countdown"
          >
            <FeatureExpiryCountdown
              :featured-at="row.featured_at"
              status-label="Until renewal"
              expired-label="Renewal due"
              size="large"
            />
          </aside>
        </div>
      </div>

      <div v-else-if="!loading && !rows.length" class="my-listings__empty card-surface">
        <p>You haven't submitted any listings yet.</p>
        <RouterLink class="btn btn--primary" to="/list-property">List a property</RouterLink>
      </div>
    </div>

    <PropertyEditRequestModal
      v-if="editTarget"
      :submission="editTarget"
      @close="editTarget = null"
      @submitted="handleEditSubmitted"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import propertySubmissionService from '@/services/propertySubmissionService'
import PropertyEditRequestModal from '@/components/PropertyEditRequestModal.vue'
import FeatureExpiryCountdown from '@/components/FeatureExpiryCountdown.vue'
import { getFeaturedAt } from '@/utils/featureExpiry'

const rows = ref([])
const loading = ref(true)
const loadError = ref('')
const successMessage = ref('')
const editTarget = ref(null)

async function loadRows() {
  loading.value = true
  loadError.value = ''
  try {
    const { data } = await propertySubmissionService.getMine()
    rows.value = data.map((row) => ({
      ...row,
      featured_at: getFeaturedAt(row.id, row.status, row.featured_at)
    }))
  } catch (e) {
    loadError.value = 'Could not load your listings. Please refresh and try again.'
  } finally {
    loading.value = false
  }
}

function openEditModal(row) {
  successMessage.value = ''
  editTarget.value = row
}

function handleEditSubmitted({ submissionId, editRequestsRemaining }) {
  const row = rows.value.find((r) => r.id === submissionId)
  if (row) {
    row.has_pending_edit_request = true
    row.edit_requests_remaining = editRequestsRemaining
  }
  editTarget.value = null
  successMessage.value = 'Edit request submitted. An admin will review it shortly.'
}

onMounted(loadRows)
</script>

<style scoped>
.my-listings {
  min-height: 100vh;
  background: var(--ink);
}

.my-listings__hero {
  padding: 64px var(--gutter) 40px;
  max-width: 1320px;
  margin: 0 auto;
}

.my-listings__eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brass-bright);
  margin: 0 0 10px;
}

.my-listings__title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(28px, 4vw, 40px);
  color: var(--bone);
  margin: 0 0 12px;
}

.my-listings__sub {
  font-size: 14px;
  line-height: 1.6;
  color: var(--bone-dim);
  margin: 0;
  max-width: 560px;
}

.my-listings__body {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 var(--gutter) 80px;
}

.my-listings__status-text {
  font-size: 13.5px;
  color: var(--bone-dim);
  margin: 0 0 16px;
}
.my-listings__status-text--error { color: var(--coral); }
.my-listings__status-text--success { color: var(--pine-bright); }

.my-listings__grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.listing-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

.listing-row--featured {
  grid-template-columns: minmax(0, 400px) auto;
  align-items: center;
  justify-content: start;
}

.listing-row__renewal {
  display: flex;
  justify-content: center;
}

.listing-card {
  width: min(100%, 400px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.listing-card__media {
  position: relative;
  height: 160px;
  background: var(--ink-soft);
}

.listing-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.listing-card__media-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--bone-dim);
}

.listing-card__media .status-pill {
  position: absolute;
  top: 10px;
  right: 10px;
}

.listing-card__body {
  padding: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.listing-card__badges {
  display: flex;
  gap: 8px;
}

.listing-card__location {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 17px;
  color: var(--bone);
  margin: 2px 0 0;
}

.listing-card__price {
  font-size: 13px;
  color: var(--bone-dim);
  margin: 0;
}

.listing-card__review-note {
  font-size: 12px;
  line-height: 1.5;
  color: var(--coral);
  margin: 4px 0 0;
}

.listing-card__edit-row {
  margin-top: auto;
  padding-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-top: 1px solid rgba(237, 231, 218, 0.08);
}

.listing-card__edit-status {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.03em;
  color: var(--bone-dim);
  margin: 0;
}

.my-listings__empty {
  padding: 48px 20px;
  text-align: center;
  color: var(--bone-dim);
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* Badges + status pill + action button + btn -- same visual language as
   Admin.vue's submissions table, kept local here since <style scoped>
   doesn't cross component boundaries. */
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
.badge--flat { color: var(--sky); border-color: rgba(123, 183, 214, 0.35); background: rgba(123, 183, 214, 0.1); }
.badge--rental { color: var(--pine-bright); border-color: rgba(126, 162, 127, 0.4); background: rgba(126, 162, 127, 0.1); }
.badge--house { color: var(--brass-bright); border-color: rgba(209, 178, 127, 0.4); background: rgba(209, 178, 127, 0.1); }
.badge--land { color: var(--bone-dim); border-color: rgba(237, 231, 218, 0.2); background: rgba(237, 231, 218, 0.06); }
.badge--commercial { color: var(--sky); border-color: rgba(123, 183, 214, 0.35); background: rgba(123, 183, 214, 0.1); }
.badge--listing { font-weight: 600; }
.badge--listing-sale { color: var(--brass-bright); border-color: rgba(209, 178, 127, 0.45); background: rgba(209, 178, 127, 0.12); }
.badge--listing-rent { color: var(--pine-bright); border-color: rgba(126, 162, 127, 0.45); background: rgba(126, 162, 127, 0.12); }

.status-pill {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.05em;
  text-transform: capitalize;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(15, 19, 24, 0.75);
}
.status-pill--featured { color: var(--pine-bright); }
.status-pill--pending { color: var(--brass-bright); }
.status-pill--rejected { color: var(--coral); }

.action {
  font-family: var(--font-mono);
  font-size: 11.5px;
  letter-spacing: 0.03em;
  border: 1px solid rgba(237, 231, 218, 0.2);
  background: none;
  color: var(--bone-dim);
  padding: 7px 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
.action--feature {
  color: var(--ink);
  background: var(--brass);
  border-color: var(--brass);
}
.action--feature:hover { background: var(--brass-bright); }

.btn {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  border: 1px solid transparent;
  text-decoration: none;
  display: inline-flex;
}
.btn--primary { background: var(--brass); color: var(--ink); }
.btn--primary:hover { background: var(--brass-bright); }

@media (max-width: 720px) {
  .my-listings__hero { padding: 48px 20px 28px; }
  .my-listings__body { padding: 0 20px 60px; }
  .listing-row--featured { grid-template-columns: minmax(0, 1fr); }
}
</style>