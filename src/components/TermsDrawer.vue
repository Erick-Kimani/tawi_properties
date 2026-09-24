<template>
  <Teleport to="body">
    <Transition name="terms-drawer">
      <div
        v-if="show"
        class="terms-drawer"
        role="dialog"
        aria-modal="true"
        :aria-label="doc.title"
        @keydown.esc.stop="requestClose"
      >
        <div class="terms-drawer__scrim" @click="requestClose"></div>

        <aside
          ref="panelEl"
          class="terms-drawer__panel"
          :class="{ 'terms-drawer__panel--dragging': dragging }"
          :style="panelStyle"
        >
          <!-- Grab rail: drag it to the right (or swipe, on touch) to
               withdraw the drawer. Keyboard users get the Close button
               below, and Esc works anywhere in the dialog. -->
          <button
            type="button"
            class="terms-drawer__rail"
            aria-label="Close terms"
            @pointerdown="onDragStart"
            @click="requestClose"
          >
            <span class="terms-drawer__rail-grip"></span>
          </button>

          <header class="terms-drawer__head">
            <div>
              <p class="terms-drawer__eyebrow">{{ doc.eyebrow }}</p>
              <h2 class="terms-drawer__title">{{ doc.title }}</h2>
            </div>
            <button
              ref="closeEl"
              type="button"
              class="terms-drawer__close"
              @click="requestClose"
            >
              Close
            </button>
          </header>

          <p class="terms-drawer__summary">{{ doc.summary }}</p>

          <div ref="bodyEl" class="terms-drawer__body" @scroll.passive="onBodyScroll">
            <section
              v-for="section in doc.sections"
              :key="section.heading"
              class="terms-drawer__section"
            >
              <h3>{{ section.heading }}</h3>
              <p v-for="(para, i) in section.paragraphs" :key="`p-${i}`">{{ para }}</p>
              <ul v-if="section.points">
                <li v-for="(point, i) in section.points" :key="`li-${i}`">{{ point }}</li>
              </ul>
              <p v-if="section.affirm" class="terms-drawer__affirm">{{ section.affirm }}</p>
            </section>

            <p class="terms-drawer__meta">
              Version {{ doc.version }} &middot; in effect from {{ effectiveDate }}
            </p>
          </div>

          <footer class="terms-drawer__foot">
            <template v-if="readOnly">
              <p class="terms-drawer__foot-note">
                You can read these any time. You'll be asked to accept them when you
                {{ audience === 'seller' ? 'submit a property' : 'create an account' }}.
              </p>
              <button type="button" class="terms-drawer__primary" @click="requestClose">
                Done
              </button>
            </template>

            <template v-else>
              <label class="terms-drawer__check">
                <input
                  type="checkbox"
                  :checked="checked"
                  :disabled="!canAccept"
                  @change="checked = $event.target.checked"
                />
                <span>{{ doc.confirmation }}</span>
              </label>

              <p v-if="!canAccept" class="terms-drawer__foot-note">
                Read to the end of the page to accept.
              </p>

              <div class="terms-drawer__actions">
                <button type="button" class="terms-drawer__ghost" @click="requestClose">
                  Not now
                </button>
                <button
                  type="button"
                  class="terms-drawer__primary"
                  :disabled="!checked"
                  @click="confirm"
                >
                  Accept and continue
                </button>
              </div>
            </template>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { getTerms, TERMS_EFFECTIVE_DATE } from '@/data/terms.js'

const props = defineProps({
  show: { type: Boolean, default: false },
  // 'general' (buyers, tenants, any account) | 'seller' (listing a property)
  audience: { type: String, default: 'general' },
  // Read-only mode drops the checkbox entirely — used by the footer links,
  // where someone is just reading and has nothing to agree to.
  readOnly: { type: Boolean, default: false },
  // Keeps the checkbox disabled until the text has actually been scrolled
  // through. On by default for the seller drawer (money changes hands),
  // off elsewhere so it doesn't become an obstacle course.
  requireScroll: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'accept'])

const doc = computed(() => getTerms(props.audience))
const effectiveDate = TERMS_EFFECTIVE_DATE

const panelEl = ref(null)
const bodyEl = ref(null)
const closeEl = ref(null)
const checked = ref(false)
const scrolledToEnd = ref(false)

