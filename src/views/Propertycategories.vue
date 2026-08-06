<template>
  <section class="categories">
    <div class="categories__head">
      <p class="categories__eyebrow">Browse by category</p>
      <h2 class="categories__title">What are you looking for?</h2>
      <p class="categories__sub">
        From half-acre plots to city-centre offices — every listing on Tawi Properties
        falls into one of four categories.
      </p>
    </div>

    <div class="categories__grid">
      <RouterLink
        v-for="cat in categories"
        :key="cat.slug"
        class="cat-card"
        :to="`/category/${cat.slug}`"
        :style="{ backgroundImage: `url(${cat.image})` }"
      >
        <span class="cat-card__scrim"></span>
        <span class="cat-card__eyebrow">{{ cat.eyebrow }}</span>
        <span class="cat-card__body">
          <span class="cat-card__title">{{ cat.title }}</span>
          <span class="cat-card__tagline">{{ cat.tagline }}</span>
        </span>
        <span class="cat-card__cta">
          Explore
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 7H13M13 7L7.5 1.5M13 7L7.5 12.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </RouterLink>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { categories } from '../stores/Categories.js'
</script>

<style scoped>
.categories {
  position: relative;
  z-index: 5;
  max-width: 1320px;
  margin: 0 auto;
  padding: 88px var(--gutter) 40px;
}

.categories__head {
  max-width: 560px;
  margin: 0 0 40px;
}

.categories__eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brass-bright);
  margin: 0 0 12px;
}

.categories__title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(26px, 3.4vw, 38px);
  color: var(--bone);
  margin: 0 0 14px;
}

.categories__sub {
  font-size: 15px;
  line-height: 1.65;
  color: var(--bone-dim);
  margin: 0;
}

.categories__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.cat-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 380px;
  padding: 22px;
  text-decoration: none;
  background-color: var(--ink-soft);
  background-size: cover;
  background-position: center;
  overflow: hidden;
  border-radius: 24px;
  border: 2px solid rgba(237, 231, 218, 0.22);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.24);
  transition: border-color 0.25s ease, transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease;
}

.cat-card:hover {
  border-color: rgba(209, 178, 127, 0.65);
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.34);
  filter: saturate(1.08);
}

.cat-card__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 19, 24, 0.05) 0%, rgba(15, 19, 24, 0.35) 45%, rgba(15, 19, 24, 0.92) 100%);
  transition: background 0.3s ease, transform 0.3s ease;
}

.cat-card:hover .cat-card__scrim {
  background: linear-gradient(180deg, rgba(15, 19, 24, 0.06) 0%, rgba(15, 19, 24, 0.42) 45%, rgba(15, 19, 24, 0.96) 100%);
  transform: scale(1.02);
}

.cat-card__eyebrow {
  position: relative;
  align-self: flex-start;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--bone);
  padding: 4px 9px;
  border: 1px solid rgba(237, 231, 218, 0.35);
  background: rgba(20, 23, 28, 0.45);
}

.cat-card__body {
  position: relative;
  margin-top: auto;
  padding-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cat-card__title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 24px;
  line-height: 1.15;
  color: var(--bone);
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.55);
}

.cat-card__tagline {
  font-family: var(--font-mono);
  font-size: 11.5px;
  letter-spacing: 0.04em;
  color: var(--bone-dim);
}

.cat-card__cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--brass-bright);
}

.cat-card__cta svg {
  transition: transform 0.25s ease;
}

.cat-card:hover .cat-card__cta svg {
  transform: translateX(4px);
}

@media (max-width: 1080px) {
  .categories__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 560px) {
  .categories { padding: 64px 20px 24px; }
  .categories__grid { grid-template-columns: 1fr; }
  .cat-card { height: 220px; }
}
</style>