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

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </HelmetProvider>
);
