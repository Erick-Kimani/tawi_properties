<template>
  <div class="rent-page">
    <section class="rent-hero">
      <span class="rent-hero__scrim"></span>
      <div class="rent-hero__inner">
        <p class="rent-hero__eyebrow">For Rent</p>
        <h1 class="rent-hero__title">Find a place to rent</h1>
        <p class="rent-hero__sub">
          Furnished and unfurnished homes on flexible, month-to-month leases —
          verified before they're featured.
        </p>
      </div>
    </section>

    <div class="rent-toolbar-wrap">
      <div class="rent-toolbar">
        <div class="rent-toolbar__search">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M11.5 11.5L15 15" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          <LocationDropdown 
            v-model="query"
            :label="false"
            placeholder="Search by county…"
            input-id="rentpage-location"
          />
        </div>
        <div class="rent-toolbar__type">
          <PropertyTypeDropdown
            model-value="Rentals"
            label="Type"
            input-id="rentpage-type"
            disabled
          />
        </div>
        <span class="rent-toolbar__count">
          {{ listings.length }} {{ listings.length === 1 ? 'rental' : 'rentals' }} available
        </span>
      </div>
    </div>

    <section class="rent-features">
      <div class="feature">
        <span class="feature__glyph">01</span>
        <p>Month-to-month leases — no long-term lock-in</p>
      </div>
      <div class="feature">
        <span class="feature__glyph">02</span>
        <p>Every listing reviewed by our team before it's featured</p>
      </div>
      <div class="feature">
        <span class="feature__glyph">03</span>
        <p>Enquire directly with the owner or agent — no middlemen</p>
      </div>
    </section>

    <section class="rent-body">
      <div class="rent-grid" v-if="listings.length">
        <article class="listing-card" v-for="item in listings" :key="item.id">
          <div class="listing-card__media" :style="{ backgroundImage: `url(${item.photo || fallbackImage})` }">
            <span class="listing-card__badge">{{ item.type }}</span>
          </div>
          <div class="listing-card__body">
            <p class="listing-card__price">{{ item.priceRange }}</p>
            <h3 class="listing-card__location">{{ item.location }}</h3>
            <p class="listing-card__owner">Listed by {{ item.fullName }}</p>
            <a class="listing-card__cta" :href="`mailto:${item.email}`">Enquire</a>
          </div>
        </article>
      </div>

      <div class="rent-empty" v-else>
        <img
          class="empty-illustration"
          src="/images/Processing-bro.svg"
          alt="No rentals available"
        />
        <p class="rent-empty__title">No matching rentals yet</p>
        <p class="rent-empty__sub">
          Try a different search, or check back soon — new rentals are reviewed and
          featured regularly.
        </p>
      </div>
    </section>
  </div>
</template>
<script setup>
import { computed, ref, onMounted } from 'vue'
import LocationDropdown from '../components/LocationDropdown.vue'
import PropertyTypeDropdown from '../components/PropertyTypeDropdown.vue'
import propertySubmissionService from '@/services/propertySubmissionService'

const fallbackImage = '/images/Picture6.jpg'

const query = ref('')

const allSubmissions = ref([])

onMounted(async () => {
  try {
    const { data } = await propertySubmissionService.getFeatured('Rentals')
    allSubmissions.value = data.map((s) => ({
      id: s.id,
      type: s.type,
      fullName: s.full_name,
      email: s.email,
      priceRange: s.price_range,
      location: s.location,
      photo: s.photo_url
    }))
  } catch (e) {
    // Leave allSubmissions empty — the existing "no matching rentals"
    // empty state in the template already covers this case.
  }
})

const listings = computed(() => {
  const q = query.value.trim().toLowerCase()

  return allSubmissions.value.filter((s) => {
    if (q && !s.location.toLowerCase().includes(q)) return false
    return true
  })
})
</script>
<style scoped>
.rent-page {
  background: var(--ink);
  min-height: 100vh;
}

.rent-hero {
  position: relative;
  height: clamp(320px, 46vh, 460px);
  background-image: url('/images/Picture6.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
}

.rent-hero__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 19, 24, 0.5) 0%, rgba(15, 19, 24, 0.5) 45%, rgba(15, 19, 24, 0.97) 100%);
}

