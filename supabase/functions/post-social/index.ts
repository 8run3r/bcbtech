/**
 * post-social Edge Function
 * Posts content to Instagram, LinkedIn, or Facebook. Admin-only.
 *
 * ENV: INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_USER_ID,
 *      LINKEDIN_ACCESS_TOKEN, LINKEDIN_ORG_ID,
 *      FACEBOOK_PAGE_ID, FACEBOOK_ACCESS_TOKEN
 */
import { corsHeaders, errRes, okRes, parseBody, requireAdmin, z } from "../_shared/auth.ts";

const IG_TOKEN = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
const IG_USER_ID = Deno.env.get("INSTAGRAM_USER_ID");
const LI_TOKEN = Deno.env.get("LINKEDIN_ACCESS_TOKEN");
const LI_ORG_ID = Deno.env.get("LINKEDIN_ORG_ID");
const FB_PAGE_ID = Deno.env.get("FACEBOOK_PAGE_ID");
const FB_TOKEN = Deno.env.get("FACEBOOK_ACCESS_TOKEN");

const BodySchema = z.object({
  platform: z.enum(["instagram", "linkedin", "facebook"]),
  text: z.string().min(1).max(3000),
  imageUrl: z.string().url().optional(),
  draftId: z.string().uuid().optional(),
});

async function postInstagram(text: string, imageUrl?: string): Promise<string> {
  if (!IG_TOKEN || !IG_USER_ID) throw new Error("Instagram credentials not configured");
  if (!imageUrl) throw new Error("Instagram vyžaduje obrázok pre feed príspevky. Pridaj imageUrl.");

  const containerRes = await fetch(
    `https://graph.facebook.com/v20.0/${IG_USER_ID}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: imageUrl, caption: text, access_token: IG_TOKEN }),
    }
  );
  const container = await containerRes.json();
  if (!container.id) throw new Error(`IG container error: ${JSON.stringify(container)}`);

  const publishRes = await fetch(
    `https://graph.facebook.com/v20.0/${IG_USER_ID}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: container.id, access_token: IG_TOKEN }),
    }
  );
  const published = await publishRes.json();
  return published.id;
}

async function postLinkedIn(text: string, imageUrl?: string): Promise<string> {
  if (!LI_TOKEN || !LI_ORG_ID) throw new Error("LinkedIn credentials not configured");

  const body: Record<string, unknown> = {
    author: LI_ORG_ID.startsWith("urn:li:") ? LI_ORG_ID : `urn:li:organization:${LI_ORG_ID}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: imageUrl ? "IMAGE" : "NONE",
        ...(imageUrl && {
          media: [{
            status: "READY",
            description: { text: "COK Tech" },
            originalUrl: imageUrl,
          }],
        }),
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LI_TOKEN}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`LinkedIn error: ${await res.text()}`);
  const data = await res.json();
  return data.id || "posted";
}

async function postFacebook(text: string, imageUrl?: string): Promise<string> {
  if (!FB_PAGE_ID || !FB_TOKEN) throw new Error("Facebook credentials not configured");

  const endpoint = imageUrl
    ? `https://graph.facebook.com/v20.0/${FB_PAGE_ID}/photos`
    : `https://graph.facebook.com/v20.0/${FB_PAGE_ID}/feed`;

  const params = imageUrl
    ? { message: text, url: imageUrl, access_token: FB_TOKEN }
    : { message: text, access_token: FB_TOKEN };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) throw new Error(`Facebook error: ${await res.text()}`);
  const data = await res.json();
  return data.id || "posted";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });

  try {
    const { supabase } = await requireAdmin(req);
    const { platform, text, imageUrl, draftId } = await parseBody(req, BodySchema);

    let postId: string;
    let statusKey: string;

    switch (platform) {
      case "instagram":
        postId = await postInstagram(text, imageUrl);
        statusKey = "posted_instagram";
        break;
      case "linkedin":
        postId = await postLinkedIn(text, imageUrl);
        statusKey = "posted_linkedin";
        break;
      case "facebook":
        postId = await postFacebook(text, imageUrl);
        statusKey = "posted_facebook";
        break;
    }

    if (draftId) {
      await supabase
        .from("agent_drafts")
        .update({ status: statusKey, platform, updated_at: new Date().toISOString() })
        .eq("id", draftId);
    }

    return okRes(req, { success: true, postId, platform, message: `Príspevok zverejnený na ${platform}` });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("post-social error:", e);
    return errRes(req, (e as Error).message || "Internal server error", 500);
  }
});
