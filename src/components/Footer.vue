<template>
  <footer class="footer">
    <div class="footer__ambient" aria-hidden="true"></div>
    <div class="footer__glow" aria-hidden="true"></div>

    <svg
      class="footer__skyline"
      viewBox="0 0 1000 140"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <g class="building">
        <rect x="30" y="60" width="50" height="80" />
        <rect class="win" x="40" y="72" width="5" height="7" />
        <rect class="win" x="53" y="72" width="5" height="7" />
        <rect class="win" x="40" y="90" width="5" height="7" />
        <rect class="win" x="53" y="90" width="5" height="7" />
      </g>
      <g class="building">
        <rect x="90" y="40" width="36" height="100" />
        <rect class="win" x="98" y="52" width="5" height="7" />
        <rect class="win" x="110" y="52" width="5" height="7" />
        <rect class="win" x="98" y="70" width="5" height="7" />
        <rect class="win" x="110" y="88" width="5" height="7" />
      </g>
      <g class="building">
        <rect x="880" y="45" width="40" height="95" />
        <rect class="win" x="890" y="58" width="5" height="7" />
        <rect class="win" x="903" y="58" width="5" height="7" />
        <rect class="win" x="890" y="78" width="5" height="7" />
      </g>
      <g class="building">
        <rect x="930" y="65" width="48" height="75" />
        <rect class="win" x="940" y="78" width="5" height="7" />
        <rect class="win" x="954" y="78" width="5" height="7" />
        <rect class="win" x="940" y="96" width="5" height="7" />
      </g>
    </svg>

    <div class="footer__inner">
      <div class="footer__brand">
        <RouterLink class="footer__mark" to="/">
          <span class="footer__mark-glyph">T</span>
          <span class="footer__mark-word">Tawi Properties</span>
        </RouterLink>
        <p class="footer__tagline">Find, list, and manage property across Kenya.</p>
      </div>

      <nav class="footer__col">
        <p class="footer__heading">Explore</p>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/buy">Buy</RouterLink>
        <RouterLink to="/rent">Rent</RouterLink>
        <RouterLink to="/property-map">Map</RouterLink>
      </nav>

        <nav class="footer__col">
        <p class="footer__heading">Account</p>
        <RouterLink v-if="!authStore.isAuthenticated" to="/login">Login</RouterLink>
        <RouterLink v-if="!authStore.isAuthenticated" to="/signup">Sign up</RouterLink>
        <button
          v-else
          type="button"
          class="footer__logout"
          @click="handleLogout"
        >
          {{ loggingOut ? 'Logging out…' : 'Logout' }}
        </button>
        
        <!-- Add the v-if condition right here -->
        <RouterLink v-if="authStore.user?.role?.slug === 'administrator'" to="/admin">Admin</RouterLink>
        <RouterLink to="/contact">Contact</RouterLink>
      </nav>


      <nav class="footer__col">
        <p class="footer__heading">List with us</p>
        <RouterLink to="/list-property">List a property</RouterLink>
      </nav>
    </div>

    <div class="footer__divider" aria-hidden="true">
      <svg viewBox="0 0 240 16" class="footer__chevrons">
        <path d="M0 8 L8 0 L16 8 L8 16 Z" />
        <path d="M20 8 L28 0 L36 8 L28 16 Z" />
        <path d="M40 8 L48 0 L56 8 L48 16 Z" />
        <path d="M60 8 L68 0 L76 8 L68 16 Z" />
        <path d="M80 8 L88 0 L96 8 L88 16 Z" />
        <path d="M100 8 L108 0 L116 8 L108 16 Z" />
        <path d="M120 8 L128 0 L136 8 L128 16 Z" />
        <path d="M140 8 L148 0 L156 8 L148 16 Z" />
        <path d="M160 8 L168 0 L176 8 L168 16 Z" />
        <path d="M180 8 L188 0 L196 8 L188 16 Z" />
        <path d="M200 8 L208 0 L216 8 L208 16 Z" />
        <path d="M220 8 L228 0 L236 8 L228 16 Z" />
      </svg>
    </div>

    <div class="footer__bottom">
      <p>&copy; {{ year }} Tawi Properties. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loggingOut = ref(false)
const year = new Date().getFullYear()

