import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueDevTools from 'vite-plugin-vue-devtools';
import { VitePWA } from 'vite-plugin-pwa';
import { compression } from 'vite-plugin-compression2';

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
    compression({
      algorithm: 'brotliCompress',
      threshold: 0, // Compress all files, no size threshold
      compressionOptions: {
        level: 11, // Maximum compression level for Brotli
      }
    }),
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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue';
            }
            if (id.includes('vue-router')) {
              return 'vue-router';
            }
            if (id.includes('vuex')) {
              return 'vuex';
            }
            if (id.includes('lodash')) {
              return 'lodash';
            }
            // Further split other node_modules packages
            const modules = ['axios', 'moment', 'chart.js', '@mlc-ai', 'web-llm']; // Add more packages as needed
            for (const module of modules) {
              if (id.includes(module)) {
                return module;
              }
            }
            return 'vendor';
          }
          // Split components into separate chunks
          if (id.includes('/src/components/')) {
            const dirs = id.split('/');
            const name = dirs[dirs.length - 2];
            return `component-${name}`;
          }

          if (id.includes('/src/views/')) {
            const dirs = id.split('/');
            const name = dirs[dirs.length - 2];
            return `view-${name}`;
          }

          if (id.includes('/src/libs/')) {
            const dirs = id.split('/');
            const name = dirs[dirs.length - 2];
            return `lib-${name}`;
          }
        }
      }
    },
    target: 'esnext', // Target modern browsers for smaller bundle size
    cssCodeSplit: true, // Enable CSS code splitting
    sourcemap: false, // Disable source maps for production build
    brotliSize: true, // Enable Brotli size reporting
    chunkSizeWarningLimit: 500 // Increase chunk size warning limit
  }
});
