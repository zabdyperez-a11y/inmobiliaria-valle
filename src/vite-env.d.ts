/// <reference types="vite/client" />
interface Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string; callMethod?: unknown; push?: unknown };
  _fbq?: unknown;
}
