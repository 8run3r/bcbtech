/**
 * notify Edge Function
 * Sends notifications to Slack and/or Discord. Admin-only.
 *
 * ENV: SLACK_WEBHOOK_URL, DISCORD_WEBHOOK_URL
 */
import { corsHeaders, errRes, okRes, parseBody, requireAdmin, z } from "../_shared/auth.ts";

const SLACK_URL = Deno.env.get("SLACK_WEBHOOK_URL");
const DISCORD_URL = Deno.env.get("DISCORD_WEBHOOK_URL");

const FieldSchema = z.object({
  name: z.string().min(1).max(200),
  value: z.string().min(1).max(2000),
});

const BodySchema = z.object({
  channel: z.enum(["slack", "discord", "both"]),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(4000),
  color: z.union([z.string().regex(/^#?[0-9a-fA-F]{6}$/), z.number().int()]).optional(),
  fields: z.array(FieldSchema).max(20).optional(),
  draftId: z.string().uuid().optional(),
});

async function notifySlack(
  title: string,
  message: string,
  fields: { name: string; value: string }[] = []
) {
  if (!SLACK_URL) throw new Error("SLACK_WEBHOOK_URL not configured");

  const blocks = [
    { type: "header", text: { type: "plain_text", text: title } },
    { type: "section", text: { type: "mrkdwn", text: message } },
    ...fields.map((f) => ({
      type: "section",
      fields: [{ type: "mrkdwn", text: `*${f.name}*\n${f.value}` }],
    })),
    {
      type: "context",
      elements: [{ type: "mrkdwn", text: `🤖 COK Tech Admin • ${new Date().toLocaleString("sk-SK")}` }],
    },
  ];

  const res = await fetch(SLACK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocks, text: title }),
  });
  if (!res.ok) throw new Error(`Slack error: ${await res.text()}`);
}

async function notifyDiscord(
  title: string,
  message: string,
  color: string | number = 0x00ff94,
  fields: { name: string; value: string }[] = []
) {
  if (!DISCORD_URL) throw new Error("DISCORD_WEBHOOK_URL not configured");

  const colorInt = typeof color === "string" ? parseInt(color.replace("#", ""), 16) : color;

  const res = await fetch(DISCORD_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [{
        title,
        description: message.length > 2048 ? message.slice(0, 2045) + "..." : message,
        color: colorInt,
        fields: fields.map((f) => ({ name: f.name, value: f.value, inline: true })),
        footer: { text: "COK Tech Admin" },
        timestamp: new Date().toISOString(),
      }],
    }),
  });
  if (!res.ok) throw new Error(`Discord error: ${await res.text()}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });

  try {
    const { supabase } = await requireAdmin(req);
    const { channel, title, message, color, fields, draftId } = await parseBody(req, BodySchema);

    const results: string[] = [];

    if (channel === "slack" || channel === "both") {
      await notifySlack(title, message, fields);
      results.push("slack");
    }

    if (channel === "discord" || channel === "both") {
      await notifyDiscord(title, message, color, fields);
      results.push("discord");
    }

    if (draftId && results.length > 0) {
      await supabase
        .from("agent_drafts")
        .update({
          status: results.includes("slack") ? "sent_slack" : "sent_discord",
          updated_at: new Date().toISOString(),
        })
        .eq("id", draftId);
    }

    return okRes(req, { success: true, sent: results, message: `Notifikácia odoslaná: ${results.join(", ")}` });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("notify error:", e);
    return errRes(req, "Internal server error", 500);
  }
});