.rent-hero__inner {
  position: relative;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 var(--gutter) 78px;
}

.rent-hero__eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brass-bright);
  margin: 0 0 10px;
}

.rent-hero__title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(34px, 5vw, 56px);
  color: var(--bone);
  margin: 0 0 14px;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.5);
}

.rent-hero__sub {
  max-width: 520px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--bone-dim);
  margin: 0;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
}

.rent-toolbar-wrap {
  position: relative;
  z-index: 10;
  margin: 0 var(--gutter);
  transform: translateY(-46px);
}

.rent-toolbar {
  max-width: 760px;
  margin: 0 auto;
  background: var(--slate);
  border: 1px solid rgba(169, 129, 75, 0.3);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
}

.rent-toolbar__search {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--bone-dim);
  flex: 1 1 220px;
}

.rent-toolbar__search input {
  flex: 1;
  background: none;
  border: none;
  color: var(--bone);
  font-family: var(--font-body);
  font-size: 14px;
}

.rent-toolbar__search input::placeholder { color: rgba(237, 231, 218, 0.35); }
.rent-toolbar__search input:focus { outline: none; }

.rent-toolbar__type {
  flex: 0 1 200px;
  min-width: 150px;
}

.rent-toolbar__count {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--brass-bright);
  white-space: nowrap;
}

.rent-features {
  max-width: 1320px;
  margin: 0 auto;
  padding: 8px var(--gutter) 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.feature {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px;
  border: 1px solid rgba(237, 231, 218, 0.1);
  background: var(--ink-soft);
}

.feature__glyph {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--brass-bright);
  border: 1px solid rgba(169, 129, 75, 0.4);
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature p {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--bone-dim);
}

.rent-body {
  max-width: 1320px;
  margin: 0 auto;
  padding: 40px var(--gutter) 100px;
}

.rent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 22px;
}

.listing-card {
  background: var(--ink-soft);
  border: 4px solid rgba(237, 231, 218, 0.2);
  border-radius: 29px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
}

.listing-card:hover {
  border-color: rgba(5, 238, 246, 0.65);
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.3);
}

.listing-card__media {
  position: relative;
  height: 190px;
  background-size: cover;
  background-position: center;
}

.listing-card__badge {
  position: absolute;
  top: 12px;
  left: 12px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--bone);
  padding: 4px 9px;
  border: 1px solid rgba(237, 231, 218, 0.35);
  background: rgba(20, 23, 28, 0.55);
}

.listing-card__body {
  padding: 18px 20px 22px;
}

.listing-card__price {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--brass-bright);
  margin: 0 0 8px;
}

.listing-card__location {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 18px;
  color: var(--bone);
  margin: 0 0 6px;
}

.listing-card__owner {
  font-size: 13px;
  color: var(--bone-dim);
  margin: 0 0 16px;
}

.listing-card__cta {
  display: inline-block;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  background: var(--brass);
  padding: 9px 16px;
  text-decoration: none;
  transition: background 0.2s ease;
}

.listing-card__cta:hover { background: var(--brass-bright); }

.rent-empty {
  text-align: center;
  padding: 64px 20px;
  border: 1px dashed rgba(237, 231, 218, 0.2);
}

.rent-empty__title {
  font-family: var(--font-display);
  font-size: 20px;
  color: var(--bone);
  margin: 0 0 10px;
}

.empty-illustration {
  display: block;
  max-width: 320px;
  width: 100%;
  margin: 0 auto 32px;
}

.rent-empty__sub {
  color: var(--bone-dim);
  font-size: 14px;
  max-width: 420px;
  margin: 0 auto 22px;
}

.rent-empty__cta {
  display: inline-block;
  color: var(--ink);
  background: var(--brass);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 11px 22px;
  transition: background 0.2s ease;
}

.rent-empty__cta:hover { background: var(--brass-bright); }

@media (max-width: 860px) {
  .rent-features { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .rent-hero__inner { padding-bottom: 60px; }
  .rent-toolbar-wrap { margin: 0 20px; transform: none; }
  .rent-body { padding-top: 32px; }
}
</style>