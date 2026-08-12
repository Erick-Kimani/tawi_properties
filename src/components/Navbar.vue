<template>
  <header class="nav">
    <div class="nav__inner">
      <RouterLink class="nav__mark" to="/">
        <span class="nav__mark-glyph">T</span>
        <span class="nav__mark-word">Tawi Properties</span>
      </RouterLink>

     <nav class="nav__links">
  <RouterLink to="/buy">Buy</RouterLink>
  <RouterLink to="/rent">Rent</RouterLink>
  
  <!-- Add the v-if here -->
  <RouterLink v-if="authStore.user?.role?.slug === 'administrator'" to="/admin">Admin</RouterLink>

  <div class="nav__dropdown" @mouseleave="dropdownOpen = false">
    <button
      class="nav__dropdown-trigger"
      :class="{ 'nav__dropdown-trigger--active': isMoreActive }"
      type="button"
      @click="dropdownOpen = !dropdownOpen"
    >
      More
      <span class="nav__dropdown-chevron">▾</span>
    </button>

    <div v-if="dropdownOpen" class="nav__dropdown-menu">
      <RouterLink to="/property-map" @click="dropdownOpen = false">Map</RouterLink>
      <RouterLink to="/contact" @click="dropdownOpen = false">Contact</RouterLink>
    </div>
  </div>
</nav>

      <div class="nav__actions">
        <button
          v-if="authStore.isAuthenticated"
          type="button"
          class="nav__ghost nav__ghost--button"
          @click="handleLogout"
        >
          {{ loggingOut ? 'Logging out…' : 'Logout' }}
        </button>
        <RouterLink v-else class="nav__ghost" to="/signup">Sign in</RouterLink>
        <RouterLink class="nav__cta" to="/list-property">List a property</RouterLink>
      </div>

      <button class="nav__burger" @click="menuOpen = !menuOpen" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
    </div>

    <div class="nav__mobile" v-if="menuOpen">
      <RouterLink to="/admin" @click="menuOpen = false">Admin</RouterLink>
      <RouterLink to="/buy" @click="menuOpen = false">Buy</RouterLink>
      <RouterLink to="/rent" @click="menuOpen = false">Rent</RouterLink>
      <RouterLink to="/property-map" @click="menuOpen = false">Map</RouterLink>
      <RouterLink to="/contact" @click="menuOpen = false">Contact</RouterLink>
      <RouterLink class="nav__cta" to="/list-property" @click="menuOpen = false">List a property</RouterLink>
      <button
        v-if="authStore.isAuthenticated"
        type="button"
        class="nav__mobile-logout"
        @click="handleLogout"
      >
        {{ loggingOut ? 'Logging out…' : 'Logout' }}
      </button>
      <RouterLink v-else to="/signup" @click="menuOpen = false">Sign in</RouterLink>
    </div>
  </header>
</template>

<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const menuOpen = ref(false)
const dropdownOpen = ref(false)
const loggingOut = ref(false)

const isMoreActive = computed(() =>
  route.path.startsWith('/property-map') || route.path.startsWith('/contact')
)

async function handleLogout() {
  if (loggingOut.value) return
  loggingOut.value = true
  menuOpen.value = false
  dropdownOpen.value = false

  // Clears the token/user from state + localStorage, so the logout
  // button itself disappears from the nav the moment this resolves,
  // then send the user to the login page.
  await authStore.logout()
  loggingOut.value = false
  router.push('/login')
}
</script>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background-image:
    linear-gradient(rgba(20, 23, 28, 0.82), rgba(20, 23, 28, 0.82)),
    url('/images/nav-bg.jpg');
  background-size: cover;
  background-position: center 30%;
  border-bottom: 1px solid rgba(169, 129, 75, 0.25);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
}

.nav__inner {
  max-width: 1320px;
  margin: 0 auto;
  padding: 18px var(--gutter);
  display: flex;
  align-items: center;
  gap: 40px;
}

.nav__mark {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  margin-right: auto;
}

