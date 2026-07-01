/**
 * on-new-record Edge Function
 * Triggered by Supabase Database Webhooks on INSERT to contact_messages / reservations.
 * Sends email notification via Resend + optional Telegram message.
 *
 * Database webhooks come from Supabase server-to-server, so no CORS / no admin JWT.
 *
 * ENV: RESEND_API_KEY, NOTIFY_EMAIL, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 */
import { escapeHtml } from "../_shared/auth.ts";

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
    console.error("Resend error:", await res.text());
  }
}

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

function formatContact(r: Record<string, unknown>) {
  const name = escapeHtml(r.name);
  const email = escapeHtml(r.email);
  const pkg = escapeHtml(r.package_name || r.package_category);
  const msg = escapeHtml(r.message);
  const budget = escapeHtml(r.budget);

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

function formatReservation(r: Record<string, unknown>) {
  const name = escapeHtml(r.name);
  const email = escapeHtml(r.email);
  const phone = escapeHtml(r.phone);
  const service = escapeHtml(r.service);
  const date = escapeHtml(r.date);
  const note = escapeHtml(r.note);

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

Deno.serve(async (req) => {
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
    return new Response(JSON.stringify({ error: "handler_error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
