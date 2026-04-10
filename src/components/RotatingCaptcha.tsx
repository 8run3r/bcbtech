import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { W98, Win98Button } from "@/admin/win98";

/* ═══════════════════════════════════════════════
   Rotating Image CAPTCHA (GitHub-style)
   Show images rotated randomly → user rotates
   them upright via a dial/slider. 3 correct = pass.
   ═══════════════════════════════════════════════ */

const TOLERANCE_DEG = 18;
const CHALLENGE_COUNT = 3;

// SVG images with obvious upright orientation
const CAPTCHA_IMAGES = [
  {
    id: "rocket",
    label: "Raketa",
    svg: (
      <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
        <path d="M40 8 C40 8 28 24 28 44 L28 52 L34 48 L34 60 L46 60 L46 48 L52 52 L52 44 C52 24 40 8 40 8Z" fill="#5ab0f0" stroke="#2060b0" strokeWidth="1.5"/>
        <circle cx="40" cy="32" r="5" fill="#fff" stroke="#2060b0" strokeWidth="1"/>
        <path d="M34 60 L32 72 L40 66 L48 72 L46 60" fill="#ff6b35" stroke="#cc4400" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    id: "lock",
    label: "Zámok",
    svg: (
      <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
        <rect x="22" y="36" width="36" height="30" rx="3" fill="#e8c840" stroke="#b89a20" strokeWidth="1.5"/>
        <path d="M28 36 L28 26 C28 18 34 12 40 12 C46 12 52 18 52 26 L52 36" stroke="#888" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <circle cx="40" cy="50" r="4" fill="#b89a20"/>
        <path d="M40 54 L40 60" stroke="#b89a20" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "key",
    label: "Kľúč",
    svg: (
      <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
        <circle cx="40" cy="22" r="12" fill="none" stroke="#c0c0c0" strokeWidth="4"/>
        <circle cx="40" cy="22" r="5" fill="#e8e8e8" stroke="#999" strokeWidth="1.5"/>
        <path d="M40 34 L40 68" stroke="#c0c0c0" strokeWidth="4" strokeLinecap="round"/>
        <path d="M40 56 L50 56" stroke="#c0c0c0" strokeWidth="3" strokeLinecap="round"/>
        <path d="M40 64 L48 64" stroke="#c0c0c0" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "house",
    label: "Dom",
    svg: (
      <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
        <path d="M40 12 L12 38 L20 38 L20 66 L60 66 L60 38 L68 38 Z" fill="#e07050" stroke="#a04030" strokeWidth="1.5"/>
        <rect x="34" y="44" width="12" height="22" rx="1" fill="#8b5e3c" stroke="#6b4020" strokeWidth="1"/>
        <circle cx="43" cy="56" r="1.5" fill="#e8c840"/>
        <rect x="24" y="40" width="8" height="8" rx="1" fill="#a8d8ff" stroke="#5090c0" strokeWidth="0.8"/>
        <rect x="48" y="40" width="8" height="8" rx="1" fill="#a8d8ff" stroke="#5090c0" strokeWidth="0.8"/>
      </svg>
    ),
  },
  {
    id: "umbrella",
    label: "Dáždnik",
    svg: (
      <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
        <path d="M40 16 C22 16 10 30 10 38 L40 38 L70 38 C70 30 58 16 40 16Z" fill="#6a5acd" stroke="#4a3aad" strokeWidth="1.5"/>
        <path d="M40 14 L40 58" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M40 58 C40 64 36 68 32 68 C28 68 26 64 26 62" stroke="#555" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M25 38 C25 30 32 24 40 24" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
  },
  {
    id: "bulb",
    label: "Žiarovka",
    svg: (
      <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
        <ellipse cx="40" cy="30" rx="18" ry="20" fill="#fff4a0" stroke="#d4a000" strokeWidth="1.5"/>
        <path d="M32 44 C32 52 34 54 34 58 L46 58 C46 54 48 52 48 44" fill="#fff4a0" stroke="#d4a000" strokeWidth="1.5"/>
        <rect x="33" y="58" width="14" height="4" rx="1" fill="#c0c0c0" stroke="#999" strokeWidth="0.8"/>
        <rect x="33" y="62" width="14" height="4" rx="1" fill="#c0c0c0" stroke="#999" strokeWidth="0.8"/>
        <path d="M37 66 C37 70 43 70 43 66" fill="#c0c0c0" stroke="#999" strokeWidth="0.8"/>
        <path d="M34 26 L46 26 M36 20 L44 20" stroke="rgba(255,200,0,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "tree",
    label: "Strom",
    svg: (
      <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
        <rect x="36" y="52" width="8" height="18" rx="1" fill="#8b5e3c" stroke="#6b4020" strokeWidth="1"/>
        <path d="M40 10 L18 52 L62 52 Z" fill="#4caf50" stroke="#2e7d32" strokeWidth="1.5"/>
        <path d="M40 20 L24 46 L56 46 Z" fill="#66bb6a" stroke="#2e7d32" strokeWidth="0.8"/>
      </svg>
    ),
  },
  {
    id: "cup",
    label: "Šálka",
    svg: (
      <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
        <path d="M18 30 L22 64 C22 68 32 70 40 70 C48 70 58 68 58 64 L62 30 Z" fill="#fff" stroke="#999" strokeWidth="1.5"/>
        <path d="M62 36 C68 36 74 40 74 46 C74 52 68 56 62 56" stroke="#999" strokeWidth="1.5" fill="none"/>
        <path d="M28 16 C28 12 32 10 32 14 C32 18 36 16 36 12 C36 8 40 10 40 14" stroke="#aaa" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>
        <ellipse cx="40" cy="30" rx="22" ry="4" fill="#d4a574" opacity="0.6"/>
      </svg>
    ),
  },
];

// Random rotation that's far from 0° (at least 60° away)
const randomRotation = () => {
  const options = [90, 135, 180, 225, 270];
  return options[Math.floor(Math.random() * options.length)];
};

// Pick N random unique items
const pickRandom = <T,>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

// Normalize angle to 0–360
const normalize = (deg: number) => ((deg % 360) + 360) % 360;

// Check if angle is close enough to upright (0°)
const isUpright = (deg: number) => {
  const n = normalize(deg);
  return n <= TOLERANCE_DEG || n >= 360 - TOLERANCE_DEG;
};

/* ── IP utilities ── */
const KNOWN_IPS_KEY = "coktech_known_ips";

const getKnownIPs = (): string[] => {
  try { return JSON.parse(localStorage.getItem(KNOWN_IPS_KEY) || "[]"); }
  catch { return []; }
};

export const addKnownIP = (ip: string) => {
  const ips = getKnownIPs();
  if (!ips.includes(ip)) {
    ips.push(ip);
    localStorage.setItem(KNOWN_IPS_KEY, JSON.stringify(ips));
  }
};

export const isKnownIP = (ip: string) => getKnownIPs().includes(ip);

export const fetchIP = async (): Promise<string | null> => {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const { ip } = await res.json();
    return ip;
  } catch {
    return null;
  }
};

/* ── Main Component ── */
interface Props {
  onPass: () => void;
}

const RotatingCaptcha = ({ onPass }: Props) => {
  const challenges = useMemo(
    () => pickRandom(CAPTCHA_IMAGES, CHALLENGE_COUNT).map(img => ({
      ...img,
      initialRotation: randomRotation(),
    })),
    [],
  );

  const [step, setStep] = useState(0);
  const [rotation, setRotation] = useState(challenges[0].initialRotation);
  const [results, setResults] = useState<boolean[]>([]);
  const [failed, setFailed] = useState(false);
  const [shaking, setShaking] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startAngle = useRef(0);
  const startRotation = useRef(0);

  const current = challenges[step];

  // Dial drag handlers
  const getAngleFromEvent = useCallback((clientX: number, clientY: number) => {
    if (!dialRef.current) return 0;
    const rect = dialRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    startAngle.current = getAngleFromEvent(e.clientX, e.clientY);
    startRotation.current = rotation;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [rotation, getAngleFromEvent]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const angle = getAngleFromEvent(e.clientX, e.clientY);
    const delta = angle - startAngle.current;
    setRotation(normalize(startRotation.current + delta));
  }, [getAngleFromEvent]);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  // Arrow key rotation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setRotation(r => normalize(r - 15));
      if (e.key === "ArrowRight") setRotation(r => normalize(r + 15));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleConfirm = () => {
    const correct = isUpright(rotation);
    const newResults = [...results, correct];
    setResults(newResults);

    if (step < CHALLENGE_COUNT - 1) {
      // Next challenge
      const nextStep = step + 1;
      setStep(nextStep);
      setRotation(challenges[nextStep].initialRotation);
    } else {
      // All done — check if all correct
      const allCorrect = newResults.every(Boolean);
      if (allCorrect) {
        onPass();
      } else {
        setFailed(true);
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
      }
    }
  };

  const handleRetry = () => {
    setStep(0);
    setResults([]);
    setFailed(false);
    // Re-randomize rotations
    challenges.forEach(c => { c.initialRotation = randomRotation(); });
    setRotation(challenges[0].initialRotation);
  };

  // Indicator dot color
  const dotColor = (i: number) => {
    if (i < results.length) return results[i] ? "#00875a" : "#d04040";
    if (i === step) return "#0078d7";
    return "rgba(0,0,0,0.15)";
  };

  return (
    <div style={{
      background: "rgba(240,244,252,0.97)",
      border: "1px solid rgba(80,140,220,0.5)",
      borderRadius: 6,
      boxShadow: "0 0 0 1px rgba(255,255,255,0.4) inset, 0 12px 40px rgba(0,0,60,0.25)",
      width: 340,
      maxWidth: "100%",
      overflow: "hidden",
      animation: shaking ? "captcha-shake 0.4s ease" : undefined,
    }}>
      <style>{`
        @keyframes captcha-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes captcha-spin-in {
          from { opacity: 0; transform: scale(0.8) rotate(-20deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #1060c0, #0840a0)",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <span style={{ fontSize: 18 }}>🛡️</span>
        <div>
          <div style={{
            fontFamily: W98.font, fontSize: 13, fontWeight: 600, color: "#fff",
          }}>
            Overenie identity
          </div>
          <div style={{
            fontFamily: W98.font, fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 1,
          }}>
            Otočte obrázky do správnej polohy
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 24px", textAlign: "center" }}>
        {failed ? (
          <div>
            <div style={{
              fontFamily: W98.font, fontSize: 13, color: "#d04040",
              marginBottom: 16, fontWeight: 600,
            }}>
              Overenie zlyhalo. Skúste znova.
            </div>
            <Win98Button onClick={handleRetry}>Skúsiť znova</Win98Button>
          </div>
        ) : (
          <>
            {/* Progress dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
              {challenges.map((_, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: dotColor(i),
                  transition: "background 0.3s",
                  boxShadow: i === step ? "0 0 0 3px rgba(0,120,215,0.2)" : "none",
                }} />
              ))}
            </div>

            {/* Image label */}
            <div style={{
              fontFamily: W98.font, fontSize: 11, color: W98.grayText,
              marginBottom: 10, letterSpacing: "0.05em",
            }}>
              Otočte <strong>{current.label.toLowerCase()}</strong> do správnej polohy
            </div>

            {/* Rotating image in circular frame */}
            <div style={{
              position: "relative",
              width: 140, height: 140,
              margin: "0 auto 16px",
            }}>
              {/* Outer ring (dial) */}
              <div
                ref={dialRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "3px solid rgba(0,120,215,0.3)",
                  cursor: "grab",
                  touchAction: "none",
                }}
              >
                {/* Dial handle indicator */}
                <div style={{
                  position: "absolute",
                  top: -6,
                  left: "50%",
                  transform: `translateX(-50%) rotate(${rotation}deg)`,
                  transformOrigin: `0 ${70 + 6}px`,
                  width: 12, height: 12,
                  borderRadius: "50%",
                  background: "#0078d7",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                  transition: dragging.current ? "none" : "transform 0.1s",
                }} />
              </div>

              {/* Image container */}
              <div style={{
                position: "absolute",
                inset: 12,
                borderRadius: "50%",
                background: "#f8f8f8",
                border: "1px solid rgba(0,0,0,0.08)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "captcha-spin-in 0.3s ease",
              }}>
                <div style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: dragging.current ? "none" : "transform 0.1s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {current.svg}
                </div>
              </div>

              {/* Up arrow indicator (target) */}
              <div style={{
                position: "absolute",
                top: -2,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 10,
                color: isUpright(rotation) ? "#00875a" : "rgba(0,0,0,0.2)",
                transition: "color 0.2s",
                fontWeight: 800,
              }}>
                ▲
              </div>
            </div>

            {/* Arrow buttons */}
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 16 }}>
              <button
                onClick={() => setRotation(r => normalize(r - 15))}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(180deg, #f2f2f2, #e0e0e0)",
                  border: "1px solid rgba(0,0,0,0.15)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, color: "#333",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                }}
              >
                ↺
              </button>
              <button
                onClick={() => setRotation(r => normalize(r + 15))}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(180deg, #f2f2f2, #e0e0e0)",
                  border: "1px solid rgba(0,0,0,0.15)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, color: "#333",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                }}
              >
                ↻
              </button>
            </div>

            {/* Confirm */}
            <Win98Button onClick={handleConfirm} style={{ minWidth: 120 }}>
              {step < CHALLENGE_COUNT - 1
                ? `Potvrdiť (${step + 1}/${CHALLENGE_COUNT})`
                : "Overiť"}
            </Win98Button>

            {/* Hint */}
            <div style={{
              fontFamily: W98.font, fontSize: 10, color: "rgba(0,0,0,0.3)",
              marginTop: 10,
            }}>
              Ťahajte po okraji kruhu alebo použite šípky ← →
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RotatingCaptcha;
