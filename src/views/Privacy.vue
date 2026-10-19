<script setup>
// Privacy Policy as a real page at /privacy. The wording lives in
// src/data/privacy.js.
import { RouterLink } from 'vue-router'
import LegalDocument from '@/components/LegalDocument.vue'
import { PRIVACY, PRIVACY_EFFECTIVE_DATE } from '@/data/privacy.js'
</script>

<template>
  <LegalDocument :doc="PRIVACY" :effective-date="PRIVACY_EFFECTIVE_DATE" current="privacy">
    <template #after>
      <p class="privacy-page__note">
        The rules for using the site are in our
        <RouterLink to="/terms/buyers">buyer &amp; tenant terms</RouterLink> and
        <RouterLink to="/terms/sellers">seller terms</RouterLink>.
      </p>
      <RouterLink class="privacy-page__ghost" to="/">Back to home</RouterLink>
    </template>
  </LegalDocument>
</template>

<style scoped>
.privacy-page__note {
  margin: 0 0 18px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--bone-dim);
}

.privacy-page__note a {
  color: var(--brass-bright);
}

.privacy-page__ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 20px;
  border: 1px solid rgba(237, 231, 218, 0.22);
  border-radius: 4px;
  font-size: 14px;
  color: var(--bone-dim);
  text-decoration: none;
}

.privacy-page__ghost:hover {
  color: var(--bone);
  border-color: var(--brass);
}
</style>
