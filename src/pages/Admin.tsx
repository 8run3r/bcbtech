import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { AdminLayout, type AdminPage } from "@/admin/AdminLayout";
import { DashboardPage } from "@/admin/pages/DashboardPage";
import { MessagesPage } from "@/admin/pages/MessagesPage";
import { MarketingPage } from "@/admin/pages/MarketingPage";
import { ProjectsPage } from "@/admin/pages/ProjectsPage";
import { AnalyticsPage } from "@/admin/pages/AnalyticsPage";
import { SettingsPage } from "@/admin/pages/SettingsPage";
import { AgentsPage } from "@/admin/pages/AgentsPage";
import { W98, raised, sunken, Win98Button, Win98Input } from "@/admin/win98";
import RotatingCaptcha, { fetchIP, isKnownIP, addKnownIP } from "@/components/RotatingCaptcha";

const LOCKOUT_KEY = "admin_login_attempts";
const LOCKOUT_TIME_KEY = "admin_lockout_until";
// Client-side friction only — the real brute-force protection is Supabase's
// server-side rate limiting. Keep this gentle so the owner's typos don't hurt.
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 2 * 60 * 1000;

const ENV_MISSING =
  !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const Admin = () => {
  const { user, isAdmin, loading, signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [shake, setShake] = useState(false);
  const [activePage, setActivePage] = useState<AdminPage>("dashboard");
  const [unreadCount, setUnreadCount] = useState(0);
  const lockoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // CAPTCHA state — required for unknown IP addresses
  const [currentIP, setCurrentIP] = useState<string | null>(null);
  const [needsCaptcha, setNeedsCaptcha] = useState(false);
  const [captchaPassed, setCaptchaPassed] = useState(false);

  useEffect(() => {
    fetchIP().then(ip => {
      setCurrentIP(ip);
      if (ip && !isKnownIP(ip)) {
        setNeedsCaptcha(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const loadUnread = async () => {
      const { data } = await supabase.from("contact_messages").select("id").eq("status", "new");
      setUnreadCount(data?.length || 0);
    };
    loadUnread();
    const interval = setInterval(loadUnread, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  useEffect(() => {
    const lockUntil = Number(localStorage.getItem(LOCKOUT_TIME_KEY) || 0);
    if (lockUntil > Date.now()) startLockoutTimer(lockUntil);
  }, []);

  const startLockoutTimer = (until: number) => {
    if (lockoutTimerRef.current) clearInterval(lockoutTimerRef.current);
    setLockoutRemaining(Math.ceil((until - Date.now()) / 1000));
    lockoutTimerRef.current = setInterval(() => {
      const rem = Math.ceil((until - Date.now()) / 1000);
      if (rem <= 0) {
        setLockoutRemaining(0);
        localStorage.removeItem(LOCKOUT_KEY);
        localStorage.removeItem(LOCKOUT_TIME_KEY);
        if (lockoutTimerRef.current) clearInterval(lockoutTimerRef.current);
      } else {
        setLockoutRemaining(rem);
      }
    }, 1000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const lockUntil = Number(localStorage.getItem(LOCKOUT_TIME_KEY) || 0);
    if (lockUntil > Date.now()) {
      toast.error(`Prihlásenie zablokované. Skúste o ${Math.ceil((lockUntil - Date.now()) / 1000)}s.`);
      return;
    }

    setLoginLoading(true);
    const { error } = await signIn(email, password);
    setLoginLoading(false);

    if (error) {
      // Network failure ≠ wrong password — don't mislead, don't count towards lockout
      if (/fetch|network|load failed/i.test(error.message)) {
        toast.error("Backend nedostupný — Supabase projekt je pravdepodobne zapauzovaný. Skontroluj supabase.com dashboard.");
        return;
      }
      setShake(true);
      setTimeout(() => setShake(false), 500);
      const attempts = Number(localStorage.getItem(LOCKOUT_KEY) || 0) + 1;
      localStorage.setItem(LOCKOUT_KEY, String(attempts));
      if (attempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_DURATION_MS;
        localStorage.setItem(LOCKOUT_TIME_KEY, String(until));
        startLockoutTimer(until);
        toast.error("Príliš veľa pokusov. Zablokované na 15 minút.");
      } else {
        toast.error(`Nesprávne heslo (${MAX_ATTEMPTS - attempts} pokusov zostáva)`);
      }
    } else {
      localStorage.removeItem(LOCKOUT_KEY);
      localStorage.removeItem(LOCKOUT_TIME_KEY);
      // Mark IP as known after successful login
      if (currentIP) addKnownIP(currentIP);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(160deg, #0d2a5e 0%, #1a4a8a 30%, #2060b0 55%, #162e60 100%)",
        fontFamily: W98.font,
      }}>
        <div style={{
          background: "rgba(240,244,252,0.97)", backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)", borderRadius: 6,
          border: "1px solid rgba(80,140,220,0.5)", padding: 24, textAlign: "center",
          boxShadow: "0 12px 40px rgba(0,0,60,0.3)",
        }}>
          <div style={{ marginBottom: 12, fontSize: "13px", color: W98.black }}>Načítavam CokTech Admin...</div>
          <div style={{ border: "1px solid rgba(0,0,0,0.15)", borderRadius: 8, height: 16, overflow: "hidden", width: 200, background: "#e8e8e8" }}>
            <div style={{ height: "100%", width: "60%", background: "linear-gradient(90deg, #0060c0, #5ab0f0)", borderRadius: 8 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    // Show CAPTCHA gate for unknown IP addresses
    if (needsCaptcha && !captchaPassed) {
      return (
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(160deg, #0d2a5e 0%, #1a4a8a 30%, #2060b0 55%, #162e60 100%)",
          fontFamily: W98.font, padding: 16,
        }}>
          <RotatingCaptcha onPass={() => setCaptchaPassed(true)} />
        </div>
      );
    }

    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(160deg, #0d2a5e 0%, #1a4a8a 30%, #2060b0 55%, #162e60 100%)",
        fontFamily: W98.font, padding: 16,
      }}>
        {/* Win7 UAC-style login dialog */}
        <div style={{
          background: "rgba(240,244,252,0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "6px 6px 4px 4px",
          border: "1px solid rgba(80,140,220,0.5)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.4) inset, 0 20px 60px rgba(0,0,60,0.4)",
          width: 400,
          maxWidth: "100%",
          overflow: "hidden",
        }}>
          {/* Aero title bar */}
          <div style={{
            background: W98.titleActive,
            padding: "0 10px",
            height: 32,
            display: "flex",
            alignItems: "center",
            gap: 8,
            position: "relative",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "55%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.05) 100%)",
              pointerEvents: "none", borderRadius: "6px 6px 0 0",
            }} />
            <span style={{ fontSize: "14px", zIndex: 1 }}>🔒</span>
            <span style={{ fontFamily: W98.font, fontSize: "12px", fontWeight: 400, color: "#1a2a5a", textShadow: "0 1px 0 rgba(255,255,255,0.7)", zIndex: 1 }}>
              Prihlásenie — CokTech Admin
            </span>
          </div>

          {/* Blue header band */}
          <div style={{
            background: "linear-gradient(90deg, #1060c0, #0840a0)",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            borderBottom: "1px solid rgba(0,0,0,0.15)",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "linear-gradient(135deg, #5ab0f0, #0060c0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 0 3px rgba(255,255,255,0.25), 0 4px 12px rgba(0,0,0,0.3)",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: "22px" }}>🧑‍💻</span>
            </div>
            <div>
              <div style={{ fontFamily: W98.font, fontSize: "15px", fontWeight: 600, color: "#fff" }}>
                CokTech Admin
              </div>
              <div style={{ fontFamily: W98.font, fontSize: "11px", color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
                Zadajte prihlasovacie údaje
              </div>
            </div>
          </div>

          {/* Form */}
          <div style={{ padding: "20px 24px" }}>
            {ENV_MISSING && (
              <div style={{
                marginBottom: 14, padding: "10px 12px", fontSize: "11px", lineHeight: 1.6,
                background: "#fff8e0", border: "1px solid #d0b000", color: "#5a4a00",
              }}>
                <strong>Chýba Supabase konfigurácia.</strong><br />
                Lokálne: skopíruj <code>.env.example</code> → <code>.env</code>, doplň
                hodnoty zo Supabase dashboardu (Settings → API) a reštartuj dev server.
              </div>
            )}
            {user && !isAdmin ? (
              <div style={{ padding: "4px 0" }}>
                <p style={{ marginBottom: 10, fontSize: "13px", color: W98.black }}>
                  Prihlásenie prebehlo, ale účet <strong>{user.email}</strong> nemá admin rolu.
                </p>
                <p style={{ marginBottom: 6, fontSize: "11px", color: W98.grayText }}>
                  Spusti v Supabase → SQL Editor:
                </p>
                <pre style={{
                  fontSize: "10px", lineHeight: 1.5, padding: "8px 10px", marginBottom: 12,
                  background: "#f4f4f4", border: "1px solid #c0c0c0",
                  whiteSpace: "pre-wrap", wordBreak: "break-all", userSelect: "all",
                }}>
{`insert into public.user_roles (user_id, role)
values ('${user.id}', 'admin');`}
                </pre>
                <p style={{ marginBottom: 12, fontSize: "11px", color: W98.grayText }}>
                  Potom sa odhlás a prihlás znova.
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Win98Button onClick={signOut}>Odhlásiť sa</Win98Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", marginBottom: 4, fontSize: "12px", fontWeight: 600, color: W98.black }}>
                    Email:
                  </label>
                  <Win98Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={lockoutRemaining > 0}
                    placeholder="vas@email.com"
                  />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", marginBottom: 4, fontSize: "12px", fontWeight: 600, color: W98.black }}>
                    Heslo:
                  </label>
                  <div style={{ position: "relative" }}>
                    <Win98Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      disabled={lockoutRemaining > 0}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      style={{
                        position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                        background: "transparent", border: "none", cursor: "pointer", padding: 2, color: W98.grayText,
                        display: "flex", alignItems: "center",
                      }}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                  <Win98Button type="submit" disabled={loginLoading || lockoutRemaining > 0} style={{ minWidth: 100 }}>
                    {loginLoading ? "Prihlasujem..." :
                      lockoutRemaining > 0 ? `Blokovanie (${Math.floor(lockoutRemaining / 60)}:${String(lockoutRemaining % 60).padStart(2, "0")})` :
                      "Prihlásiť sa"}
                  </Win98Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  const pages: Record<AdminPage, React.ReactNode> = {
    dashboard: <DashboardPage setActivePage={setActivePage} />,
    messages: <MessagesPage />,
    agents: <AgentsPage />,
    marketing: <MarketingPage />,
    projects: <ProjectsPage />,
    analytics: <AnalyticsPage />,
    settings: <SettingsPage />,
  };

  return (
    <AdminLayout
      activePage={activePage}
      setActivePage={setActivePage}
      unreadCount={unreadCount}
      onLogout={signOut}
    >
      {pages[activePage]}
    </AdminLayout>
  );
};

export default Admin;
