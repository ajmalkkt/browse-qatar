import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === "development" ? "/" : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
  },
  plugins: [
    react(),
    tempo(),
    visualizer({ open: false }), // This will open a chart in your browser on build
  ],
  build: {
    // Increase the warning limit slightly (default is 500kb)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            
            // 1. Core React (Stable, rarely changes)
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('react-router-dom')
            ) {
              return 'react-vendor';
            }

            // 2. Firebase (Very Large - keep separate)
            if (id.includes('firebase') || id.includes('@firebase')) {
              return 'firebase-vendor';
            }

            // 3. Supabase (Keep separate from Firebase and App code)
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }

            // 4. Framer Motion (Heavy animation library)
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }

            // 5. Radix UI (Group all primitives together to avoid hundreds of tiny chunks)
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }

            // 6. Date Libraries (Date-fns, React Datepicker, Day Picker)
            if (
              id.includes('date-fns') ||
              id.includes('react-datepicker') ||
              id.includes('react-day-picker')
            ) {
              return 'date-utils';
            }

            // 7. Form & Validation (Hook Form, Zod, Resolvers)
            if (
              id.includes('react-hook-form') ||
              id.includes('@hookform') ||
              id.includes('zod')
            ) {
              return 'form-vendor';
            }
          }
        },
      },
    },
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: true,
  }
});
