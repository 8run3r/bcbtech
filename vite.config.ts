import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "@react-three/fiber", "@react-three/drei"],
          "framer-motion": ["framer-motion"],
          vendor: ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js", "@supabase/ssr"],
          query: ["@tanstack/react-query"],
          icons: ["lucide-react"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          charts: ["recharts"],
        },
      },
    },
  },
});
