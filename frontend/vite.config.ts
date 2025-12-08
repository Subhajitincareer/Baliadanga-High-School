/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/',
  server: {
    host: '::',
    port: 8080,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: ['react-is', 'recharts'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      target: 'esnext',
    },
  },
  define: {
    __WS_TOKEN__: JSON.stringify(process.env.WS_TOKEN ?? 'development'),
  },

  // Vitest Configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts', // .ts extension
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
