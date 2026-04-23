import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ExternalLink, Play } from "lucide-react";

interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  media_url: string | null;
  media_type: "image" | "video";
  cta_text: string;
  cta_url: string | null;
  bg_color: string;
  accent_color: string;
  status: string;
}

function detectDevice(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobile|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

function isYouTubeUrl(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

const CampaignLanding = () => {
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const tracked = useRef(false);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }

    (async () => {
      const { data, error } = await supabase
        .from("marketing_campaigns")
        .select("*")
        .eq("slug", slug)
        .eq("status", "active")
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCampaign(data as Campaign);
      setLoading(false);

      // Track view (once per page load)
      if (!tracked.current) {
        tracked.current = true;
        supabase.from("campaign_clicks").insert({
          campaign_id: data.id,
          ip: null,  // filled by edge function or left null for privacy
          user_agent: navigator.userAgent.slice(0, 256),
          referrer: document.referrer ? new URL(document.referrer).hostname : null,
          device: detectDevice(),
        }).then(() => {});
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#666", letterSpacing: "0.2em" }}
        >
          LOADING...
        </motion.div>
      </div>
    );
  }

  if (notFound || !campaign) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#666" }}>404</span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#444" }}>Kampaň neexistuje alebo bola ukončená.</span>
        <a href="/" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#555", textDecoration: "none", marginTop: 8 }}>
          ← coktech.tech
        </a>
      </div>
    );
  }

  const ytId = campaign.media_url ? isYouTubeUrl(campaign.media_url) : null;

  const handleCTA = () => {
    if (campaign.cta_url) {
      // Track CTA click separately (optional — could add click_type column later)
      window.open(campaign.cta_url, "_blank", "noopener");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: campaign.bg_color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle radial glow */}
      <div style={{
        position: "absolute",
        top: "30%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600,
        height: 600,
        background: `radial-gradient(circle, ${campaign.accent_color}15 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Media */}
        {campaign.media_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ marginBottom: 24 }}
          >
            {ytId ? (
              <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden" }}>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0`}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={campaign.title}
                />
              </div>
            ) : campaign.media_type === "video" ? (
              <video
                src={campaign.media_url}
                controls
                playsInline
                style={{ width: "100%", borderRadius: 12, maxHeight: 360 }}
                poster=""
              />
            ) : (
              <img
                src={campaign.media_url}
                alt={campaign.title}
                style={{
                  width: "100%",
                  borderRadius: 12,
                  maxHeight: 400,
                  objectFit: "cover",
                  boxShadow: `0 20px 60px ${campaign.accent_color}20`,
                }}
              />
            )}
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            fontFamily: "'Syne', 'DM Sans', sans-serif",
            fontSize: "clamp(1.5rem, 5vw, 2.2rem)",
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.2,
            margin: "0 0 12px",
          }}
        >
          {campaign.title}
        </motion.h1>

        {/* Description */}
        {campaign.description && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "clamp(0.85rem, 2.5vw, 1rem)",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.6,
              margin: "0 0 28px",
              maxWidth: 400,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {campaign.description}
          </motion.p>
        )}

        {/* CTA Button */}
        {campaign.cta_url && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCTA}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "clamp(0.8rem, 2vw, 0.95rem)",
              fontWeight: 700,
              color: "#fff",
              background: campaign.accent_color,
              border: "none",
              borderRadius: 10,
              padding: "14px 36px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: `0 8px 30px ${campaign.accent_color}40`,
              letterSpacing: "0.02em",
            }}
          >
            {campaign.cta_text}
            <ExternalLink size={14} />
          </motion.button>
        )}

        {/* CokTech branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ marginTop: 48 }}
        >
          <a
            href="https://coktech.tech"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8,
              color: "rgba(255,255,255,0.15)",
              textDecoration: "none",
              letterSpacing: "0.15em",
            }}
          >
            POWERED BY COKTECH
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CampaignLanding;
