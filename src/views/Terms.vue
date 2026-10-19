<script setup>
// Terms of use as a real page (the same text the drawer shows, read from
// src/data/terms.js — there is no second copy of the wording).
//
// Routes: /terms/buyers (also served at /terms) and /terms/sellers.
// Read-only: nothing is accepted here. Acceptance still happens inside the
// sign-up form and the list-a-property form through TermsConsent/TermsDrawer.
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import LegalDocument from '@/components/LegalDocument.vue'
import { getTerms, TERMS_EFFECTIVE_DATE } from '@/data/terms.js'

const props = defineProps({
  // 'general' (buyers and tenants) | 'seller'
  audience: { type: String, default: 'general' }
})

const doc = computed(() => getTerms(props.audience))
</script>

<template>
  <LegalDocument :doc="doc" :effective-date="TERMS_EFFECTIVE_DATE" :current="doc.key">
    <template #after>
      <p class="terms-page__note">
        You can read these any time. You’ll be asked to accept them when you
        {{ doc.key === 'seller' ? 'submit a property' : 'create an account' }}.
        How we handle your personal data is explained in our
        <RouterLink to="/privacy">Privacy Policy</RouterLink>.
      </p>
      <div class="terms-page__actions">
        <RouterLink v-if="doc.key === 'seller'" class="terms-page__cta" to="/list-property">
          List a property
        </RouterLink>
        <RouterLink v-else class="terms-page__cta" to="/signup">Create an account</RouterLink>
        <RouterLink class="terms-page__ghost" to="/">Back to home</RouterLink>
      </div>
    </template>
  </LegalDocument>
</template>

<style scoped>
.terms-page__note {
  margin: 0 0 18px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--bone-dim);
}

.terms-page__note a {
  color: var(--brass-bright);
}

.terms-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.terms-page__cta,
.terms-page__ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 20px;
  border-radius: 4px;
  font-size: 14px;
  text-decoration: none;
}

.terms-page__cta {
  background: var(--brass);
  color: var(--ink);
  font-weight: 600;
}

.terms-page__cta:hover {
  background: var(--brass-bright);
}

.terms-page__ghost {
  border: 1px solid rgba(237, 231, 218, 0.22);
  color: var(--bone-dim);
}

.terms-page__ghost:hover {
  color: var(--bone);
  border-color: var(--brass);
}
</style>