.nav__mark-glyph {
  width: 30px;
  height: 30px;
  border: 1px solid var(--brass);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 16px;
  color: var(--brass-bright);
}

.nav__mark-word {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 500;
  color: var(--bone);
  letter-spacing: 0.01em;
}

.nav__links {
  display: flex;
  gap: 8px;
}

.nav__links a,
.nav__dropdown-trigger {
  position: relative;
  color: var(--bone-dim);
  text-decoration: none;
  font-size: 14px;
  letter-spacing: 0.02em;
  padding: 7px 14px;
  border-radius: 3px;
  transition: color 0.2s ease, background 0.2s ease;
}

.nav__links a::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 4px;
  height: 1px;
  background: transparent;
  transform: scaleX(0.6);
  transform-origin: center;
  transition: background 0.2s ease, transform 0.2s ease;
}

.nav__links a:hover,
.nav__dropdown-trigger:hover { color: var(--bone); }

.nav__links a:hover::after,
.nav__links a.router-link-active::after,
.nav__dropdown-trigger--active::after {
  background: rgba(169, 129, 75, 0.6);
  transform: scaleX(1);
}

.nav__links a.router-link-active,
.nav__dropdown-trigger--active {
  color: var(--bone);
  background: rgba(169, 129, 75, 0.1);
  box-shadow: inset 0 -1px 0 rgba(169, 129, 75, 0.24);
}

.nav__dropdown {
  position: relative;
}

.nav__dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.nav__dropdown-chevron {
  font-size: 11px;
  transition: transform 0.2s ease;
}

.nav__dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  display: flex;
  flex-direction: column;
  min-width: 140px;
  padding: 8px;
  background: rgba(20, 23, 28, 0.96);
  border: 1px solid rgba(169, 129, 75, 0.25);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.nav__dropdown-menu a {
  color: var(--bone-dim);
  text-decoration: none;
  padding: 8px 10px;
  border-radius: 4px;
  transition: color 0.2s ease, background 0.2s ease;
}

.nav__dropdown-menu a:hover {
  color: var(--bone);
  background: rgba(169, 129, 75, 0.12);
}

.nav__dropdown-menu a.router-link-active {
  color: var(--bone);
  background: rgba(169, 129, 75, 0.16);
}

.nav__actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav__ghost {
  color: var(--bone-dim);
  text-decoration: none;
  font-size: 14px;
}

.nav__ghost--button {
  background: none;
  border: none;
  font-family: inherit;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.nav__ghost--button:hover {
  color: var(--bone);
}

.nav__ghost--button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.nav__cta {
  border: 1px solid var(--brass);
  color: var(--brass-bright);
  text-decoration: none;
  font-size: 13px;
  letter-spacing: 0.03em;
  padding: 9px 18px;
  transition: background 0.2s ease, color 0.2s ease;
}

.nav__cta:hover {
  background: var(--brass);
  color: var(--ink);
}

.nav__burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
}

.nav__burger span {
  width: 22px;
  height: 1px;
  background: var(--bone);
}

.nav__mobile {
  display: none;
}

@media (max-width: 860px) {
  .nav__links,
  .nav__actions { display: none; }
  .nav__burger { display: flex; }
  .nav__mobile {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 0 var(--gutter) 24px;
    background-image:
      linear-gradient(rgba(20, 23, 28, 0.88), rgba(20, 23, 28, 0.88)),
      url('/images/nav-bg.jpg');
    background-size: cover;
    background-position: center;
  }
  .nav__mobile a {
    color: var(--bone-dim);
    text-decoration: none;
    font-size: 15px;
  }
  .nav__mobile a.router-link-active {
    color: var(--brass-bright);
  }

  .nav__mobile-logout {
    align-self: flex-start;
    background: none;
    border: none;
    font-family: inherit;
    color: var(--bone-dim);
    text-decoration: none;
    font-size: 15px;
    padding: 0;
    cursor: pointer;
  }

  .nav__mobile-logout:hover {
    color: var(--brass-bright);
  }
}
</style>