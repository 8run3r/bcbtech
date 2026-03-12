import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, MessageSquare, Bot, FolderKanban,
  FileText, BarChart2, Settings, LogOut, Camera, Menu, X, Bell
} from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";

export type AdminPage =
  | "dashboard" | "messages" | "marketing" | "projects"
  | "cameras" | "blog" | "analytics" | "settings";

interface NavItem {
  id: AdminPage;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: "dashboard",  label: "Dashboard",    icon: <LayoutDashboard size={18} /> },
  { id: "messages",   label: "Správy",        icon: <MessageSquare size={18} /> },
  { id: "marketing",  label: "AI Marketing",  icon: <Bot size={18} /> },
  { id: "cameras",    label: "Kamery",        icon: <Camera size={18} /> },
  { id: "projects",   label: "Projekty",      icon: <FolderKanban size={18} /> },
  { id: "blog",       label: "Blog",          icon: <FileText size={18} /> },
  { id: "analytics",  label: "Analytika",     icon: <BarChart2 size={18} /> },
  { id: "settings",   label: "Nastavenia",    icon: <Settings size={18} /> },
];

const pageTitles: Record<AdminPage, string> = {
  dashboard: "Dashboard",
  messages: "Správy",
  marketing: "AI Marketing",
  cameras: "Kamery",
  projects: "Projekty",
  blog: "Blog",
  analytics: "Analytika",
  settings: "Nastavenia",
};

interface Props {
  activePage: AdminPage;
  setActivePage: (p: AdminPage) => void;
  unreadCount?: number;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AdminLayout = ({ activePage, setActivePage, unreadCount = 0, onLogout, children }: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00FF94]/10 border border-[#00FF94]/20 flex items-center justify-center">
            <span className="text-[#00FF94] font-bold text-sm">C</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">COK Tech</p>
            <p className="text-zinc-500 text-xs mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative
              ${activePage === item.id
                ? "text-white bg-white/5 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-0.5 before:bg-[#00FF94] before:rounded-full"
                : "text-zinc-500 hover:text-white hover:bg-white/5"
              }`}
          >
            <span className={activePage === item.id ? "text-[#00FF94]" : ""}>{item.icon}</span>
            {item.label}
            {item.id === "messages" && unreadCount > 0 && (
              <span className="ml-auto bg-[#00FF94] text-black text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#00FF94]/10 border border-[#00FF94]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[#00FF94] font-bold text-sm">B</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium leading-none">Bruno Cok</p>
            <p className="text-zinc-500 text-xs mt-0.5">CEO</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150"
        >
          <LogOut size={18} /> Odhlásiť sa
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0a0a0a" }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-60 flex-shrink-0 border-r border-white/5"
        style={{ background: "#0f0f0f" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-60 z-50 flex flex-col border-r border-white/5 lg:hidden"
              style={{ background: "#0f0f0f" }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-white/5 flex-shrink-0"
          style={{ background: "#0a0a0a" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-white font-semibold text-base">{pageTitles[activePage]}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-zinc-500">
              {format(now, "d. MMM yyyy, HH:mm", { locale: sk })}
            </span>
            <button className="relative p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00FF94]" />
              )}
            </button>
            <div className="px-2.5 py-1 rounded-full border border-white/10 bg-white/5">
              <span className="text-xs text-zinc-400 font-medium">COK Tech</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