const canAccept = computed(() => !props.requireScroll || scrolledToEnd.value)

function onBodyScroll() {
  const el = bodyEl.value
  if (!el) return
  // 24px of slack — sub-pixel heights and zoom mean scrollTop rarely
  // lands exactly on the bottom.
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
    scrolledToEnd.value = true
  }
}

function requestClose() {
  emit('close')
}

function confirm() {
  if (!checked.value) return
  emit('accept', { audience: props.audience, version: doc.value.version })
}

// --- drag / swipe to withdraw -------------------------------------------
const dragging = ref(false)
const dragX = ref(0)
let dragStartX = 0
let activePointerId = null

const panelStyle = computed(() =>
  dragX.value > 0 ? { transform: `translateX(${dragX.value}px)` } : {}
)

function onDragStart(event) {
  dragging.value = true
  dragStartX = event.clientX
  activePointerId = event.pointerId
  event.currentTarget.setPointerCapture?.(event.pointerId)
  window.addEventListener('pointermove', onDragMove)
  window.addEventListener('pointerup', onDragEnd)
  window.addEventListener('pointercancel', onDragEnd)
}

function onDragMove(event) {
  if (!dragging.value || event.pointerId !== activePointerId) return
  // Rightward only — dragging back into the screen shouldn't stretch it.
  dragX.value = Math.max(0, event.clientX - dragStartX)
}

function onDragEnd(event) {
  if (!dragging.value) return
  if (event.pointerId !== undefined && event.pointerId !== activePointerId) return

  const travelled = dragX.value
  dragging.value = false
  dragX.value = 0
  activePointerId = null
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragEnd)
  window.removeEventListener('pointercancel', onDragEnd)

  // Past ~a third of the panel (capped) counts as a deliberate withdraw.
  const threshold = Math.min(160, (panelEl.value?.offsetWidth || 480) / 3)
  if (travelled > threshold) requestClose()
}

// --- open / close side effects ------------------------------------------
let previouslyFocused = null

watch(
  () => props.show,
  async (open) => {
    if (open) {
      previouslyFocused = document.activeElement
      checked.value = false
      scrolledToEnd.value = false
      document.body.style.overflow = 'hidden'
      await nextTick()
      closeEl.value?.focus()
      // A short document may not scroll at all — don't lock the checkbox
      // behind a scroll that can never happen.
      onBodyScroll()
      const el = bodyEl.value
      if (el && el.scrollHeight <= el.clientHeight) scrolledToEnd.value = true
    } else {
      document.body.style.overflow = ''
      previouslyFocused?.focus?.()
      previouslyFocused = null
    }
  }
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragEnd)
  window.removeEventListener('pointercancel', onDragEnd)
})
</script>

<style scoped>
.terms-drawer {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  justify-content: flex-end;
}

.terms-drawer__scrim {
  position: absolute;
  inset: 0;
  background: rgba(8, 11, 15, 0.72);
  backdrop-filter: blur(2px);
}

.terms-drawer__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(520px, 100%);
  height: 100%;
  background: var(--ink-soft);
  border-left: 1px solid rgba(176, 142, 91, 0.3);
  box-shadow: -28px 0 70px rgba(0, 0, 0, 0.55);
  transition: transform 0.24s ease;
}

.terms-drawer__panel--dragging {
  transition: none;
}

.terms-drawer__rail {
  position: absolute;
  top: 0;
  left: -22px;
  width: 22px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 0;
  cursor: grab;
  touch-action: none;
}

.terms-drawer__rail:active { cursor: grabbing; }

.terms-drawer__rail-grip {
  width: 4px;
  height: 56px;
  border-radius: 999px;
  background: rgba(209, 178, 127, 0.5);
}

.terms-drawer__rail:hover .terms-drawer__rail-grip,
.terms-drawer__rail:focus-visible .terms-drawer__rail-grip {
  background: var(--brass-bright);
}

.terms-drawer__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 28px 0;
}

.terms-drawer__eyebrow {
  margin: 0 0 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brass-bright);
}

.terms-drawer__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 26px;
  line-height: 1.2;
  color: var(--bone);
}

