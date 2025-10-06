import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Test from "./pages/Test";
import Admin from "./pages/Admin";
import Debug from "./pages/Debug";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  // 프리뷰/임시 도메인 접근 시 프로덕션 도메인으로 강제 리다이렉트
  useEffect(() => {
    const target = (import.meta as any).env?.VITE_SITE_URL as string | undefined;
    if (!target) return;
    try {
      const t = new URL(target);
      if (window.location.hostname !== t.hostname) {
        window.location.href = t.href;
      }
    } catch { /* noop */ }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/test" element={<Test />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/debug" element={<Debug />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
