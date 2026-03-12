import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { AdminLayout, type AdminPage } from "@/admin/AdminLayout";
import { DashboardPage } from "@/admin/pages/DashboardPage";
import { MessagesPage } from "@/admin/pages/MessagesPage";
import { MarketingPage } from "@/admin/pages/MarketingPage";
import { ProjectsPage } from "@/admin/pages/ProjectsPage";
import { CamerasPage } from "@/admin/pages/CamerasPage";
import { AnalyticsPage } from "@/admin/pages/AnalyticsPage";
import { SettingsPage } from "@/admin/pages/SettingsPage";

// localStorage (not localStorage) so lockout persists across tabs/refreshes
const LOCKOUT_KEY = "admin_login_attempts";
const LOCKOUT_TIME_KEY = "admin_lockout_until";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000;

const Admin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [shake, setShake] = useState(false);
  const [activePage, setActivePage] = useState<AdminPage>("dashboard");
  const [unreadCount, setUnreadCount] = useState(0);
  const lockoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkRole = async (userId: string) => {
      try {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
        if (isMounted) setIsAdmin(!!data);
      } catch {
        if (isMounted) setIsAdmin(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!isMounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) setTimeout(() => checkRole(u.id), 0);
      else setIsAdmin(false);
    });

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        const u = session?.user ?? null;
        setUser(u);
        if (u) await checkRole(u.id);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => { isMounted = false; subscription.unsubscribe(); };
  }, []);

  // Load unread count
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoginLoading(false);

    if (error) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      const attempts = Number(localStorage.getItem(LOCKOUT_KEY) || 0) + 1;
      localStorage.setItem(LOCKOUT_KEY, String(attempts));
      if (attempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_DURATION_MS;
        localStorage.setItem(LOCKOUT_TIME_KEY, String(until));
        startLockoutTimer(until);
        toast.error("Príliš veľa pokusov. Zablokované na 5 minút.");
      } else {
        toast.error(`Nesprávne heslo (${MAX_ATTEMPTS - attempts} pokusov zostáva)`);
      }
    } else {
      localStorage.removeItem(LOCKOUT_KEY);
      localStorage.removeItem(LOCKOUT_TIME_KEY);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="w-6 h-6 border-2 border-[#00FF94]/30 border-t-[#00FF94] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0a0a0a" }}>
        <motion.div
          animate={shake ? { x: [0, -10, 10, -10, 10, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="rounded-2xl border border-white/10 p-8" style={{ background: "#141414" }}>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-xl bg-[#00FF94]/10 border border-[#00FF94]/20 flex items-center justify-center">
                <span className="text-[#00FF94] font-bold">C</span>
              </div>
              <div>
                <p className="text-white font-bold leading-none">COK Tech</p>
                <p className="text-zinc-500 text-xs mt-0.5">Admin Panel</p>
              </div>
            </div>

            {user && !isAdmin ? (
              <div className="text-center py-4">
                <p className="text-zinc-400 text-sm mb-4">Nemáte admin prístup.</p>
                <button onClick={handleLogout} className="text-sm text-red-400 hover:underline">Odhlásiť sa</button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={lockoutRemaining > 0}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors disabled:opacity-50"
                  />
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Heslo"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={lockoutRemaining > 0}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loginLoading || lockoutRemaining > 0}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-black bg-[#00FF94] hover:bg-[#00FF94]/90 disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-1"
                >
                  {loginLoading ? <Loader2 size={16} className="animate-spin" /> :
                    lockoutRemaining > 0 ? `Zablokované (${Math.floor(lockoutRemaining / 60)}:${String(lockoutRemaining % 60).padStart(2, "0")})` :
                    "Prihlásiť sa"}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const pages: Record<AdminPage, React.ReactNode> = {
    dashboard: <DashboardPage setActivePage={setActivePage} />,
    messages: <MessagesPage />,
    marketing: <MarketingPage />,
    cameras: <CamerasPage />,
    projects: <ProjectsPage />,
    analytics: <AnalyticsPage />,
    settings: <SettingsPage />,
  };

  return (
    <AdminLayout
      activePage={activePage}
      setActivePage={setActivePage}
      unreadCount={unreadCount}
      onLogout={handleLogout}
    >
      {pages[activePage]}
    </AdminLayout>
  );
};

export default Admin;
