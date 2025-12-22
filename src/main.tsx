import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Import polyfills for browser compatibility
import "./lib/polyfills.ts";

// Initialize critical systems synchronously
import { initSentry } from "./lib/sentry";
initSentry();

// Defer non-critical initialization until after first render
const initializeNonCritical = () => {
  // Initialize logger (deferred)
  import("./lib/logger").then(({ logger }) => {
    logger.info('Application starting', {
      environment: import.meta.env.MODE,
      version: import.meta.env.VITE_APP_VERSION || 'unknown',
    });
  });

  // Initialize monitoring (deferred)
  import('./lib/monitoring').then(({ monitor }) => {
    monitor.trackMetric('app_start', 1, { environment: import.meta.env.MODE });
  });
};

// Initialize after first paint
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    initializeNonCritical();
  } else {
    window.addEventListener('load', initializeNonCritical, { once: true });
  }
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(<App />);
