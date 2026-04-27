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
    // Chunking automático do Vite/Rollup.
    // Tentativas anteriores de manualChunks causaram erros de inicialização circular
    // ("Cannot access 'X' before initialization") em libs como recharts/d3 e suas deps
    // compartilhadas (lodash, react-smooth). Deixar o Rollup decidir é mais seguro.
    chunkSizeWarningLimit: 1500,
  },
}));
