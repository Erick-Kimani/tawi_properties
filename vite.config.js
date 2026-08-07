import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    // MapLibre GL v6's tile-parsing worker can fail to bundle during
    // Vite's dependency pre-bundling step in dev mode. Excluding it here
    // avoids that failure mode.
    exclude: ['maplibre-gl'],
  },
})