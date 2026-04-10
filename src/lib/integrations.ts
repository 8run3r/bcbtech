/**
 * CokTech Agent Integration Library
 * Client-side wrappers for all Supabase Edge Function integrations.
 */

import { supabase } from "@/integrations/supabase/client";

// ── Helper: get auth token ──────────────────────────────────────────────────
async function getToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Nie si prihlásený");
  return token;
}

// ── Helper: call Edge Function ──────────────────────────────────────────────
async function callFunction(fnName: string, body: object): Promise<any> {
  const token = await getToken();
  const { data, error } = await supabase.functions.invoke(fnName, {
    body,
    headers: { Authorization: `Bearer ${token}` },
  });
  if (error) throw new Error(error.message || `${fnName} zlyhal`);
  if (data?.error) throw new Error(data.error);
  return data;
}

// ══════════════════════════════════════════════════════════════════════════════
// DATABASE — agent_drafts
// ══════════════════════════════════════════════════════════════════════════════

export interface AgentDraft {
  id: string;
  agent_id: string;
  agent_name: string;
  input: string;
  output: string;
  status: string;
  platform: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SaveDraftParams {
  agentId: string;
  agentName: string;
  input: string;
  output: string;
  metadata?: Record<string, unknown>;
}

/** Save agent output to Supabase */
export async function saveDraft(params: SaveDraftParams): Promise<AgentDraft> {
  const { data, error } = await supabase
    .from("agent_drafts")
    .insert({
      agent_id: params.agentId,
      agent_name: params.agentName,
      input: params.input,
      output: params.output,
      metadata: params.metadata || {},
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as AgentDraft;
}

/** Load all drafts for an agent (or all if no agentId) */
export async function loadDrafts(agentId?: string): Promise<AgentDraft[]> {
  let query = supabase
    .from("agent_drafts")
    .select("*")
    .order("created_at", { ascending: false });

  if (agentId) query = query.eq("agent_id", agentId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as AgentDraft[];
}

/** Delete a draft */
export async function deleteDraft(id: string): Promise<void> {
  const { error } = await supabase.from("agent_drafts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ══════════════════════════════════════════════════════════════════════════════
// EMAIL — SendGrid
// ══════════════════════════════════════════════════════════════════════════════

export interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  body: string;
  html?: string;
  draftId?: string;
}

export async function sendEmail(params: SendEmailParams) {
  return callFunction("send-email", params);
}

// ══════════════════════════════════════════════════════════════════════════════
// SOCIAL MEDIA — Instagram / LinkedIn / Facebook
// ══════════════════════════════════════════════════════════════════════════════

export type SocialPlatform = "instagram" | "linkedin" | "facebook";

export interface PostSocialParams {
  platform: SocialPlatform;
  text: string;
  imageUrl?: string;
  draftId?: string;
}

export async function postSocial(params: PostSocialParams) {
  return callFunction("post-social", params);
}

// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS — Slack / Discord
// ══════════════════════════════════════════════════════════════════════════════

export type NotifyChannel = "slack" | "discord" | "both";

export interface NotifyParams {
  channel: NotifyChannel;
  title: string;
  message: string;
  color?: string;
  fields?: { name: string; value: string }[];
  draftId?: string;
}

export async function notify(params: NotifyParams) {
  return callFunction("notify", params);
}

// ══════════════════════════════════════════════════════════════════════════════
// n8n WORKFLOWS
// ══════════════════════════════════════════════════════════════════════════════

export interface TriggerN8nParams {
  workflowId?: string;
  agentId: string;
  agentName: string;
  input: string;
  output: string;
  metadata?: Record<string, unknown>;
  draftId?: string;
}

export async function triggerN8n(params: TriggerN8nParams) {
  return callFunction("trigger-n8n", params);
}
