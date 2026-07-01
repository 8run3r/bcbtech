import { corsHeaders, errRes, okRes, parseBody, requireAdmin, z } from "../_shared/auth.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const ALLOWED_MODELS = [
  "claude-haiku-4-5-20251001",
  "claude-sonnet-4-6",
  "claude-opus-4-6",
] as const;

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(60_000),
});

const RequestSchema = z.object({
  model: z.enum(ALLOWED_MODELS),
  max_tokens: z.number().int().min(1).max(4000).optional(),
  system: z.string().max(8000).optional(),
  messages: z.array(MessageSchema).min(1).max(50),
});

// In-memory rate limit. Note: resets on cold start and is not shared across edge instances.
// TODO(phase 2+): migrate to a Supabase table for durable per-user limits.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }

  try {
    const { user } = await requireAdmin(req);

    if (!checkRateLimit(user.id)) {
      return errRes(req, "Rate limit exceeded. Max 20 requests per hour.", 429);
    }

    if (!ANTHROPIC_API_KEY) {
      return errRes(req, "ANTHROPIC_API_KEY not configured on server", 500);
    }

    const { model, max_tokens, system, messages } = await parseBody(req, RequestSchema);
    const safeMaxTokens = Math.min(max_tokens ?? 1000, 4000);

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: safeMaxTokens,
        system: system || undefined,
        messages,
      }),
    });

    const result = await anthropicRes.json();
    return okRes(req, result, anthropicRes.status);
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("ai-proxy error:", e);
    return errRes(req, "Internal server error", 500);
  }
});
