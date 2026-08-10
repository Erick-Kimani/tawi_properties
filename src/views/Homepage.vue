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
          <label>Price range</label>
          <input v-model="searchFilters.priceRange" type="text" placeholder="KES ....." />
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
  priceRange: '',
  type: ''
})

function handleSearch() {
  // Pass search filters to category listing or use for API call
  const query = new URLSearchParams({
    location: searchFilters.location,
    priceRange: searchFilters.priceRange,
    type: searchFilters.type
  })
  
  router.push(`/buy?${query.toString()}`)
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

.search-strip__submit {
  flex: 0 0 auto;
  background: var(--brass);
  color: var(--ink);
  border: none;
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
  .search-strip__submit { width: 100%; padding: 16px; }
  }
</style>