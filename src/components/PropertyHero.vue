<template>
  <section class="hero">
    <div class="hero__stage">
      <div class="hero__row">
        <div
          v-for="(panel, i) in panels"
          :key="panel.id"
          class="hero__panel"
          :style="{
            clipPath: panel.clip,
            marginRight: i < panels.length - 1 ? '-' + skew + 'px' : '0',
            zIndex: panels.length - i,
            backgroundImage: `url(${panel.image})`
          }"
        >
          <span class="hero__tag">{{ panel.label }}</span>
        </div>
      </div>

      <div class="hero__copy">
        <p class="hero__eyebrow">Nairobi &amp; environs</p>
        <h1 class="hero__headline">Addresses,<br />framed properly.</h1>
        <p class="hero__sub">Verified listings across Karen, Kilimani, Westlands and beyond — photographed the way an agent would want them seen.</p>
        <a class="hero__cta" href="/listings">Browse listings</a>
      </div>
    </div>
  </section>
</template>

<script setup>
const skew = 64

const panels = [
  {
    id: 1,
    label: 'Karen',
    image: '/images/Picture2.jpg',
    clip: `polygon(0 0, 100% 0, calc(100% - ${skew}px) 100%, 0 100%)`
  },
  {
    id: 2,
    label: 'Kilimani',
    image: 'public/images/Picture1.jpg',
    clip: `polygon(${skew}px 0, 100% 0, calc(100% - ${skew}px) 100%, 0 100%)`
  },
  {
    id: 3,
    label: 'Westlands',
    image:'/images/Picture7.jpg',
    clip: `polygon(${skew}px 0, 100% 0, 100% 100%, 0 100%)`
  }
]
</script>

<style scoped>
.hero {
  position: relative;
  background: var(--ink);
}

.hero__stage {
  position: relative;
  height: clamp(420px, 72vh, 760px);
  width: 100%;
  overflow: hidden;
}

.hero__row {
  display: flex;
  height: 100%;
  width: 100%;
}

.hero__panel {
  position: relative;
  flex: 1 1 0;
  height: 100%;
  background-color: var(--ink-soft);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.hero__tag {
  position: relative;
  margin-bottom: 22px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--bone);
  padding: 4px 10px;
  border: 1px solid rgba(237, 231, 218, 0.35);
  background: rgba(20, 23, 28, 0.4);
}

.hero__copy {
  position: absolute;
  left: var(--gutter);
  bottom: 56px;
  max-width: 420px;
  z-index: 10;
}

.hero__eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brass-bright);
  margin: 0 0 12px;
}

.hero__headline {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(32px, 5vw, 52px);
  line-height: 1.05;
  color: var(--bone);
  margin: 0 0 16px;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.5);
}

.hero__sub {
  font-size: 15px;
  line-height: 1.6;
  color: var(--bone-dim);
  margin: 0 0 24px;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
}

.hero__cta {
  display: inline-block;
  background: var(--brass);
  color: var(--ink);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  padding: 13px 26px;
}

@media (max-width: 720px) {
  .hero__row { flex-direction: column; }
  .hero__panel { clip-path: none !important; margin-right: 0 !important; height: 33.33%; }
  .hero__copy {
    left: 20px;
    right: 20px;
    bottom: 32px;
    max-width: none;
  }
  .hero__headline { font-size: 30px; }
}
</style>