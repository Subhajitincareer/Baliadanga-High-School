import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    },
    include: ['@supabase/supabase-js']
  },
  define: {
    __WS_TOKEN__: JSON.stringify(process.env.WS_TOKEN || 'development'),
  }
});
