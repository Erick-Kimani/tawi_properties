<template>
  <header class="nav">
    <div class="nav__inner">
      <RouterLink class="nav__mark" to="/">
        <span class="nav__mark-glyph">T</span>
        <span class="nav__mark-word">Tawi Properties</span>
      </RouterLink>

      <nav class="nav__links">
        <RouterLink to="/listings">Listings</RouterLink>
        <RouterLink to="/buy">Buy</RouterLink>
        <RouterLink to="/rent">Rent</RouterLink>
        <RouterLink to="/admin">Admin</RouterLink>
        <RouterLink to="/property-map">Map</RouterLink>
      </nav>

      <div class="nav__actions">
        <RouterLink class="nav__ghost" to="/signup">Sign in</RouterLink>
        <RouterLink class="nav__cta" to="/list-property">List a property</RouterLink>
      </div>

      <button class="nav__burger" @click="menuOpen = !menuOpen" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
    </div>

    <div class="nav__mobile" v-if="menuOpen">
      <RouterLink to="/listings" @click="menuOpen = false">Listings</RouterLink>
      <RouterLink to="/admin" @click="menuOpen = false">Admin</RouterLink>
      <RouterLink to="/buy" @click="menuOpen = false">Buy</RouterLink>
      <RouterLink to="/rent" @click="menuOpen = false">Rent</RouterLink>
      <RouterLink to="/property-map" @click="menuOpen = false">Map</RouterLink>
      <RouterLink class="nav__cta" to="/list-property" @click="menuOpen = false">List a property</RouterLink>
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'

const menuOpen = ref(false)
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

.nav__links a {
  color: var(--bone-dim);
  text-decoration: none;
  font-size: 14px;
  letter-spacing: 0.02em;
  padding: 7px 14px;
  border-radius: 3px;
  transition: color 0.2s ease, background 0.2s ease;
}

.nav__links a:hover { color: var(--bone); }

.nav__links a.router-link-active {
  color: var(--brass-bright);
  background: rgba(169, 129, 75, 0.12);
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
}
</style>