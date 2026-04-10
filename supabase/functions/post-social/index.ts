/**
 * post-social Edge Function
 * Posts content to Instagram, LinkedIn, or Facebook.
 *
 * ENV vars needed:
 *   INSTAGRAM_ACCESS_TOKEN  — Facebook/Instagram Graph API long-lived token
 *   INSTAGRAM_USER_ID       — Instagram Business Account ID
 *   LINKEDIN_ACCESS_TOKEN   — LinkedIn OAuth2 access token
 *   LINKEDIN_ORG_ID         — LinkedIn Organization/Person URN (urn:li:organization:XXXXX)
 *   FACEBOOK_PAGE_ID        — Facebook Page ID
 *   FACEBOOK_ACCESS_TOKEN   — Facebook Page Access Token
 *
 * Request body:
 *   platform: "instagram" | "linkedin" | "facebook"
 *   text: string        — post content
 *   imageUrl?: string   — optional image URL (for Instagram must be public)
 *   draftId?: string    — agent_drafts.id to update status
 */

import { corsHeaders, errRes, okRes, requireAdmin } from "../_shared/auth.ts";

const IG_TOKEN = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
const IG_USER_ID = Deno.env.get("INSTAGRAM_USER_ID");
const LI_TOKEN = Deno.env.get("LINKEDIN_ACCESS_TOKEN");
const LI_ORG_ID = Deno.env.get("LINKEDIN_ORG_ID");
const FB_PAGE_ID = Deno.env.get("FACEBOOK_PAGE_ID");
const FB_TOKEN = Deno.env.get("FACEBOOK_ACCESS_TOKEN");

async function postInstagram(text: string, imageUrl?: string): Promise<string> {
  if (!IG_TOKEN || !IG_USER_ID) throw new Error("Instagram credentials not configured");

  if (imageUrl) {
    // Photo post: first create container, then publish
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
  } else {
    // Text-only (requires carousel or reel — Instagram API doesn't support text-only posts)
    // We create a text post via Stories or use a placeholder image approach
    throw new Error("Instagram vyžaduje obrázok pre feed príspevky. Pridaj imageUrl.");
  }
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

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LinkedIn error: ${err}`);
  }

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

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Facebook error: ${err}`);
  }

  const data = await res.json();
  return data.id || "posted";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { supabase } = await requireAdmin(req);
    const { platform, text, imageUrl, draftId } = await req.json();

    if (!platform || !text) return errRes("Missing required fields: platform, text");

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
      default:
        return errRes(`Unknown platform: ${platform}`);
    }

    if (draftId) {
      await supabase
        .from("agent_drafts")
        .update({ status: statusKey, platform, updated_at: new Date().toISOString() })
        .eq("id", draftId);
    }

    return okRes({ success: true, postId, platform, message: `Príspevok zverejnený na ${platform}` });
  } catch (e) {
    if (e instanceof Response) return e;
    return errRes((e as Error).message || "Internal server error", 500);
  }
});
