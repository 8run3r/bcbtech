/**
 * trigger-n8n Edge Function
 * Triggers an n8n workflow via webhook.
 *
 * ENV vars needed:
 *   N8N_WEBHOOK_URL   — your n8n webhook URL (e.g. https://your-n8n.com/webhook/coktech-agent)
 *   N8N_API_KEY       — optional bearer token for secured webhooks
 *
 * Request body:
 *   workflowId?: string     — optional workflow identifier (passed to n8n as data)
 *   agentId: string         — which agent triggered this
 *   agentName: string       — agent display name
 *   input: string           — what was sent to the agent
 *   output: string          — what the agent produced
 *   metadata?: object       — extra data to pass to workflow
 *   draftId?: string        — agent_drafts.id to update
 */

import { corsHeaders, errRes, okRes, requireAdmin } from "../_shared/auth.ts";

const N8N_URL = Deno.env.get("N8N_WEBHOOK_URL");
const N8N_KEY = Deno.env.get("N8N_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { supabase } = await requireAdmin(req);

    if (!N8N_URL) return errRes("N8N_WEBHOOK_URL not configured", 500);

    const { workflowId, agentId, agentName, input, output, metadata, draftId } = await req.json();
    if (!agentId || !output) return errRes("Missing required fields: agentId, output");

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
      const err = await res.text();
      return errRes(`n8n error (${res.status}): ${err}`, 502);
    }

    const n8nResponse = await res.text();

    if (draftId) {
      await supabase
        .from("agent_drafts")
        .update({ status: "sent_n8n", updated_at: new Date().toISOString() })
        .eq("id", draftId);
    }

    return okRes({
      success: true,
      message: "Workflow spustený v n8n",
      n8nResponse: n8nResponse.slice(0, 500),
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return errRes((e as Error).message || "Internal server error", 500);
  }
});
