<template>
  <div class="terms-consent" :class="{ 'terms-consent--flagged': flagged && !modelValue }">
    <label class="terms-consent__row">
      <input
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        @change="$emit('update:modelValue', $event.target.checked)"
      />
      <span class="terms-consent__text">
        {{ doc.confirmation }}
        <button type="button" class="terms-consent__link" @click="open = true">
          Read the {{ audience === 'seller' ? 'seller terms' : 'terms' }}
        </button>
      </span>
    </label>

    <p v-if="flagged && !modelValue" class="terms-consent__error">
      Please read and accept the terms to continue.
    </p>

    <TermsDrawer
      :show="open"
      :audience="audience"
      :require-scroll="requireScroll"
      @close="open = false"
      @accept="onAccept"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import TermsDrawer from '@/components/TermsDrawer.vue'
import { getTerms } from '@/data/terms'

const props = defineProps({
  // The checkbox state. Parent forms bind this with v-model and refuse to
  // submit while it's false — see Signup.vue / Listaproperty.vue.
  modelValue: { type: Boolean, default: false },
  audience: { type: String, default: 'general' },
  disabled: { type: Boolean, default: false },
  requireScroll: { type: Boolean, default: false },
  // Set by the parent after a blocked submit attempt, so the unticked box
  // is called out instead of the form just silently doing nothing.
  flagged: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const doc = computed(() => getTerms(props.audience))

// Accepting inside the drawer ticks the box out here too — one action,
// not two.
function onAccept() {
  emit('update:modelValue', true)
  open.value = false
}
</script>

<style scoped>
.terms-consent {
  border: 1px solid rgba(237, 231, 218, 0.15);
  border-radius: 6px;
  background: rgba(176, 142, 91, 0.05);
  padding: 14px 16px;
}

.terms-consent--flagged {
  border-color: #d98b6a;
  background: rgba(217, 139, 106, 0.08);
}

.terms-consent__row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}

.terms-consent__row input {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: var(--brass);
  cursor: pointer;
}

.terms-consent__row input:disabled { cursor: not-allowed; opacity: 0.5; }

.terms-consent__text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--bone);
}

.terms-consent__link {
  display: inline;
  background: none;
  border: none;
  padding: 0 0 0 4px;
  color: var(--brass-bright);
  font-size: 13px;
  text-decoration: underline;
  cursor: pointer;
}

.terms-consent__link:hover { color: var(--bone); }

.terms-consent__error {
  margin: 8px 0 0;
  font-size: 12px;
  color: #d98b6a;
}
</style>