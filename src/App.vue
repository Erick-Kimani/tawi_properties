<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div id="app">
    <Navbar />
    <main class="app__main">
      <RouterView />
    </main>
    <Footer />
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