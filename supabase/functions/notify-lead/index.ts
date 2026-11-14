// Supabase Edge Function: manda un correo a info@inmobiliariavalle.com con cada lead nuevo.
// Se conecta con un Database Webhook (tabla leads, evento INSERT). Ver README.
// Secretos: RESEND_API_KEY, NOTIFY_TO (opcional), NOTIFY_FROM, WEBHOOK_SECRET.

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const TO = Deno.env.get('NOTIFY_TO') ?? 'info@inmobiliariavalle.com';
const FROM = Deno.env.get('NOTIFY_FROM') ?? 'Página web <avisos@inmobiliariavalle.com>';
const SECRET = Deno.env.get('WEBHOOK_SECRET');
const SITE = Deno.env.get('SITE_URL') ?? 'https://inmobiliariavalle.com';

const TIPO: Record<string, string> = { visita: 'Quiere visitar una casa', vender: 'Quiere vender su casa', contacto: 'Mensaje de contacto' };
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

Deno.serve(async (req) => {
  if (SECRET && req.headers.get('x-webhook-secret') !== SECRET) return new Response('forbidden', { status: 403 });
  const { record: l } = await req.json();
  if (!l) return new Response('sin datos', { status: 400 });

  const datos = Object.entries(l.datos ?? {})
    .filter(([k, v]) => v != null && v !== '' && k !== 'fotos')
    .map(([k, v]) => `<tr><td style="color:#5B6B70;padding:2px 12px 2px 0">${esc(k.replace(/_/g, ' '))}</td><td>${esc(v)}</td></tr>`)
    .join('');
  const fotos = Array.isArray(l.datos?.fotos) && l.datos.fotos.length ? `<p>Mandó ${l.datos.fotos.length} fotos. Velas en el panel.</p>` : '';
  const wa = `https://wa.me/${String(l.whatsapp).replace(/\D/g, '')}`;
  const origen = [l.utm_source, l.utm_medium, l.utm_campaign].filter(Boolean).join(' / ') || 'directo';

  const html = `
    <div style="font-family:Arial,sans-serif;color:#14262B;font-size:15px;line-height:1.5">
      <h2 style="color:#0B4F5C;margin:0 0 8px">${esc(TIPO[l.tipo] ?? l.tipo)}</h2>
      <p style="margin:0"><strong>${esc(l.nombre)}</strong> · <a href="${wa}">${esc(l.whatsapp)}</a></p>
      <table style="margin:12px 0">${datos}</table>
      ${fotos}
      <p style="color:#5B6B70;font-size:13px">Origen: ${esc(origen)} · Página: ${esc(l.pagina_origen)}</p>
      <p><a href="${wa}" style="background:#25D366;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:bold">Escribirle por WhatsApp</a></p>
      <p><a href="${SITE}/admin/leads">Ver todos los leads</a></p>
    </div>`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [TO], subject: `${TIPO[l.tipo] ?? 'Nuevo lead'}: ${l.nombre}`, html }),
  });
  return new Response(await r.text(), { status: r.ok ? 200 : 502 });
});
