import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import RetroCursor from "@/components/ui/retro-cursor";
import SmoothScroll from "./components/SmoothScroll";
import LandingTerminal from "@/components/landing/LandingTerminal";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import RequireAdmin from "./components/RequireAdmin";
import { AccentProvider } from "@/components/landing/Navbar";

const Portfolio = lazy(() => import("./pages/Portfolio"));
const Packages = lazy(() => import("./pages/Packages"));
const Logika = lazy(() => import("./pages/Logika"));
const Kontakt = lazy(() => import("./pages/Kontakt"));
const Sluzby = lazy(() => import("./pages/Sluzby"));
const Sluzba = lazy(() => import("./pages/Sluzba"));
const Admin = lazy(() => import("./pages/Admin"));
const Archive = lazy(() => import("./pages/Archive"));
const NodeMap = lazy(() => import("./pages/NodeMap"));
const Memory = lazy(() => import("./pages/Memory"));
const Void = lazy(() => import("./pages/Void"));
const Doom = lazy(() => import("./pages/Doom"));

const PageLoader = () => (
  <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--neon-primary)", opacity: 0.4, letterSpacing: "0.2em" }}>
      LOADING...
    </span>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RetroCursor />
          <BrowserRouter>
          <LandingTerminal />
          <AccentProvider>
            <SmoothScroll>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/balicky" element={<Packages />} />
                <Route path="/logika" element={<Logika />} />
                <Route path="/kontakt" element={<Kontakt />} />
                <Route path="/sluzby" element={<Sluzby />} />
                <Route path="/sluzby/:slug" element={<Sluzba />} />
                {/* Hidden pages — discoverable through interaction */}
                <Route path="/archive" element={<Archive />} />
                <Route path="/node-map" element={<NodeMap />} />
                <Route path="/memory" element={<Memory />} />
                <Route path="/void" element={<Void />} />
                <Route path="/doom" element={<Doom />} />
                <Route path="/tsuki" element={<Void />} />
                {/* Legacy redirects */}
                <Route path="/kamery" element={<Navigate to="/sluzby/kamery" replace />} />
                <Route path="/riesenia" element={<Navigate to="/logika" replace />} />
                <Route path="/tech" element={<Navigate to="/balicky?tab=automation" replace />} />
                <Route path="/konfigurator" element={<Navigate to="/balicky" replace />} />
                {/* Old admin hash → redirect to clean path */}
                <Route path="/a7x9k2m" element={<Navigate to="/admin" replace />} />
                <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </SmoothScroll>
          </AccentProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
