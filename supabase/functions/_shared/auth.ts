import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { z } from "https://esm.sh/zod@3.23.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/**
 * Hardcoded production / dev origins. Anything else is rejected from CORS preflight.
 * Vercel preview URLs follow the pattern bcbtech-<hash>-8run3r.vercel.app — matched via regex.
 */
const ALLOWED_ORIGINS = [
  "https://coktech.tech",
  "https://www.coktech.tech",
  "https://bcbtech.vercel.app",
  "http://localhost:8080",
  "http://localhost:5173",
];
const PREVIEW_ORIGIN = /^https:\/\/bcbtech(-[a-z0-9-]+)?\.vercel\.app$/;

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin) || PREVIEW_ORIGIN.test(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function errRes(req: Request, msg: string, status = 400): Response {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

export function okRes(req: Request, data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

/** Verify request has valid admin JWT. Returns user + service-role client. Throws Response on failure. */
export async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw errRes(req, "Unauthorized", 401);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) throw errRes(req, "Invalid token", 401);

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!role) throw errRes(req, "Forbidden — admin only", 403);

  return { user, supabase };
}

/** Parse + validate JSON body against a Zod schema. Throws Response on bad input. */
export async function parseBody<T extends z.ZodTypeAny>(req: Request, schema: T): Promise<z.infer<T>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw errRes(req, "Invalid JSON body", 400);
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    throw errRes(req, `Validation error: ${issues}`, 400);
  }
  return result.data;
}

/** Escape user-controlled values before embedding in HTML emails / Telegram HTML mode. */
export function escapeHtml(s: unknown): string {
  return String(s ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export { z };
