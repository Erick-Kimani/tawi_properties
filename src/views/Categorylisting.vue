<template>
  <div class="cat-page" v-if="category">
    <section class="cat-hero" :style="{ backgroundImage: `url(${category.image})` }">
      <span class="cat-hero__scrim"></span>
      <div class="cat-hero__inner">
        <nav class="cat-hero__crumb">
          <RouterLink to="/">Home</RouterLink>
          <span>/</span>
          <span>{{ category.title }}</span>
        </nav>
        <p class="cat-hero__eyebrow">{{ category.eyebrow }}</p>
        <h1 class="cat-hero__title">{{ category.title }}</h1>
        <p class="cat-hero__sub">{{ category.description }}</p>
      </div>
    </section>

    <section class="cat-body">
      <div class="cat-body__head">
        <h2>{{ listings.length }} {{ listings.length === 1 ? 'listing' : 'listings' }}</h2>
      </div>

      <div class="cat-grid" v-if="listings.length">
        <article class="listing-card" v-for="item in listings" :key="item.id">
          <div class="listing-card__media" :style="{ backgroundImage: `url(${item.photo || category.image})` }">
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

      <div class="cat-empty" v-else>
        <img
          class="empty-illustration"
          src="/images/Processing-bro.svg"
          :alt="`No ${category.title.toLowerCase()} listings available`"
        />
        <p class="cat-empty__title">No {{ category.title.toLowerCase() }} listings yet</p>
        <p class="cat-empty__sub">New properties are reviewed and featured regularly — check back soon, or be the first to list one.</p>
      </div>
    </section>
  </div>

  <div class="cat-page cat-page--missing" v-else>
    <p>We couldn't find that category.</p>
    <RouterLink to="/">Back home</RouterLink>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getCategoryBySlug } from '../stores/Categories.js'

const STORAGE_KEY = 'tawi_admin_feature_requests'

const route = useRoute()
const category = computed(() => getCategoryBySlug(route.params.slug))

const listings = computed(() => {
  if (!category.value) return []
  let submissions = []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    submissions = raw ? JSON.parse(raw) : []
  } catch (e) {
    submissions = []
  }
  return submissions.filter(
    (s) => category.value.types.includes(s.type) && s.status === 'featured'
  )
})
</script>

<style scoped>
.cat-page {
  background: var(--ink);
  min-height: 100vh;
}

.cat-page--missing {
  padding: 160px var(--gutter) 80px;
  text-align: center;
  color: var(--bone-dim);
}

.cat-page--missing a {
  color: var(--brass-bright);
}

.cat-hero {
  position: relative;
  height: clamp(320px, 46vh, 460px);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
}

.cat-hero__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 19, 24, 0.55) 0%, rgba(15, 19, 24, 0.5) 40%, rgba(15, 19, 24, 0.96) 100%);
}

.cat-hero__inner {
  position: relative;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 var(--gutter) 44px;
}

.cat-hero__crumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--bone-dim);
  margin: 0 0 18px;
}

.cat-hero__crumb a {
  color: var(--bone-dim);
  text-decoration: none;
}

.cat-hero__crumb a:hover { color: var(--brass-bright); }

.cat-hero__eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brass-bright);
  margin: 0 0 10px;
}

.cat-hero__title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(34px, 5vw, 56px);
  color: var(--bone);
  margin: 0 0 14px;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.5);
}

.cat-hero__sub {
  max-width: 520px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--bone-dim);
  margin: 0;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
}

.cat-body {
  max-width: 1320px;
  margin: 0 auto;
  padding: 48px var(--gutter) 100px;
}

.cat-body__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin: 0 0 28px;
}

.cat-body__head h2 {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 22px;
  color: var(--bone);
  margin: 0;
}

.cat-body__list-cta {
  color: var(--brass-bright);
  text-decoration: none;
  font-size: 14px;
  border: 1px solid var(--brass);
  padding: 9px 16px;
  transition: background 0.2s ease, color 0.2s ease;
}

.cat-body__list-cta:hover {
  background: var(--brass);
  color: var(--ink);
}

.cat-grid {
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
  border-color: rgba(3, 227, 247, 0.65);
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

.cat-empty {
  text-align: center;
  padding: 64px 20px;
  border: 1px dashed rgba(237, 231, 218, 0.2);
}

.cat-empty__title {
  font-family: var(--font-display);
  font-size: 20px;
  color: var(--bone);
  margin: 0 0 10px;
}

.cat-empty__sub {
  color: var(--bone-dim);
  font-size: 14px;
  max-width: 420px;
  margin: 0 auto 22px;
}

.cat-empty__cta {
  display: inline-block;
  color: var(--ink);
  background: var(--brass);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 11px 22px;
  transition: background 0.2s ease;
}

.cat-empty__cta:hover { background: var(--brass-bright); }

.empty-illustration {
  display: block;
  max-width: 320px;
  width: 100%;
  margin: 0 auto 32px;
}

@media (max-width: 720px) {
  .cat-hero__inner { padding-bottom: 32px; }
}
</style>