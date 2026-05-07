import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { initMonitoring } from "./lib/monitoring";
import { ErrorBoundary } from "./components/ErrorBoundary";

// One-time PII migration: purge legacy plaintext localStorage keys (Wave 4)
try {
  const legacyKeys = ['pdl_abandoned_cart_contact'];
  for (const k of Object.keys(localStorage)) {
    if (legacyKeys.includes(k) || k.startsWith('pdl_checkout_profile_')) {
      localStorage.removeItem(k);
    }
  }
} catch { /* ignore */ }

initMonitoring();

// Auto-recover from stale chunks after deploy.
// When index.html is cached but JS hashes changed, dynamic import() fails.
// We force ONE reload (with cache bust) so user lands on fresh assets.
const CHUNK_RELOAD_KEY = '__pdl_chunk_reloaded_at';
function isChunkLoadError(reason: unknown): boolean {
  const msg = (reason as { message?: string } | null)?.message || String(reason || '');
  return /Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError|error loading dynamically imported module/i.test(msg);
}
function recoverFromStaleChunk(): void {
  try {
    const last = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) || 0);
    if (Date.now() - last < 30_000) return; // avoid reload loop
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
  } catch { /* ignore */ }
  const url = new URL(window.location.href);
  url.searchParams.set('_r', Date.now().toString(36));
  window.location.replace(url.toString());
}
window.addEventListener('error', (e) => {
  if (isChunkLoadError(e.error) || isChunkLoadError(e.message)) recoverFromStaleChunk();
});
window.addEventListener('unhandledrejection', (e) => {
  if (isChunkLoadError(e.reason)) recoverFromStaleChunk();
});
window.addEventListener('vite:preloadError', () => recoverFromStaleChunk());

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </HelmetProvider>
);