.terms-drawer__close {
  flex-shrink: 0;
  background: transparent;
  border: 1px solid rgba(237, 231, 218, 0.22);
  border-radius: 999px;
  color: var(--bone-dim);
  font-size: 12px;
  padding: 6px 14px;
  cursor: pointer;
}

.terms-drawer__close:hover {
  border-color: var(--brass);
  color: var(--bone);
}

.terms-drawer__summary {
  margin: 14px 28px 0;
  padding: 12px 14px;
  border-left: 2px solid var(--brass);
  background: rgba(176, 142, 91, 0.08);
  font-size: 14px;
  line-height: 1.6;
  color: var(--bone);
}

.terms-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 28px 24px;
  scrollbar-width: thin;
}

.terms-drawer__section { margin-bottom: 26px; }

.terms-drawer__section h3 {
  margin: 0 0 8px;
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 600;
  color: var(--brass-bright);
}

.terms-drawer__section p {
  margin: 0 0 10px;
  font-size: 14px;
  line-height: 1.65;
  color: var(--bone-dim);
}

.terms-drawer__section ul {
  margin: 0 0 10px;
  padding-left: 18px;
}

.terms-drawer__section li {
  font-size: 14px;
  line-height: 1.6;
  color: var(--bone-dim);
  margin-bottom: 6px;
}

.terms-drawer__affirm {
  color: var(--bone) !important;
  border-top: 1px solid rgba(237, 231, 218, 0.12);
  padding-top: 10px;
}

.terms-drawer__meta {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  color: rgba(216, 207, 195, 0.55);
}

.terms-drawer__foot {
  border-top: 1px solid rgba(237, 231, 218, 0.12);
  background: rgba(15, 19, 24, 0.6);
  padding: 18px 28px calc(18px + env(safe-area-inset-bottom, 0px));
}

.terms-drawer__check {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--bone);
  cursor: pointer;
}

.terms-drawer__check input {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: var(--brass);
  cursor: pointer;
}

.terms-drawer__check input:disabled { cursor: not-allowed; opacity: 0.5; }

.terms-drawer__foot-note {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--bone-dim);
}

.terms-drawer__actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.terms-drawer__primary {
  flex: 1;
  background: var(--brass);
  color: var(--ink);
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  padding: 12px 16px;
  cursor: pointer;
}

.terms-drawer__primary:hover:not(:disabled) { background: var(--brass-bright); }

.terms-drawer__primary:disabled { opacity: 0.45; cursor: not-allowed; }

.terms-drawer__ghost {
  background: transparent;
  border: 1px solid rgba(237, 231, 218, 0.22);
  border-radius: 4px;
  color: var(--bone-dim);
  font-size: 14px;
  padding: 12px 18px;
  cursor: pointer;
}

.terms-drawer__ghost:hover { color: var(--bone); border-color: var(--brass); }

/* Enter / leave: panel slides, scrim fades. */
.terms-drawer-enter-active .terms-drawer__panel,
.terms-drawer-leave-active .terms-drawer__panel {
  transition: transform 0.26s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.terms-drawer-enter-from .terms-drawer__panel,
.terms-drawer-leave-to .terms-drawer__panel {
  transform: translateX(100%);
}

.terms-drawer-enter-active .terms-drawer__scrim,
.terms-drawer-leave-active .terms-drawer__scrim {
  transition: opacity 0.26s ease;
}

.terms-drawer-enter-from .terms-drawer__scrim,
.terms-drawer-leave-to .terms-drawer__scrim { opacity: 0; }

@media (max-width: 560px) {
  .terms-drawer__panel { width: 100%; border-left: none; }
  .terms-drawer__rail { left: 0; background: transparent; }
  .terms-drawer__head,
  .terms-drawer__body,
  .terms-drawer__foot { padding-left: 20px; padding-right: 20px; }
  .terms-drawer__summary { margin-left: 20px; margin-right: 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .terms-drawer__panel,
  .terms-drawer-enter-active .terms-drawer__panel,
  .terms-drawer-leave-active .terms-drawer__panel,
  .terms-drawer-enter-active .terms-drawer__scrim,
  .terms-drawer-leave-active .terms-drawer__scrim {
    transition: none;
  }
}
</style>