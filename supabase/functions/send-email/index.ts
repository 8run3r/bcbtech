/**
 * send-email Edge Function
 * Sends email via SendGrid API.
 *
 * ENV vars needed in Supabase Dashboard → Project Settings → Edge Functions:
 *   SENDGRID_API_KEY     — your SendGrid API key (starts with SG.)
 *   SENDGRID_FROM_EMAIL  — verified sender email (e.g. studio@coktech.tech)
 *   SENDGRID_FROM_NAME   — sender name (e.g. Bruno Cok / COK Tech)
 *
 * Request body:
 *   to: string          — recipient email
 *   toName?: string     — recipient name
 *   subject: string     — email subject
 *   body: string        — email body (plain text)
 *   html?: string       — optional HTML version
 *   draftId?: string    — agent_drafts.id to update status after send
 */

import { corsHeaders, errRes, okRes, requireAdmin } from "../_shared/auth.ts";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const FROM_EMAIL = Deno.env.get("SENDGRID_FROM_EMAIL") || "studio@coktech.tech";
const FROM_NAME = Deno.env.get("SENDGRID_FROM_NAME") || "Bruno Cok / COK Tech";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { supabase } = await requireAdmin(req);

    if (!SENDGRID_API_KEY) return errRes("SENDGRID_API_KEY not configured", 500);

    const { to, toName, subject, body, html, draftId } = await req.json();
    if (!to || !subject || !body) return errRes("Missing required fields: to, subject, body");

    const payload = {
      personalizations: [{ to: [{ email: to, name: toName || to }] }],
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      content: [
        { type: "text/plain", value: body },
        ...(html ? [{ type: "text/html", value: html }] : []),
      ],
    };

    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      return errRes(`SendGrid error: ${err}`, 502);
    }

    // Update draft status if draftId provided
    if (draftId) {
      await supabase
        .from("agent_drafts")
        .update({ status: "sent_email", updated_at: new Date().toISOString() })
        .eq("id", draftId);
    }

    return okRes({ success: true, message: `Email odoslaný na ${to}` });
  } catch (e) {
    if (e instanceof Response) return e;
    return errRes("Internal server error", 500);
  }
});
