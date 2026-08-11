<template>
  <div class="buy-page">
    <section class="buy-hero">
      <span class="buy-hero__scrim"></span>
      <div class="buy-hero__inner">
        <p class="buy-hero__eyebrow">For Sale</p>
        <h1 class="buy-hero__title">Find a property to buy</h1>
        <p class="buy-hero__sub">
          Land, houses, apartments and commercial premises from owners and agents
          across Nairobi — reviewed before they go live.
        </p>
      </div>
    </section>

    <div class="buy-toolbar-wrap">
      <div class="buy-toolbar">
        <div class="buy-toolbar__search">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M11.5 11.5L15 15" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          <LocationDropdown 
            v-model="query"
            :label="false"
            placeholder="Search by county…"
            input-id="buypage-location"
          />
        </div>

        <div class="buy-toolbar__type">
          <PropertyTypeDropdown
            v-model="selectedType"
            label="Type"
            input-id="buypage-type"
            include-all-option
            all-option-label="All"
            :exclude-types="['Rentals']"
          />
        </div>
      </div>
    </div>

    <section class="buy-body">
      <div class="buy-body__head">
        <h2>{{ listings.length }} {{ listings.length === 1 ? 'property' : 'properties' }} for sale</h2>
      </div>

      <div class="buy-grid" v-if="listings.length">
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

      <div class="buy-empty" v-else>
        <img
          class="empty-illustration"
          src="/images/Processing-bro.svg"
          alt="No properties available"
        />
        <p class="buy-empty__title">No matching properties yet</p>
        <p class="buy-empty__sub">
          Try a different search or category, or check back soon — new listings are
          reviewed and featured regularly.
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

const fallbackImage = '/images/Picture2.jpg'

const query = ref('')
// '' = All types. The Buy page only ever shows "for sale" listings, so
// Rentals is excluded from the dropdown entirely (see :exclude-types above).
const selectedType = ref('')

const allSubmissions = ref([])

onMounted(async () => {
  try {
    const { data } = await propertySubmissionService.getFeatured()
    // API already only returns status === 'featured'; map field names to
    // what the template expects (fullName, priceRange, photo).
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
    // Leave allSubmissions empty — the existing "no listings" empty
    // state in the template already covers this case.
  }
})

const listings = computed(() => {
  const q = query.value.trim().toLowerCase()

  return allSubmissions.value.filter((s) => {
    if (s.type === 'Rentals') return false
    if (selectedType.value && s.type !== selectedType.value) return false
    if (q && !s.location.toLowerCase().includes(q)) return false
    return true
  })
})
</script>

<style scoped>
.buy-page {
  background: var(--ink);
  min-height: 100vh;
}

.buy-hero {
  position: relative;
  height: clamp(320px, 46vh, 460px);
  background-image: url('/images/Picture2.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
}

.buy-hero__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 19, 24, 0.5) 0%, rgba(15, 19, 24, 0.5) 45%, rgba(15, 19, 24, 0.97) 100%);
}

.buy-hero__inner {
  position: relative;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 var(--gutter) 78px;
}

.buy-hero__eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brass-bright);
  margin: 0 0 10px;
}

.buy-hero__title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(34px, 5vw, 56px);
  color: var(--bone);
  margin: 0 0 14px;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.5);
}

.buy-hero__sub {
  max-width: 520px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--bone-dim);
  margin: 0;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
}

/* Floating toolbar, same convention as the homepage search strip */
.buy-toolbar-wrap {
  position: relative;
  z-index: 10;
  margin: 0 var(--gutter);
  transform: translateY(-46px);
}

.buy-toolbar {
  max-width: 1000px;
  margin: 0 auto;
  background: var(--slate);
  border: 1px solid rgba(169, 129, 75, 0.3);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
}

.buy-toolbar__search {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--bone-dim);
  flex: 1 1 220px;
  border-right: 1px solid rgba(237, 231, 218, 0.1);
  padding-right: 16px;
}

.buy-toolbar__search input {
  flex: 1;
  background: none;
  border: none;
  color: var(--bone);
  font-family: var(--font-body);
  font-size: 14px;
}

.buy-toolbar__search input::placeholder { color: rgba(237, 231, 218, 0.35); }
.buy-toolbar__search input:focus { outline: none; }

.buy-toolbar__type {
  flex: 0 1 220px;
  min-width: 160px;
}

.buy-body {
  max-width: 1320px;
  margin: 0 auto;
  padding: 20px var(--gutter) 100px;
}

.buy-body__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin: 0 0 28px;
}

.buy-body__head h2 {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 22px;
  color: var(--bone);
  margin: 0;
}

.buy-body__list-cta {
  color: var(--brass-bright);
  text-decoration: none;
  font-size: 14px;
  border: 1px solid var(--brass);
  padding: 9px 16px;
  transition: background 0.2s ease, color 0.2s ease;
}

.buy-body__list-cta:hover {
  background: var(--brass);
  color: var(--ink);
}

.buy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 22px;
}

.listing-card {
  background: var(--ink-soft);
  border:4px solid rgba(237, 231, 218, 0.2);
  border-radius: 29px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
}

.listing-card:hover {
  border-color: rgba(7, 232, 229, 0.65);
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

.buy-empty {
  text-align: center;
  padding: 64px 20px;
  border: 1px dashed rgba(237, 231, 218, 0.2);
}

.buy-empty__title {
  font-family: var(--font-display);
  font-size: 20px;
  color: var(--bone);
  margin: 0 0 10px;
}

.buy-empty__sub {
  color: var(--bone-dim);
  font-size: 14px;
  max-width: 420px;
  margin: 0 auto 22px;
}

.buy-empty__cta {
  display: inline-block;
  color: var(--ink);
  background: var(--brass);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 11px 22px;
  transition: background 0.2s ease;
}

.empty-illustration {
  display: block;
  max-width: 320px;
  width: 100%;
  margin: 0 auto 32px;
}

.buy-empty__cta:hover { background: var(--brass-bright); }

@media (max-width: 720px) {
  .buy-hero__inner { padding-bottom: 60px; }
  .buy-toolbar-wrap { margin: 0 20px; transform: none; }
  .buy-toolbar { flex-direction: column; align-items: stretch; }
  .buy-toolbar__search { border-right: none; padding-right: 0; }
  .buy-body { padding-top: 32px; }
}
</style>