import "./global.css";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { advertiserAuthService } from "./lib/advertiserAuth";
import { visitorTracking } from "./lib/visitorTracking";
import { mediaStorage, notificationStorage } from "./lib/dataStorage";
import { VisitorCounter } from "./components/VisitorCounter";
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
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  // Initialize demo advertiser, visitor tracking, and clean up expired media
  useEffect(() => {
    try {
      advertiserAuthService.initializeDemoAdvertiser();
    } catch (error) {
      console.warn(
        "⚠️ Demo advertiser initialization failed (non-critical):",
        error,
      );
    }

    // Initialize visitor tracking with proper error handling
    if (visitorTracking && typeof visitorTracking.initialize === 'function') {
      visitorTracking.initialize().catch((error) => {
        console.warn(
          "⚠️ Visitor tracking failed to initialize (non-critical):",
          error,
        );
      });
    }

    // Check for expiring media and notify users
    const checkExpiringMedia = () => {
      try {
        if (!mediaStorage || typeof mediaStorage.getAll !== 'function') {
          return;
        }

        const allMedia = mediaStorage.getAll();
        const now = new Date();
        const twoDaysInMs = 2 * 24 * 60 * 60 * 1000; // 2 days
        const threeDaysInMs = 3 * 24 * 60 * 60 * 1000; // 3 days

        allMedia.forEach((media) => {
          if (media.deletedAt) return; // Skip already deleted

          const createdDate = new Date(media.createdAt);
          const ageInMs = now.getTime() - createdDate.getTime();

          // Notify when media is about to expire (approaching 3-day mark)
          if (ageInMs > twoDaysInMs && ageInMs < threeDaysInMs) {
            const hoursLeft = Math.floor(
              (threeDaysInMs - ageInMs) / (60 * 60 * 1000),
            );

            // Check if we've already notified about this media
            const notificationExists = notificationStorage
              .getAll()
              .some(
                (n) =>
                  n.type === "media-expiring" && n.message.includes(media.id),
              );

            if (!notificationExists && hoursLeft > 0) {
              notificationStorage.add({
                type: "media-expiring" as any,
                message: `⏰ Your ${media.type} will be automatically deleted in ${hoursLeft} hours`,
                timestamp: new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                date: new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }),
              });
              console.log(
                `📢 User notified: ${media.type} expiring in ${hoursLeft} hours`,
              );
            }
          }

          // Auto-delete media older than 3 days
          if (ageInMs > threeDaysInMs) {
            mediaStorage.delete(media.id);
            console.log(`🗑️ Media auto-deleted after 3 days: ${media.id}`);
          }
        });
      } catch (error) {
        console.warn("⚠️ Error checking expiring media (non-critical):", error);
      }
    };

    // Check expiring media on app load
    checkExpiringMedia();

    // Set up periodic checks and cleanup every hour
    const cleanupInterval = setInterval(
      () => {
        try {
          checkExpiringMedia();
          if (mediaStorage && typeof mediaStorage.cleanupExpiredMedia === 'function') {
            mediaStorage.cleanupExpiredMedia();
          }
        } catch (error) {
          console.warn("⚠️ Error in cleanup interval (non-critical):", error);
        }
      },
      60 * 60 * 1000,
    ); // 1 hour

    return () => clearInterval(cleanupInterval);
  }, []);

  // Global error handler for network errors
  useEffect(() => {
    const isBuilderPlatformError = (
      message: string,
      filename?: string,
    ): boolean => {
      const msg = (message + (filename || "")).toLowerCase();
      // Suppress Builder.io platform-level errors and network errors from non-critical services
      return (
        msg.includes("builder.io") ||
        msg.includes("fullstory") ||
        msg.includes("fly.dev") ||
        msg.includes("googletagmanager") ||
        msg.includes("stripe") ||
        msg.includes("github-installs") ||
        msg.includes("iframe evaluation") ||
        msg.includes("postmessage") ||
        msg.includes("could not postmessage") ||
        msg.includes("function object could not be cloned") ||
        msg.includes("unsupported type for structured data") ||
        msg.includes("mobx.array") ||
        msg.includes("quill overwriting") ||
        msg.includes("textsection endpoint") ||
        msg.includes("storage error") ||
        msg.includes("session storage") ||
        msg.includes("domexception") ||
        msg.includes("window.localstorage") ||
        msg.includes("sandboxed document") ||
        msg.includes("could not get cookie") ||
        msg.includes("could not set cookie") ||
        msg.includes("scroll-linked positioning") ||
        msg.includes("networkerror") ||
        msg.includes("network error") ||
        msg.includes("fetch resource") ||
        msg.includes("supabase") ||
        msg.includes("attempt to fetch") ||
        msg.includes("visitor tracking")
      );
    };

    const handleError = (event: ErrorEvent) => {
      if (
        isBuilderPlatformError(event.message, event.filename) ||
        event.defaultPrevented
      ) {
        event.preventDefault();
        return;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message =
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason);

      // Suppress non-critical service errors
      if (isBuilderPlatformError(message)) {
        event.preventDefault();
        return;
      }

      // Also suppress any fetch/network errors from background services
      if (message.includes("fetch") || message.includes("network")) {
        console.warn("⚠️ Non-critical network error suppressed:", message);
        event.preventDefault();
        return;
      }
    };

    // Suppress console warnings for Builder.io platform messages
    const originalWarn = console.warn;
    console.warn = function (...args: any[]) {
      const message = String(args[0]);
      if (!isBuilderPlatformError(message)) {
        originalWarn.apply(console, args);
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
      console.warn = originalWarn;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <VisitorCounter />
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
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
