import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueDevTools from 'vite-plugin-vue-devtools';
import { VitePWA } from 'vite-plugin-pwa';
import { compression } from 'vite-plugin-compression2';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Get the directory name in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Recursive function to get all image files in a directory and its subdirectories
const getAllImageFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllImageFiles(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
};

// Function to generate icons array from images directory
const generateIcons = async () => {
  const imagesDir = path.resolve(__dirname, 'public/images');
  const files = getAllImageFiles(imagesDir);
  const icons = await Promise.all(files.map(async (file) => {
    try {
      const metadata = await sharp(file).metadata();
      const { width, height, format } = metadata;
      if (width === height && format === 'png') {
        const icon = {
          src: path.relative(path.resolve(__dirname, 'public'), file).replace(/\\/g, '/'),
          sizes: `${width}x${height}`,
          type: 'image/png'
        };
        if (file.includes('maskable')) {
          icon.purpose = 'maskable';
        }
        return icon;
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }));
  return icons.filter(Boolean);
};

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    vue(),
    VueDevTools(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        maximumFileSizeToCacheInBytes: 8000000,
      },
      manifest: {
        name: 'MinimalChat',
        short_name: 'MinimalChat',
        description: 'A minimal but powerful LLM chat application',
        theme_color: '#202124',
        background_color: "#202124",
        icons: await generateIcons(),
      },
    }),
    compression({
      algorithm: 'gzip',
      threshold: 0, // Compress all files, no size threshold
    }),
    compression({
      algorithm: 'brotliCompress',
      threshold: 0, // Compress all files, no size threshold
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
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
        passes: 10, // Multiple passes for better compression
      },
      format: {
        comments: false, // Remove comments
      },
    },
    target: 'esnext', // Target modern browsers for smaller bundle size
    cssCodeSplit: true, // Enable CSS code splitting
    sourcemap: false, // Disable source maps for production build
    chunkSizeWarningLimit: 500, // Increase chunk size warning limit
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
          if (id.includes('/src/components/')) {
            return 'components';
          }
          if (id.includes('/src/libs/')) {
            return 'libs';
          }
        },
      },
    },
  },
}));
