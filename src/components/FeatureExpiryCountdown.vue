<template>
  <div
    v-if="expiryInfo"
    class="flip-countdown"
      :class="[
        'flip-countdown--' + expiryInfo.severity,
        { 'flip-countdown--large': size === 'large' }
      ]"
  >
    <div class="flip-countdown__units">
      <div class="flip-unit" v-for="unit in timeUnits" :key="unit.key">
        <div class="flip-unit__digits">
          <div class="flip-digit" v-for="(digit, index) in unit.digits" :key="index">
            <Transition name="flip" mode="out-in">
              <span :key="digit" class="flip-digit__face">{{ digit }}</span>
            </Transition>
          </div>
        </div>
        <span class="flip-unit__label">{{ unit.label }}</span>
      </div>
    </div>

    <div class="flip-countdown__divider"></div>

    <div class="flip-calendar">
      <div class="flip-calendar__unit" v-for="unit in calendarUnits" :key="unit.key">
        <div class="flip-digit flip-digit--wide">
          <Transition name="flip" mode="out-in">
            <span :key="unit.value" class="flip-digit__face">{{ unit.value }}</span>
          </Transition>
        </div>
        <span class="flip-unit__label">{{ unit.label }}</span>
      </div>
    </div>

    <p class="flip-countdown__status">
      {{ expiryInfo.expired ? expiredLabel : statusLabel }}
    </p>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getCalendarUnits, getFeatureExpiryInfo, getTimeUnits } from '@/utils/featureExpiry'

const props = defineProps({
  featuredAt: {
    type: [String, Date],
    required: true
  },
  statusLabel: {
    type: String,
    default: 'Until pull-down'
  },
  expiredLabel: {
    type: String,
    default: 'Pulling down…'
  },
  size: {
    type: String,
    default: 'default'
  }
})

const now = ref(Date.now())
const expiryInfo = computed(() => getFeatureExpiryInfo(props.featuredAt, now.value))
const timeUnits = computed(() => getTimeUnits(expiryInfo.value))
const calendarUnits = computed(() => getCalendarUnits(expiryInfo.value))
let clockInterval = null

onMounted(() => {
  clockInterval = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
})
</script>

<style scoped>
.flip-countdown {
  display: inline-flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0.12) 100%);
  border: 1px solid rgba(237, 231, 218, 0.08);
}

.flip-countdown__units,
.flip-calendar {
  display: flex;
  gap: 8px;
}

.flip-countdown__divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(237, 231, 218, 0.14), transparent);
}

.flip-calendar {
  gap: 10px;
}

.flip-unit,
.flip-calendar__unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.flip-unit__digits {
  display: flex;
  gap: 2px;
}

.flip-digit {
  position: relative;
  width: 20px;
  height: 28px;
  border-radius: 4px;
  background: linear-gradient(180deg, #363c44 0%, #16191d 100%);
  border: 1px solid rgba(237, 231, 218, 0.1);
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  overflow: hidden;
  perspective: 240px;
  transform-style: preserve-3d;
}

.flip-digit--wide {
  width: auto;
  min-width: 34px;
  padding: 0 6px;
}

.flip-digit::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(0, 0, 0, 0.55);
  z-index: 2;
  pointer-events: none;
}

.flip-digit__face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.02em;
  color: var(--bone);
  backface-visibility: hidden;
  transform-origin: center;
}

.flip-unit__label {
  font-family: var(--font-mono);
  font-size: 8px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--brass-bright);
}

.flip-countdown__status {
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.02em;
  color: var(--bone-dim);
  text-align: center;
}

.flip-countdown--warning .flip-digit {
  border-color: rgba(209, 178, 127, 0.4);
}

.flip-countdown--warning .flip-digit__face {
  color: var(--brass-bright);
}

.flip-countdown--critical .flip-digit,
.flip-countdown--expired .flip-digit {
  border-color: rgba(217, 139, 106, 0.5);
  animation: flip-glow 1.6s ease-in-out infinite;
}

.flip-countdown--critical .flip-digit__face,
.flip-countdown--expired .flip-digit__face {
  color: #d98b6a;
}

.flip-countdown--expired .flip-countdown__status {
  color: #d98b6a;
}

.flip-countdown--large {
  gap: 12px;
  padding: 18px 20px;
}

.flip-countdown--large .flip-countdown__units,
.flip-countdown--large .flip-calendar {
  gap: 12px;
}

.flip-countdown--large .flip-digit {
  width: 28px;
  height: 38px;
  border-radius: 5px;
}

.flip-countdown--large .flip-digit--wide {
  width: auto;
  min-width: 44px;
  padding: 0 8px;
}

.flip-countdown--large .flip-digit__face {
  font-size: 17px;
}

.flip-countdown--large .flip-unit__label {
  font-size: 9px;
}

.flip-countdown--large .flip-countdown__status {
  font-size: 12px;
}

@keyframes flip-glow {
  0%, 100% {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }
  50% {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 8px rgba(217, 139, 106, 0.55);
  }
}

.flip-enter-active,
.flip-leave-active {
  transition: transform 0.45s cubic-bezier(0.45, 0.05, 0.15, 1), opacity 0.25s linear;
}

.flip-enter-from {
  transform: rotateX(-100deg);
  opacity: 0;
}

.flip-leave-to {
  transform: rotateX(100deg);
  opacity: 0;
}
</style>
