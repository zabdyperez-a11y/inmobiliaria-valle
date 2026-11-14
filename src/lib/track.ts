/**
 * Eventos de conversión. GA4 y Meta Pixel se cargan solo después de que el visitante acepta.
 * Eventos: whatsapp_click, visit_form_submit, sell_form_submit, contact_form_submit, property_view, filter_used
 */
const GA4 = import.meta.env.VITE_GA4_ID as string | undefined;
const PIXEL = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
const CONSENT_KEY = 'iv_consent';

export const trackingConfigured = Boolean(GA4 || PIXEL);

export type Consent = 'granted' | 'denied' | null;

export function getConsent(): Consent {
  try {
    return (localStorage.getItem(CONSENT_KEY) as Consent) || null;
  } catch {
    return null;
  }
}

export function setConsent(value: 'granted' | 'denied') {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* sin almacenamiento */
  }
  if (value === 'granted') loadTrackers();
}

let loaded = false;
export function loadTrackers() {
  if (loaded || getConsent() !== 'granted') return;
  loaded = true;
  if (GA4) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA4);
  }
  if (PIXEL) {
    /* Código base de Meta Pixel, sin el <noscript>. */
    const f = window as Window;
    if (!f.fbq) {
      const n: any = function (...args: unknown[]) {
        n.callMethod ? n.callMethod(...args) : n.queue.push(args);
      };
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      f.fbq = n;
      f._fbq = n;
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(s);
    }
    f.fbq!('init', PIXEL);
    f.fbq!('track', 'PageView');
  }
}

const PIXEL_MAP: Record<string, string> = {
  whatsapp_click: 'Contact',
  visit_form_submit: 'Lead',
  sell_form_submit: 'Lead',
  contact_form_submit: 'Lead',
  property_view: 'ViewContent',
  filter_used: 'Search',
};

export function track(event: string, params: Record<string, string | number | undefined> = {}) {
  if (import.meta.env.DEV) console.info('[track]', event, params);
  if (!loaded) return;
  window.gtag?.('event', event, params);
  const std = PIXEL_MAP[event];
  if (std && window.fbq) {
    const fbParams: Record<string, unknown> = { content_name: params.slug ?? event, ...params };
    if (typeof params.price === 'number') {
      fbParams.value = params.price;
      fbParams.currency = 'MXN';
    }
    window.fbq('track', std, fbParams);
  }
}

export function trackPageView(path: string) {
  if (!loaded) return;
  if (GA4) window.gtag?.('event', 'page_view', { page_path: path, page_location: window.location.href });
  window.fbq?.('track', 'PageView');
}
