<template>
  <button
    type="button"
    class="google-btn"
    :disabled="loading || disabled"
    @click="handleClick"
  >
    <svg class="google-btn__icon" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
    <span>{{ loading ? 'Connecting…' : label }}</span>
  </button>
</template>

<script setup>
import { ref } from 'vue'
import authService from '@/services/authService'
import { requestGoogleAccessToken } from '@/services/googleAuth'

const props = defineProps({
  label: {
    type: String,
    default: 'Continue with Google'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['success', 'error'])

const loading = ref(false)

async function handleClick() {
  if (loading.value || props.disabled) return

  loading.value = true

  try {
    const accessToken = await requestGoogleAccessToken()
    const response = await authService.googleAuth(accessToken)
    emit('success', response.data)
  } catch (error) {
    console.error('Google sign-in error:', error)
    const message =
      error.response?.data?.message || error.message || 'Google sign-in failed. Please try again.'
    emit('error', message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  background: var(--bone);
  color: var(--ink);
  border: 1px solid rgba(237, 231, 218, 0.15);
  border-radius: 4px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
}

.google-btn:hover:not(:disabled) {
  background: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
}

.google-btn:active:not(:disabled) {
  transform: translateY(1px);
}

.google-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-btn__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
</style>