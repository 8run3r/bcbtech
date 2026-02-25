import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Portfolio from "./pages/Portfolio";
import Packages from "./pages/Packages";
import Riesenia from "./pages/Riesenia";
import Kontakt from "./pages/Kontakt";
import Admin from "./pages/Admin";
import { Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/balicky" element={<Packages />} />
          <Route path="/riesenia" element={<Riesenia />} />
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/kamery" element={<Navigate to="/riesenia" replace />} />
          <Route path="/tech" element={<Navigate to="/riesenia" replace />} />
          <Route path="/konfigurator" element={<Navigate to="/riesenia" replace />} />
          <Route path="/a7x9k2m" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
