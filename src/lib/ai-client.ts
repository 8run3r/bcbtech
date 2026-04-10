import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIRequest {
  model: string;
  max_tokens: number;
  system?: string;
  messages: AIMessage[];
}

interface AIResponse {
  content: { type: string; text: string }[];
  error?: { message: string };
}

/**
 * Calls Claude API through the secure Supabase Edge Function proxy.
 * Only admins with valid session can use this — API key stays server-side.
 */
export async function callAI(request: AIRequest): Promise<AIResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(request),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }

  return data;
}