async function handleLogout() {
  if (loggingOut.value) return
  loggingOut.value = true

  // Once this resolves, authStore.isAuthenticated flips to false so the
  // Logout button itself is removed from the footer, and we send the
  // user on to the login page.
  await authStore.logout()
  loggingOut.value = false
  router.push('/login')
}
</script>

<style scoped>
.footer {
  position: relative;
  overflow: hidden;
  background: var(--ink-soft);
  border-top: 1px solid rgba(169, 129, 75, 0.25);
  color: var(--bone-dim);
}

/* thin brass hairline glow sitting right on the top border */
.footer::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(209, 178, 127, 0.7) 20%,
    rgba(53, 41, 20, 0.9) 50%,
    rgba(209, 178, 127, 0.7) 80%,
    transparent
  );
}

/* faint repeating diagonal line texture, echoes the auth pages */
.footer__ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    115deg,
    rgba(224, 134, 15, 0.035) 0px,
    rgba(169, 129, 75, 0.035) 1px,
    transparent 1px,
    transparent 34px
  );
}

/* soft ambient colour blooms for depth */
.footer__glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 520px 320px at 12% 0%, rgba(169, 129, 75, 0.1), transparent 60%),
    radial-gradient(ellipse 480px 340px at 92% 100%, rgba(124, 154, 114, 0.08), transparent 65%);
}

/* faint skyline silhouette along the very top edge of the footer */
.footer__skyline {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 90px;
  pointer-events: none;
  opacity: 0.5;
}

.footer__skyline .building rect:first-child {
  fill: rgba(169, 129, 75, 0.08);
}

.footer__skyline .win {
  fill: rgba(201, 160, 106, 0.4);
  animation: footer-win-twinkle 6s ease-in-out infinite;
}

.footer__skyline .win:nth-child(odd) { animation-delay: 0.6s; }
.footer__skyline .win:nth-child(3n) { animation-delay: 1.8s; }
.footer__skyline .win:nth-child(4n) { animation-delay: 3s; }

@keyframes footer-win-twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.85; }
}

.footer__inner {
  position: relative;
  z-index: 1;
  max-width: 1320px;
  margin: 0 auto;
  padding: 56px var(--gutter) 32px;
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
  gap: 32px;
}

.footer__brand {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer__mark {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.footer__mark-glyph {
  position: relative;
  width: 28px;
  height: 28px;
  border: 1px solid var(--brass);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 15px;
  color: var(--brass-bright);
  transition: box-shadow 0.3s ease;
}

.footer__mark-glyph::after {
  content: '';
  position: absolute;
  inset: -5px;
  border: 1px solid rgba(169, 129, 75, 0.25);
  border-radius: 2px;
}

.footer__mark:hover .footer__mark-glyph {
  box-shadow: 0 0 14px rgba(169, 129, 75, 0.35);
}

.footer__mark-word {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 500;
  color: var(--bone);
}

.footer__tagline {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--bone-dim);
  max-width: 30ch;
}

.footer__col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer__heading {
  margin: 0 0 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brass-bright);
}

.footer__col a,
.footer__logout {
  color: var(--bone-dim);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
  width: fit-content;
}

.footer__col a:hover,
.footer__logout:hover {
  color: var(--bone);
}

.footer__logout {
  background: none;
  border: none;
  font-family: inherit;
  padding: 0;
  cursor: pointer;
  text-align: left;
}

.footer__logout:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.footer__divider {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  padding: 4px 0 20px;
}

.footer__chevrons {
  width: 240px;
  height: 16px;
  overflow: visible;
}

.footer__chevrons path {
  fill: none;
  stroke: rgba(169, 129, 75, 0.35);
  stroke-width: 1;
}

.footer__chevrons path:nth-child(6n + 3) {
  fill: rgba(169, 129, 75, 0.3);
}

.footer__bottom {
  position: relative;
  z-index: 1;
  border-top: 1px solid rgba(169, 129, 75, 0.15);
  padding: 18px var(--gutter);
  text-align: center;
}

.footer__bottom p {
  margin: 0;
  font-size: 12px;
  color: var(--bone-dim);
  opacity: 0.7;
}

@media (max-width: 860px) {
  .footer__inner {
    grid-template-columns: 1fr 1fr;
  }

  .footer__brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 500px) {
  .footer__inner {
    grid-template-columns: 1fr;
  }
}
</style>