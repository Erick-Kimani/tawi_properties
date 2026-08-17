<template>
  <div class="home">
    <PropertyHero />

    <section class="search-strip">
      <div class="search-strip__inner">
        <div class="field">
          <LocationDropdown 
            v-model="searchFilters.location"
            label="Location"
            placeholder="Choose a county..."
            input-id="homepage-location"
          />
        </div>
        <div class="field">
          <label id="home-intent-label">I want to</label>
          <div class="intent-toggle" role="radiogroup" aria-labelledby="home-intent-label">
            <button
              type="button"
              class="intent-toggle__option"
              :class="{ 'intent-toggle__option--active': searchFilters.intent === 'sale' }"
              role="radio"
              :aria-checked="searchFilters.intent === 'sale'"
              @click="searchFilters.intent = 'sale'"
            >
              Buy
            </button>
            <button
              type="button"
              class="intent-toggle__option"
              :class="{ 'intent-toggle__option--active': searchFilters.intent === 'rent' }"
              role="radio"
              :aria-checked="searchFilters.intent === 'rent'"
              @click="searchFilters.intent = 'rent'"
            >
              Rent
            </button>
          </div>
        </div>
        <div class="field">
          <PropertyTypeDropdown
            v-model="searchFilters.type"
            label="Type"
            input-id="homepage-type"
            include-all-option
            all-option-label="All types"
          />
        </div>
        <button class="search-strip__submit" @click="handleSearch">Search</button>
      </div>
    </section>

    <PropertyCategories />
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import PropertyHero from '../components/PropertyHero.vue'
import PropertyCategories from './Propertycategories.vue'
import LocationDropdown from '../components/LocationDropdown.vue'
import PropertyTypeDropdown from '../components/PropertyTypeDropdown.vue'

const router = useRouter()

const searchFilters = reactive({
  location: '',
  // 'sale' | 'rent' — decides whether Search sends them to /buy or /rent.
  // 'sale' by default since Buy is the more common first click.
  intent: 'sale',
  type: ''
})

function handleSearch() {
  // Location and type are real filters both Buypage.vue/Rentpage.vue
  // read from the URL on mount (see their onMounted) — location seeds
  // LocationDropdown's selected county, type seeds the property-type
  // dropdown. Intent itself isn't a query param — it's what decides
  // which of the two pages to send them to in the first place.
  const query = new URLSearchParams()
  if (searchFilters.location) query.set('location', searchFilters.location)
  if (searchFilters.type) query.set('type', searchFilters.type)

  const destination = searchFilters.intent === 'rent' ? '/rent' : '/buy'
  const queryString = query.toString()
  router.push(queryString ? `${destination}?${queryString}` : destination)
}
</script>

<style scoped>
.home {
  background: var(--ink);
  min-height: 100vh;
}

.search-strip {
  position: relative;
  z-index: 20;
  margin: 0 var(--gutter);
  transform: translateY(-50px);
}

.search-strip__inner {
  background: var(--slate);
  border: 1px solid rgba(169, 129, 75, 0.3);
  border-radius: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
  max-width: 1000px;
  margin: 0 auto;
}

.field {
  flex: 1 1 200px;
  padding: 14px 20px;
  border-right: 1px solid rgba(237, 231, 218, 0.08);
}

/* Round just the outer corners that actually sit on the container's
   edge — NOT overflow: hidden on .search-strip__inner, which would also
   clip LocationDropdown's absolutely-positioned results popup (it needs
   to extend past this bar's bottom edge to show its list). */
.field:first-child {
  border-top-left-radius: 14px;
  border-bottom-left-radius: 14px;
}

.field label {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--bone-dim);
  margin-bottom: 6px;
}

.field input {
  width: 100%;
  background: none;
  border: none;
  color: var(--bone);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 0;
}

.field input::placeholder { color: rgba(237, 231, 218, 0.35); }
.field input:focus { outline: none; }

.intent-toggle {
  display: flex;
  gap: 8px;
}

.intent-toggle__option {
  flex: 1;
  background: none;
  border: 1px solid rgba(237, 231, 218, 0.15);
  border-radius: 4px;
  color: var(--bone-dim);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  padding: 6px 10px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.intent-toggle__option:hover {
  border-color: rgba(169, 129, 75, 0.5);
  color: var(--bone);
}

.intent-toggle__option--active {
  background: var(--brass);
  border-color: var(--brass);
  color: var(--ink);
}

.search-strip__submit {
  flex: 0 0 auto;
  background: var(--brass);
  color: var(--ink);
  border: none;
  border-top-right-radius: 14px;
  border-bottom-right-radius: 14px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  padding: 0 32px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.search-strip__submit:hover { background: var(--brass-bright); }

@media (max-width: 720px) {
  .search-strip { transform: none; margin: 24px 20px 0; }
  .field { border-right: none; border-bottom: 1px solid rgba(237, 231, 218, 0.08); }
  /* Stacked layout: the first field is now the top edge of the column
     (not the left edge), and the submit button is the bottom edge — so
     which corners get rounded flips from the desktop side-by-side rule
     above. */
  .field:first-child {
    border-radius: 0;
    border-top-left-radius: 14px;
    border-top-right-radius: 14px;
  }
  .search-strip__submit {
    width: 100%;
    padding: 16px;
    border-radius: 0;
    border-bottom-left-radius: 14px;
    border-bottom-right-radius: 14px;
  }
  }
</style>