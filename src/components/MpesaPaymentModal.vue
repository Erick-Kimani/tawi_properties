<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="mpesa-modal__backdrop"
      role="presentation"
      @click.self="handleBackdropClick"
    >
      <div
        class="mpesa-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Pay listing fee"
      >
        <button
          type="button"
          class="mpesa-modal__close"
          aria-label="Close"
          :disabled="stage === 'requesting' || stage === 'waiting'"
          @click="handleBackdropClick"
        >
          &times;
        </button>

        <p class="mpesa-modal__eyebrow">Tawi Properties</p>
        <h2 class="mpesa-modal__title">Listing fee</h2>

        <!-- Stage 1: confirm phone number -->
        <div v-if="stage === 'form'" class="mpesa-modal__body">
          <p class="mpesa-modal__copy">
            A one-time listing fee gets your property in front of our review team.
            You'll get an M-Pesa prompt on the number below — enter your PIN to confirm.
          </p>

          <label for="mpesa-phone" class="mpesa-modal__label">M-Pesa phone number</label>
          <input
            id="mpesa-phone"
            v-model="phone"
            type="tel"
            class="mpesa-modal__input"
            placeholder="0712345678"
            autocomplete="tel-national"
          />
          <p v-if="formError" class="mpesa-modal__error">{{ formError }}</p>

          <button type="button" class="btn btn--primary mpesa-modal__submit" @click="startPayment">
            Send payment request
          </button>
        </div>

        <!-- Stage 2: STK push sent, requesting -->
        <div v-else-if="stage === 'requesting'" class="mpesa-modal__body mpesa-modal__body--center">
          <div class="mpesa-modal__spinner" aria-hidden="true"></div>
          <p class="mpesa-modal__copy">Sending payment request…</p>
        </div>

        <!-- Stage 3: waiting for the customer to enter their PIN -->
        <div v-else-if="stage === 'waiting'" class="mpesa-modal__body mpesa-modal__body--center">
          <div class="mpesa-modal__spinner" aria-hidden="true"></div>
          <p class="mpesa-modal__copy">
            Check your phone — enter your M-Pesa PIN to complete the KES {{ displayAmount }} payment.
          </p>
          <p class="mpesa-modal__hint">This can take up to a minute.</p>
        </div>

        <!-- Stage 4a: success -->
        <div v-else-if="stage === 'success'" class="mpesa-modal__body mpesa-modal__body--center">
          <div class="mpesa-modal__success-glyph">✓</div>
          <p class="mpesa-modal__copy">Payment received. Submitting your listing…</p>
        </div>

        <!-- Stage 4b: failed / cancelled / timed out -->
        <div v-else-if="stage === 'failed'" class="mpesa-modal__body mpesa-modal__body--center">
          <p class="mpesa-modal__error">{{ failureMessage }}</p>
          <button type="button" class="btn btn--primary mpesa-modal__submit" @click="stage = 'form'">
            Try again
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import paymentService from '@/services/paymentService'

const props = defineProps({
  show: { type: Boolean, default: false },
  initialPhone: { type: String, default: '' }
})

const emit = defineEmits(['close', 'paid', 'resume'])

// 'form' -> 'requesting' -> 'waiting' -> 'success' | 'failed'
const stage = ref('form')
const phone = ref(props.initialPhone)
const formError = ref('')
const failureMessage = ref('')
const checkoutRequestId = ref('')
// The amount actually charged, from the server's response to the STK
// Push initiate call — never guessed or hard-coded on the frontend, since
// the fee is server-config-controlled (see MpesaPaymentController::initiate).
const displayAmount = ref('')

let pollTimer = null
let pollAttempts = 0
const MAX_POLL_ATTEMPTS = 20 // ~60s at 3s intervals
const POLL_INTERVAL_MS = 3000

// Everything above this point (stage, checkoutRequestId, the poll timer)
// lives only in this component's memory. Reload the page mid-payment and
// all of it is gone — even though the payment itself is still very much
// in progress server-side, and Safaricom's callback is still coming.
// Without this, the modal's "status" would just be whatever it last
// happened to render before the reload, not the real payment status.
//
// STORAGE_KEY persists just enough (checkout_request_id + when it
// started + the phone typed in) to resume checking on the next page
// load, so the UI can catch up to reality instead of silently
// forgetting a payment ever started.
const STORAGE_KEY = 'tawi_pending_mpesa_payment'
// Stop treating a stored payment as resumable after this long — Daraja's
// own STK Push prompts expire on their side well before this, so a much
// older entry means the flow is dead one way or another; better to let
// the user start fresh than resume-poll something that will never settle.
const RESUME_MAX_AGE_MS = 10 * 60 * 1000

function savePendingPayment() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      checkoutRequestId: checkoutRequestId.value,
      amount: displayAmount.value,
      phone: phone.value,
      startedAt: Date.now()
    }))
  } catch {
    // localStorage can fail (private browsing, storage full, etc.) —
    // resume just won't work in that case, which is a minor UX loss,
    // not a functional one. The payment itself is unaffected either way.
  }
}

function clearPendingPayment() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // See savePendingPayment — non-fatal either way.
  }
}

function readPendingPayment() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.checkoutRequestId || !parsed?.startedAt) return null
    if (Date.now() - parsed.startedAt > RESUME_MAX_AGE_MS) {
      clearPendingPayment()
      return null
    }
    return parsed
  } catch {
    return null
  }
}

