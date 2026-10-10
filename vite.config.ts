import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rollupOptions: {
      output: {
        // Libraries change far less often than our own code, so keeping them
        // in their own files lets returning visitors reuse the cached copies.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler|@remix-run)\//.test(id)) return 'react';
          if (/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(id)) return 'motion';
          if (/node_modules\/(@supabase|tslib|iceberg-js)\//.test(id)) return 'supabase';
          if (/node_modules\/(@radix-ui|@floating-ui|sonner|aria-hidden|react-remove-scroll|react-remove-scroll-bar|react-style-singleton|use-callback-ref|use-sidecar)\//.test(id)) return 'ui';
          return undefined;
        },
      },
    },
  },
});
