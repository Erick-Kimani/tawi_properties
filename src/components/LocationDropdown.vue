<template>
  <div class="location-dropdown">
    <label v-if="label" :for="inputId">{{ label }}</label>
    <div class="location-dropdown__wrapper">
      <input
        :id="inputId"
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        class="location-dropdown__input"
        @focus="isOpen = true"
        @blur="handleBlur"
      />
      <div v-if="isOpen" class="location-dropdown__dropdown">
        <div v-if="countiesLoading" class="location-dropdown__empty">
          Loading counties…
        </div>
        <div v-else-if="countiesError" class="location-dropdown__empty">
          {{ countiesError }}
        </div>
        <div v-else-if="filteredCounties.length > 0" class="location-dropdown__list">
          <button
            v-for="county in filteredCounties"
            :key="county"
            type="button"
            class="location-dropdown__item"
            @click="selectCounty(county)"
          >
            {{ county }}
          </button>
        </div>
        <div v-else class="location-dropdown__empty">
          No counties found
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCounties } from '@/stores/counties'

// `activeCounties` already excludes any county an admin has pulled down
// from the Admin dashboard, so this dropdown (and any other component that
// uses it) always reflects the current admin-approved list automatically.
//
// fetchCounties() is what actually populates that list from the backend —
// previously only Admin.vue ever called it, so any dropdown mounted on a
// page nobody had visited /admin from first (Buy, Rent, Home, Categories)
// stayed permanently empty. It's called here so every dropdown loads its
// own data regardless of what else has (or hasn't) mounted; the store
// no-ops repeat calls once the first one succeeds, so this is safe/cheap
// even with several dropdowns on one page.
const { activeCounties, fetchCounties, countiesLoading, countiesError } = useCounties()

onMounted(() => {
  fetchCounties()
})

const props = defineProps({
  label: {
    type: String,
    default: 'Location'
  },
  placeholder: {
    type: String,
    default: 'Choose a county...'
  },
  modelValue: {
    type: String,
    default: ''
  },
  inputId: {
    type: String,
    default: 'location-input'
  }
})

const emit = defineEmits(['update:modelValue'])

const searchQuery = ref(props.modelValue)
const isOpen = ref(false)

const filteredCounties = computed(() => {
  if (!searchQuery.value) {
    return activeCounties.value
  }
  return activeCounties.value.filter(county =>
    county.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

function selectCounty(county) {
  searchQuery.value = county
  emit('update:modelValue', county)
  isOpen.value = false
}

function handleBlur() {
  // Close dropdown after a short delay to allow click to register
  setTimeout(() => {
    isOpen.value = false
  }, 150)
}
</script>

<style scoped>
.location-dropdown {
  position: relative;
  width: 100%;
  flex: 1 1 auto;
}

.location-dropdown label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--sand, #d4af8a);
}

.location-dropdown__wrapper {
  position: relative;
}

.location-dropdown__input {
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: var(--bone, #ede7da);
  font-size: 14px;
  transition: all 0.2s;
  font-family: var(--font-body, inherit);
}

.location-dropdown__input::placeholder {
  color: rgba(169, 129, 75, 0.5);
}

.location-dropdown__input:focus {
  outline: none;
}

.location-dropdown__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 6px;
  background: var(--slate, #2a2e35);
  border: 1px solid rgba(169, 129, 75, 0.3);
  border-radius: 10px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.location-dropdown__list {
  padding: 4px 0;
}

.location-dropdown__item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  color: var(--bone, #ede7da);
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: var(--font-body, inherit);
}

.location-dropdown__item:hover {
  background-color: rgba(169, 129, 75, 0.1);
}

.location-dropdown__empty {
  padding: 12px 16px;
  color: rgba(169, 129, 75, 0.5);
  font-size: 14px;
  text-align: center;
}

/* Scrollbar styling */
.location-dropdown__dropdown::-webkit-scrollbar {
  width: 8px;
}

.location-dropdown__dropdown::-webkit-scrollbar-track {
  background: rgba(169, 129, 75, 0.1);
}

.location-dropdown__dropdown::-webkit-scrollbar-thumb {
  background: rgba(169, 129, 75, 0.3);
  border-radius: 4px;
}

.location-dropdown__dropdown::-webkit-scrollbar-thumb:hover {
  background: rgba(169, 129, 75, 0.5);
}
</style>