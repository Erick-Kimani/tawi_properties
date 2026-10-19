<template>
  <article class="legal">
    <div class="legal__inner">
      <!-- Cross-links between the three legal pages. Real links (not
           buttons) so each page has its own address that can be shared,
           bookmarked and read by anyone, signed in or not. -->
      <nav class="legal__tabs" aria-label="Legal documents">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="legal__tab"
          :class="{ 'legal__tab--active': tab.key === current }"
          :aria-current="tab.key === current ? 'page' : undefined"
        >
          {{ tab.label }}
        </RouterLink>
      </nav>

      <header class="legal__head">
        <p class="legal__eyebrow">{{ doc.eyebrow }}</p>
        <h1 class="legal__title">{{ doc.title }}</h1>
        <p class="legal__meta">
          Version {{ doc.version }} &middot; in effect from {{ effectiveDate }}
        </p>
      </header>

      <p class="legal__summary">{{ doc.summary }}</p>

      <nav class="legal__toc" aria-label="On this page">
        <p class="legal__toc-label">On this page</p>
        <ol>
          <li v-for="section in sections" :key="section.id">
            <a :href="`#${section.id}`" @click.prevent="scrollToSection(section.id)">
              {{ section.heading }}
            </a>
          </li>
        </ol>
      </nav>

      <section
        v-for="section in sections"
        :id="section.id"
        :key="section.id"
        class="legal__section"
      >
        <h2>{{ section.heading }}</h2>
        <p v-for="(para, i) in section.paragraphs" :key="`p-${i}`">{{ para }}</p>
        <ul v-if="section.points">
          <li v-for="(point, i) in section.points" :key="`li-${i}`">{{ point }}</li>
        </ul>
        <p v-if="section.affirm" class="legal__affirm">{{ section.affirm }}</p>
      </section>

      <!-- Page-specific closing content, e.g. "you'll be asked to accept
           these when you sign up". -->
      <div class="legal__after">
        <slot name="after" />
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  // One document in the shape used by src/data/terms.js and
  // src/data/privacy.js: { eyebrow, title, summary, version, sections }.
  doc: { type: Object, required: true },
  effectiveDate: { type: String, required: true },
  // Which tab to highlight: 'general' | 'seller' | 'privacy'.
  current: { type: String, required: true }
})

const tabs = [
  { key: 'general', label: 'Buyer & tenant terms', to: '/terms/buyers' },
  { key: 'seller', label: 'Seller terms', to: '/terms/sellers' },
  { key: 'privacy', label: 'Privacy policy', to: '/privacy' }
]

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Anchor ids come from the headings, so adding or renaming a section in the
// data files needs no change here.
const sections = computed(() =>
  props.doc.sections.map((section) => ({ ...section, id: slugify(section.heading) }))
)

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (!el) return
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  // Move focus too, so keyboard and screen-reader users land in the section.
  el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}
</script>

<style scoped>
.legal {
  /* The navbar is fixed, so clear it. */
  padding: calc(var(--nav-h, 64px) + 48px) var(--gutter) 80px;
  color: var(--bone);
}

.legal__inner {
  max-width: 760px;
  margin: 0 auto;
}

/* ---------- tabs ---------- */
.legal__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 36px;
}

.legal__tab {
  padding: 8px 16px;
  border: 1px solid rgba(237, 231, 218, 0.22);
  border-radius: 999px;
  font-size: 13px;
  color: var(--bone-dim);
  text-decoration: none;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.legal__tab:hover {
  color: var(--bone);
  border-color: var(--brass);
}

.legal__tab:focus-visible {
  outline: 2px solid var(--brass-bright);
  outline-offset: 2px;
}

.legal__tab--active {
  color: var(--ink);
  background: var(--brass);
  border-color: var(--brass);
  font-weight: 600;
}

.legal__tab--active:hover {
  color: var(--ink);
  background: var(--brass-bright);
}

/* ---------- header ---------- */
.legal__eyebrow {
  margin: 0 0 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brass-bright);
}

.legal__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(30px, 5vw, 44px);
  line-height: 1.15;
  color: var(--bone);
}

.legal__meta {
  margin: 12px 0 0;
  font-family: var(--font-mono);
  font-size: 11px;
  color: rgba(216, 207, 195, 0.65);
}

.legal__summary {
  margin: 28px 0 0;
  padding: 14px 18px;
  border-left: 2px solid var(--brass);
  background: rgba(176, 142, 91, 0.08);
  font-size: 15px;
  line-height: 1.7;
  color: var(--bone);
}

/* ---------- table of contents ---------- */
.legal__toc {
  margin: 32px 0 8px;
  padding: 18px 22px;
  border: 1px solid rgba(237, 231, 218, 0.12);
  border-radius: var(--radius-sm);
  background: rgba(30, 40, 52, 0.6);
}

.legal__toc-label {
  margin: 0 0 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brass-bright);
}

.legal__toc ol {
  margin: 0;
  padding-left: 20px;
  columns: 2;
  column-gap: 32px;
}

.legal__toc li {
  break-inside: avoid;
  margin-bottom: 6px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--bone-dim);
}

.legal__toc a {
  color: var(--bone-dim);
  text-decoration: none;
}

.legal__toc a:hover,
.legal__toc a:focus-visible {
  color: var(--brass-bright);
  text-decoration: underline;
}

/* ---------- sections ---------- */
.legal__section {
  margin-top: 40px;
  /* Keep a jumped-to heading clear of the fixed navbar. */
  scroll-margin-top: calc(var(--nav-h, 64px) + 20px);
}

.legal__section:focus {
  outline: none;
}

.legal__section h2 {
  margin: 0 0 12px;
  font-family: var(--font-heading);
  font-size: clamp(19px, 2.4vw, 23px);
  font-weight: 600;
  line-height: 1.3;
  color: var(--brass-bright);
}

.legal__section p {
  margin: 0 0 12px;
  font-size: 15px;
  line-height: 1.75;
  color: var(--bone-dim);
}

.legal__section ul {
  margin: 0 0 12px;
  padding-left: 20px;
}

.legal__section li {
  margin-bottom: 8px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--bone-dim);
}

.legal__section .legal__affirm {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(237, 231, 218, 0.12);
  color: var(--bone);
}

/* ---------- closing area ---------- */
.legal__after {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid rgba(237, 231, 218, 0.12);
}

.legal__after:empty {
  display: none;
}

@media (max-width: 640px) {
  .legal {
    padding-top: calc(var(--nav-h, 64px) + 28px);
    padding-bottom: 56px;
  }

  .legal__toc ol {
    columns: 1;
  }

  .legal__summary {
    font-size: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .legal__tab {
    transition: none;
  }
}
</style>
