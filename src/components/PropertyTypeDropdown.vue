<template>
  <div class="property-type-dropdown">
    <label v-if="label" :for="inputId">{{ label }}</label>
    <select
      :id="inputId"
      class="property-type-dropdown__select"
      :disabled="disabled || loading"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-if="includeAllOption" value="">{{ allOptionLabel }}</option>
      <option v-for="type in visibleTypes" :key="type" :value="type">{{ type }}</option>
    </select>
    <p v-if="error" class="property-type-dropdown__error">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePropertyTypes } from '@/stores/propertyTypes'

const props = defineProps({
  label: {
    type: String,
    default: 'Type'
  },
  placeholder: {
    type: String,
    default: ''
  },
  modelValue: {
    type: String,
    default: ''
  },
  inputId: {
    type: String,
    default: 'property-type-input'
  },
  // Show a leading "All types" (or custom label) option — useful for filter
  // dropdowns where no selection means "don't filter by type".
  includeAllOption: {
    type: Boolean,
    default: false
  },
  allOptionLabel: {
    type: String,
    default: 'All types'
  },
  // Type names to leave out, e.g. excluding "Rentals" on the Buy page.
  excludeTypes: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])

const { propertyTypes, loading, error } = usePropertyTypes()

const visibleTypes = computed(() =>
  propertyTypes.value.filter((t) => !props.excludeTypes.includes(t))
)
</script>

<style scoped>
.property-type-dropdown {
  position: relative;
  width: 100%;
  flex: 1 1 auto;
}

.property-type-dropdown label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--sand, #d4af8a);
}

.property-type-dropdown__select {
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: var(--bone, #ede7da);
  font-size: 14px;
  font-family: var(--font-body, inherit);
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.property-type-dropdown__select:focus {
  outline: none;
}

.property-type-dropdown__select:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.property-type-dropdown__select option {
  background: var(--slate, #2a2e35);
  color: var(--bone, #ede7da);
}

.property-type-dropdown__error {
  margin: 4px 0 0;
  font-size: 11px;
  color: rgba(237, 231, 218, 0.5);
}
</style>