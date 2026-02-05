import "./global.css";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { advertiserAuthService } from "./lib/advertiserAuth";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import SetupContacts from "./pages/SetupContacts";
import Dashboard from "./pages/Dashboard";
import BondContacts from "./pages/BondContacts";
import WellnessInsights from "./pages/WellnessInsights";
import SharedMemories from "./pages/SharedMemories";
import FeaturedPartners from "./pages/FeaturedPartners";
import BondNotifications from "./pages/BondNotifications";
import UserProfile from "./pages/UserProfile";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import AdvertiserLogin from "./pages/AdvertiserLogin";
import AdvertiserAnalytics from "./pages/AdvertiserAnalytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  // Initialize demo advertiser on app load
  useEffect(() => {
    advertiserAuthService.initializeDemoAdvertiser();
  }, []);

  // Global error handler for network errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.message &&
        event.message.includes("NetworkError") &&
        event.message.includes("fetch")
      ) {
        console.warn(
          "⚠️ Network error detected - API may be unavailable, features will degrade gracefully",
        );
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason instanceof TypeError) {
        const message = event.reason.message || "";
        if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
          console.warn(
            "⚠️ Network error detected - API call failed, app will continue with fallback data",
          );
        }
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/setup-contacts" element={<SetupContacts />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/bond-contacts" element={<BondContacts />} />
              <Route
                path="/bond-notifications"
                element={<BondNotifications />}
              />
              <Route path="/user-profile" element={<UserProfile />} />
              <Route path="/wellness-insights" element={<WellnessInsights />} />
              <Route path="/shared-memories" element={<SharedMemories />} />
              <Route path="/featured-partners" element={<FeaturedPartners />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/advertiser-login" element={<AdvertiserLogin />} />
              <Route
                path="/advertiser-analytics"
                element={<AdvertiserAnalytics />}
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
