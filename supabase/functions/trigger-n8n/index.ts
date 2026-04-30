/**
 * trigger-n8n Edge Function
 * Triggers an n8n workflow via webhook. Admin-only.
 *
 * ENV: N8N_WEBHOOK_URL, N8N_API_KEY (optional bearer)
 */
import { corsHeaders, errRes, okRes, parseBody, requireAdmin, z } from "../_shared/auth.ts";

const N8N_URL = Deno.env.get("N8N_WEBHOOK_URL");
const N8N_KEY = Deno.env.get("N8N_API_KEY");

const BodySchema = z.object({
  workflowId: z.string().max(200).optional(),
  agentId: z.string().min(1).max(100),
  agentName: z.string().min(1).max(200),
  input: z.string().max(60_000),
  output: z.string().min(1).max(60_000),
  metadata: z.record(z.unknown()).optional(),
  draftId: z.string().uuid().optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });

  try {
    const { supabase } = await requireAdmin(req);
    if (!N8N_URL) return errRes(req, "N8N_WEBHOOK_URL not configured", 500);

    const { workflowId, agentId, agentName, input, output, metadata, draftId } =
      await parseBody(req, BodySchema);

    const payload = {
      source: "coktech-admin",
      timestamp: new Date().toISOString(),
      workflowId: workflowId || agentId,
      agent: { id: agentId, name: agentName },
      content: { input, output },
      metadata: metadata || {},
    };

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (N8N_KEY) headers["Authorization"] = `Bearer ${N8N_KEY}`;

    const res = await fetch(N8N_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`n8n error ${res.status}:`, await res.text());
      return errRes(req, "Workflow provider error", 502);
    }

    const n8nResponse = await res.text();

    if (draftId) {
      await supabase
        .from("agent_drafts")
        .update({ status: "sent_n8n", updated_at: new Date().toISOString() })
        .eq("id", draftId);
    }

    return okRes(req, {
      success: true,
      message: "Workflow spustený v n8n",
      n8nResponse: n8nResponse.slice(0, 500),
    });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("trigger-n8n error:", e);
    return errRes(req, "Internal server error", 500);
  }
});
