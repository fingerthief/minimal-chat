import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueDevTools from 'vite-plugin-vue-devtools';
import { VitePWA } from 'vite-plugin-pwa';
import { compression } from 'vite-plugin-compression2'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueDevTools(),
    VitePWA({
      registerType: "autoUpdate", injectRegister: "auto",
      workbox: {
        maximumFileSizeToCacheInBytes: 8000000
      }
    }),
    compression({ algorithm: 'brotliCompress', threshold: 512 })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    minify: 'terser', // Use Terser for more advanced minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs for smaller bundle size
        drop_debugger: true, // Remove debugger statements
        ecma: 2020, // Use modern ECMAScript features
        module: true,
        toplevel: true,
        passes: 10 // Multiple passes for better compression
      },
      format: {
        comments: false // Remove comments
      }
    },
    target: 'esnext', // Target modern browsers for smaller bundle size
    cssCodeSplit: true, // Enable CSS code splitting
    sourcemap: false, // Disable source maps for production build
    brotliSize: true, // Enable Brotli size reporting
    chunkSizeWarningLimit: 500 // Increase chunk size warning limit
  }
});
