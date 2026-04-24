/**
 * on-new-record Edge Function
 * Triggered by Supabase Database Webhooks on INSERT to contact_messages / reservations.
 * Sends email notification via Resend + optional Telegram message.
 *
 * ENV vars (Supabase Dashboard → Edge Functions → Secrets):
 *   RESEND_API_KEY       — from resend.com (free tier = 100 emails/day)
 *   NOTIFY_EMAIL         — your email address to receive notifications
 *   TELEGRAM_BOT_TOKEN   — (optional) Telegram bot token
 *   TELEGRAM_CHAT_ID     — (optional) your Telegram chat ID
 */

const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFY_EMAIL = Deno.env.get("NOTIFY_EMAIL") || "studio@coktech.tech";
const TG_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TG_CHAT = Deno.env.get("TELEGRAM_CHAT_ID");

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: Record<string, unknown>;
  schema: string;
  old_record: Record<string, unknown> | null;
}

/* ── Email via Resend ── */
async function sendEmail(subject: string, html: string) {
  if (!RESEND_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "CokTech <onboarding@resend.dev>",
      to: [NOTIFY_EMAIL],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
  }
}

/* ── Telegram ── */
async function sendTelegram(text: string) {
  if (!TG_TOKEN || !TG_CHAT) return;

  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TG_CHAT,
      text,
      parse_mode: "HTML",
    }),
  });
}

/* ── Format contact message ── */
function formatContact(r: Record<string, unknown>) {
  const name = r.name || "—";
  const email = r.email || "—";
  const pkg = r.package_name || r.package_category || "—";
  const msg = r.message || "—";
  const budget = r.budget || "—";

  const html = `
    <div style="font-family:system-ui;max-width:500px;margin:0 auto;padding:20px;background:#f8f9fa;border-radius:8px">
      <h2 style="color:#0078d7;margin:0 0 16px">📩 Nová správa</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#666;width:100px"><strong>Meno</strong></td><td>${name}</td></tr>
        <tr><td style="padding:6px 0;color:#666"><strong>Email</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:6px 0;color:#666"><strong>Balíček</strong></td><td>${pkg}</td></tr>
        <tr><td style="padding:6px 0;color:#666"><strong>Budget</strong></td><td>${budget}</td></tr>
        <tr><td style="padding:6px 0;color:#666"><strong>Správa</strong></td><td>${msg}</td></tr>
      </table>
      <hr style="margin:16px 0;border:none;border-top:1px solid #ddd">
      <small style="color:#999">CokTech Admin • ${new Date().toLocaleString("sk-SK")}</small>
    </div>`;

  const tg = `📩 <b>Nová správa</b>\n\n👤 ${name}\n📧 ${email}\n📦 ${pkg}\n💰 ${budget}\n💬 ${msg}`;

  return { subject: `Nová správa od ${name}`, html, tg };
}

/* ── Format reservation ── */
function formatReservation(r: Record<string, unknown>) {
  const name = r.name || "—";
  const email = r.email || "—";
  const phone = r.phone || "—";
  const service = r.service || "—";
  const date = r.date || "—";
  const note = r.note || "—";

  const html = `
    <div style="font-family:system-ui;max-width:500px;margin:0 auto;padding:20px;background:#f8f9fa;border-radius:8px">
      <h2 style="color:#00875a;margin:0 0 16px">📅 Nová rezervácia</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#666;width:100px"><strong>Meno</strong></td><td>${name}</td></tr>
        <tr><td style="padding:6px 0;color:#666"><strong>Email</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:6px 0;color:#666"><strong>Telefón</strong></td><td>${phone}</td></tr>
        <tr><td style="padding:6px 0;color:#666"><strong>Služba</strong></td><td>${service}</td></tr>
        <tr><td style="padding:6px 0;color:#666"><strong>Dátum</strong></td><td>${date}</td></tr>
        <tr><td style="padding:6px 0;color:#666"><strong>Poznámka</strong></td><td>${note}</td></tr>
      </table>
      <hr style="margin:16px 0;border:none;border-top:1px solid #ddd">
      <small style="color:#999">CokTech Admin • ${new Date().toLocaleString("sk-SK")}</small>
    </div>`;

  const tg = `📅 <b>Nová rezervácia</b>\n\n👤 ${name}\n📧 ${email}\n📱 ${phone}\n🔧 ${service}\n📆 ${date}\n📝 ${note}`;

  return { subject: `Nová rezervácia — ${name}`, html, tg };
}

/* ── Main handler ── */
Deno.serve(async (req) => {
  // Database webhooks don't need CORS or auth — they come from Supabase internally
  try {
    const payload: WebhookPayload = await req.json();
    const { table, record } = payload;

    let formatted: { subject: string; html: string; tg: string };

    if (table === "contact_messages") {
      formatted = formatContact(record);
    } else if (table === "reservations") {
      formatted = formatReservation(record);
    } else {
      return new Response(JSON.stringify({ skip: true, reason: `Unknown table: ${table}` }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Send both in parallel
    await Promise.allSettled([
      sendEmail(formatted.subject, formatted.html),
      sendTelegram(formatted.tg),
    ]);

    return new Response(JSON.stringify({ success: true, table }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook handler error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
