<script setup>
import { RouterView, useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

const route = useRoute()
</script>

<template>
  <div id="app">
    <Navbar />
    <main class="app__main">
      <RouterView />
    </main>
    <!-- The footer will now hide automatically on the map view -->
    <Footer v-if="route.name !== 'property-map'" />
  </div>
</template>

<style>
@import './styles/tokens.css';

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app__main {
  flex: 1;
}
</style>
