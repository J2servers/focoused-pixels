import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Code-splitting agressivo: separa libs pesadas do bundle principal.
    // Isso reduz o JS inicial de ~836kB para ~250-300kB e acelera trocas de página.
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;

          // Vendors core — sempre carregados, mas em chunk próprio (cacheável)
          if (id.includes('react/') || id.includes('react-dom/') || id.includes('scheduler/')) {
            return 'vendor-react';
          }
          if (id.includes('react-router')) return 'vendor-router';
          if (id.includes('@tanstack/react-query')) return 'vendor-query';
          if (id.includes('@supabase')) return 'vendor-supabase';

          // Radix UI — pesado, só páginas com modais/dialogs precisam
          if (id.includes('@radix-ui')) return 'vendor-radix';

          // Ícones — ~70kB sozinho
          if (id.includes('lucide-react')) return 'vendor-icons';

          // Charts (recharts/d3) — NÃO separar: causa erro de inicialização circular.
          // Deixar cair em vendor-misc junto com suas deps.

          // Forms / validation
          if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
            return 'vendor-forms';
          }

          // Date utils
          if (id.includes('date-fns')) return 'vendor-date';

          // Outras libs em chunk separado
          return 'vendor-misc';
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
}));
