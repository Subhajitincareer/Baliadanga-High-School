import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/Baliadanga-High-School/", // Important for GitHub Pages under subpath
  server: {
    host: "::", // Bind to all IPv6 and IPv4 interfaces for local network access
    port: 8080,
  },
  plugins: [
    react(),       // React SWC plugin for fast builds
    tailwindcss(), // Tailwind CSS plugin
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Alias "@" to "./src"
    },
  },
  build: {
    target: "esnext", // Modern JS output, suitable for evergreen browsers
    commonjsOptions: {
      transformMixedEsModules: true, // Handle mixed ESM and CommonJS modules
    },
    // Optional: You can add rollupOptions if needed for advanced tweaking
  },
  optimizeDeps: {
    include: ["@supabase/supabase-js"], // Pre-bundle Supabase for faster dev
    esbuildOptions: {
      define: {
        global: "globalThis", // Fix "global" not defined errors in some dependencies
      },
      target: "esnext", // Keep optimized deps targeting modern JS
    },
  },
  define: {
    // Inject environment variable WS_TOKEN or default to 'development'
    __WS_TOKEN__: JSON.stringify(process.env.WS_TOKEN ?? "development"),
  },
});
