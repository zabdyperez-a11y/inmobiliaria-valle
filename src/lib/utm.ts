const KEY = 'iv_utm';
const FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
export type Utm = Partial<Record<(typeof FIELDS)[number], string>>;

/** Guarda los UTM de la primera visita que los traiga (Facebook, Instagram, TikTok…). */
export function captureUtm() {
  try {
    const params = new URLSearchParams(window.location.search);
    const found: Utm = {};
    for (const f of FIELDS) {
      const v = params.get(f);
      if (v) found[f] = v.slice(0, 200);
    }
    if (Object.keys(found).length) sessionStorage.setItem(KEY, JSON.stringify(found));
    // Facebook agrega fbclid sin UTM: lo marcamos para no perder el origen.
    else if (params.get('fbclid') && !sessionStorage.getItem(KEY))
      sessionStorage.setItem(KEY, JSON.stringify({ utm_source: 'facebook', utm_medium: 'social' }));
  } catch {
    /* almacenamiento bloqueado: seguimos sin UTM */
  }
}

export function getUtm(): Utm {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}
