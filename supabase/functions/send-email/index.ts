/**
 * send-email Edge Function
 * Sends email via SendGrid API. Admin-only.
 *
 * ENV (Supabase Dashboard → Edge Functions → Secrets):
 *   SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME
 */
import { corsHeaders, errRes, okRes, parseBody, requireAdmin, z } from "../_shared/auth.ts";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const FROM_EMAIL = Deno.env.get("SENDGRID_FROM_EMAIL") || "studio@coktech.tech";
const FROM_NAME = Deno.env.get("SENDGRID_FROM_NAME") || "Bruno Cok / COK Tech";

const BodySchema = z.object({
  to: z.string().email(),
  toName: z.string().max(200).optional(),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(50_000),
  html: z.string().max(100_000).optional(),
  draftId: z.string().uuid().optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });

  try {
    const { supabase } = await requireAdmin(req);
    if (!SENDGRID_API_KEY) return errRes(req, "SENDGRID_API_KEY not configured", 500);

    const { to, toName, subject, body, html, draftId } = await parseBody(req, BodySchema);

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
      console.error("SendGrid error:", await res.text());
      return errRes(req, "Email provider error", 502);
    }

    if (draftId) {
      await supabase
        .from("agent_drafts")
        .update({ status: "sent_email", updated_at: new Date().toISOString() })
        .eq("id", draftId);
    }

    return okRes(req, { success: true, message: `Email odoslaný na ${to}` });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("send-email error:", e);
    return errRes(req, "Internal server error", 500);
  }
});