// On mount — which happens as soon as Listaproperty.vue renders, even
// while this modal is still hidden — check for a payment that was left
// mid-flight by a reload. If one exists, restore its state and ask the
// parent to reopen the modal so the person sees exactly where they left
// off (still waiting, or already resolved) instead of a blank form.
onMounted(() => {
  const pending = readPendingPayment()
  if (!pending) return

  checkoutRequestId.value = pending.checkoutRequestId
  displayAmount.value = pending.amount
  phone.value = pending.phone || props.initialPhone
  stage.value = 'waiting'
  emit('resume')
})

watch(
  () => props.show,
  (visible) => {
    if (!visible) {
      stopPolling()
      return
    }

    // A resumed payment already has checkoutRequestId set from onMounted
    // above — jump straight to checking it rather than resetting to a
    // blank form the person already got past.
    if (checkoutRequestId.value && stage.value === 'waiting') {
      checkStatus()
      beginPolling()
      return
    }

    stage.value = 'form'
    phone.value = props.initialPhone
    formError.value = ''
    failureMessage.value = ''
  }
)

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  pollAttempts = 0
}

function handleBackdropClick() {
  if (stage.value === 'requesting' || stage.value === 'waiting') return
  emit('close')
}

async function startPayment() {
  formError.value = ''

  if (!phone.value || phone.value.trim().length < 9) {
    formError.value = 'Enter a valid M-Pesa phone number.'
    return
  }

  stage.value = 'requesting'

  try {
    const { data } = await paymentService.initiateListingFeePayment(phone.value.trim())
    checkoutRequestId.value = data.checkout_request_id
    displayAmount.value = data.amount
    stage.value = 'waiting'
    savePendingPayment()
    beginPolling()
  } catch (err) {
    stage.value = 'failed'
    failureMessage.value =
      err.response?.data?.message || 'Could not start the payment. Please try again.'
  }
}

function beginPolling() {
  pollAttempts = 0
  pollTimer = setInterval(checkStatus, POLL_INTERVAL_MS)
}

async function checkStatus() {
  pollAttempts += 1

  try {
    const { data } = await paymentService.getPaymentStatus(checkoutRequestId.value)

    if (data.status === 'completed') {
      stopPolling()
      clearPendingPayment()
      stage.value = 'success'
      emit('paid', { checkoutRequestId: checkoutRequestId.value })
      return
    }

    if (data.status === 'failed' || data.status === 'cancelled') {
      stopPolling()
      clearPendingPayment()
      stage.value = 'failed'
      failureMessage.value =
        data.status === 'cancelled'
          ? 'Payment was cancelled on your phone.'
          : data.result_desc || 'The payment was not completed.'
      return
    }
    // status === 'pending' — keep polling. Stays in localStorage too, so
    // a reload while still pending resumes checking rather than losing
    // track of it.
  } catch {
    // A single failed poll doesn't end the flow — try again on the next
    // tick unless we've run out of attempts.
  }

  if (pollAttempts >= MAX_POLL_ATTEMPTS) {
    stopPolling()
    // Deliberately NOT cleared here — the payment may still resolve on
    // Safaricom's side after our own polling gives up (the person just
    // sees a timeout message and can retry). Keeping it around lets a
    // reload pick the real answer up later via the callback or a fresh
    // query, rather than the frontend's timeout being the final word.
    stage.value = 'failed'
    failureMessage.value = "We didn't hear back in time. If you completed the payment, wait a moment and try submitting again."
  }
}
</script>

<style scoped>
.mpesa-modal__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 19, 24, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.mpesa-modal {
  position: relative;
  width: 100%;
  max-width: 380px;
  background: var(--ink-soft);
  border: 1px solid rgba(169, 129, 75, 0.25);
  border-radius: var(--radius-md);
  padding: 32px 28px 28px;
  box-shadow: var(--shadow-soft);
  color: var(--bone);
}

.mpesa-modal__close {
  position: absolute;
  top: 14px;
  right: 14px;
  background: none;
  border: none;
  color: var(--bone-dim);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.mpesa-modal__close:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.mpesa-modal__eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brass-bright);
  margin: 0 0 6px;
}

.mpesa-modal__title {
  font-family: var(--font-heading);
  font-size: 22px;
  margin: 0 0 16px;
}

.mpesa-modal__body--center {
  text-align: center;
  padding: 12px 0 4px;
}

.mpesa-modal__copy {
  font-size: 14px;
  line-height: 1.6;
  color: var(--bone-dim);
  margin: 0 0 16px;
}

.mpesa-modal__hint {
  font-size: 12px;
  color: var(--bone-dim);
  opacity: 0.8;
}

.mpesa-modal__label {
  display: block;
  font-size: 12px;
  color: var(--bone-dim);
  margin-bottom: 6px;
}

.mpesa-modal__input {
  width: 100%;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(169, 129, 75, 0.3);
  background: rgba(255, 255, 255, 0.04);
  color: var(--bone);
  font-size: 14px;
  margin-bottom: 6px;
}

.mpesa-modal__input:focus {
  outline: none;
  border-color: var(--brass-bright);
}

.mpesa-modal__error {
  color: var(--coral);
  font-size: 13px;
  margin: 4px 0 14px;
}

.mpesa-modal__submit {
  width: 100%;
  margin-top: 8px;
}

.mpesa-modal__success-glyph {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--pine);
  color: var(--bone);
  font-size: 22px;
}

.mpesa-modal__spinner {
  width: 32px;
  height: 32px;
  margin: 0 auto 16px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top-color: var(--brass-bright);
  border-radius: 50%;
  animation: mpesa-modal-spin 0.8s linear infinite;
}

@keyframes mpesa-modal-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>