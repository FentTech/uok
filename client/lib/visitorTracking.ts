// Visitor tracking service - tracks app visits and interactions
// Works across all browsers and environments globally

import { supabaseUserSyncService } from "./supabase";

interface VisitorData {
  session_id: string;
  page_visited: string;
  entry_point: string;
  device_info: {
    userAgent: string;
    language: string;
    timezone: string;
    platform: string;
  };
  referrer: string;
}

interface VisitorEvent {
  session_id: string;
  event_type: string;
  event_data: Record<string, any>;
}

class VisitorTrackingService {
  private sessionId: string;
  private initialized = false;
  private fallbackSessionId: string = ""; // Fallback for browsers without localStorage

  constructor() {
    this.fallbackSessionId = this.generateSessionId();
    this.sessionId = this.getOrCreateSessionId();
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Get or create a unique session ID for this visitor
   * Works across all browsers including those with localStorage disabled
   */
  private getOrCreateSessionId(): string {
    const storageKey = "uok_visitor_session_id";

    // Try localStorage first (works in most browsers)
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return stored;
      }
    } catch (error) {
      // localStorage not available (e.g., in private browsing, Builder sandbox, etc.)
      console.log("ℹ️ localStorage not available, using fallback session tracking");
    }

    // Create new session ID
    const newSessionId = this.generateSessionId();

    // Try to store it
    try {
      localStorage.setItem(storageKey, newSessionId);
    } catch (error) {
      // localStorage not available - we'll use the fallback in memory
      console.log("ℹ️ Could not save session ID to localStorage, using in-memory session");
    }

    return newSessionId;
  }

  /**
   * Initialize visitor tracking on app load
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.trackVisit(window.location.pathname);
      this.initialized = true;
      console.log("✅ Visitor tracking initialized");
    } catch (error) {
      console.warn("⚠️ Failed to initialize visitor tracking:", error);
    }
  }

  /**
   * Track a page visit
   */
  async trackVisit(page: string): Promise<void> {
    try {
      const visitorData: VisitorData = {
        session_id: this.sessionId,
        page_visited: page,
        entry_point: window.location.pathname,
        device_info: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          platform: navigator.platform,
        },
        referrer: document.referrer,
      };

      // Try to save to Supabase (fire-and-forget) with proper error handling
      try {
        const { getSupabase } = await import("./supabase");
        const supabase = getSupabase();
        if (!supabase) return;

        // Check if session already exists
        const { data: existing } = await supabase
          .from("visitors")
          .select("id")
          .eq("session_id", this.sessionId)
          .single();

        if (!existing) {
          await supabase.from("visitors").insert([visitorData]);
          console.log("📊 Visitor tracked:", this.sessionId);
        }
      } catch (error) {
        // Silently fail - Supabase may not be configured or network may be unavailable
        // This is not a critical error
        if (
          error instanceof Error &&
          error.message.includes("Supabase credentials not configured")
        ) {
          console.log("ℹ️ Supabase visitor tracking disabled");
        } else {
          console.warn("⚠️ Failed to save visitor data (non-critical):", error);
        }
      }
    } catch (error) {
      console.warn("⚠️ Error tracking visit:", error);
    }
  }

  /**
   * Track a specific event (button click, form submission, etc.)
   */
  async trackEvent(
    eventType: string,
    eventData: Record<string, any> = {},
  ): Promise<void> {
    try {
      const event: VisitorEvent = {
        session_id: this.sessionId,
        event_type: eventType,
        event_data: {
          ...eventData,
          timestamp: new Date().toISOString(),
        },
      };

      // Try to save to Supabase (fire-and-forget) with proper error handling
      try {
        const { getSupabase } = await import("./supabase");
        const supabase = getSupabase();
        if (!supabase) return;

        await supabase.from("visitor_events").insert([event]);
        console.log("📊 Event tracked:", eventType);
      } catch (error) {
        // Silently fail - Supabase may not be configured or network may be unavailable
        // This is not a critical error
        if (
          error instanceof Error &&
          error.message.includes("Supabase credentials not configured")
        ) {
          console.log("ℹ️ Supabase event tracking disabled");
        } else {
          console.warn("⚠️ Failed to save event (non-critical):", error);
        }
      }
    } catch (error) {
      console.warn("⚠️ Error tracking event:", error);
    }
  }

  /**
   * Get total unique visitors count
   */
  async getTotalVisitors(): Promise<number> {
    try {
      const { getSupabase } = await import("./supabase");
      const supabase = getSupabase();
      if (!supabase) {
        console.log(
          "ℹ️ Supabase not configured, returning 0 for visitor count",
        );
        return 0;
      }

      const { count, error } = await supabase
        .from("visitors")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.warn("⚠️ Failed to get visitor count (non-critical):", error);
      return 0;
    }
  }

  /**
   * Get total page views/clicks
   */
  async getTotalPageViews(): Promise<number> {
    try {
      const { getSupabase } = await import("./supabase");
      const supabase = getSupabase();
      if (!supabase) {
        console.log(
          "ℹ️ Supabase not configured, returning 0 for page views count",
        );
        return 0;
      }

      const { count, error } = await supabase
        .from("visitor_events")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.warn("⚠️ Failed to get page views (non-critical):", error);
      return 0;
    }
  }

  /**
   * Get visitor statistics for today
   */
  async getTodayStats(): Promise<{ visitors: number; events: number }> {
    try {
      const { getSupabaseClient } = await import("./supabase");
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log("ℹ️ Supabase not configured, returning 0 for today stats");
        return { visitors: 0, events: 0 };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [visitorRes, eventRes] = await Promise.all([
        supabase
          .from("visitors")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
        supabase
          .from("visitor_events")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
      ]);

      return {
        visitors: visitorRes.count || 0,
        events: eventRes.count || 0,
      };
    } catch (error) {
      console.warn("⚠️ Failed to get today stats (non-critical):", error);
      return { visitors: 0, events: 0 };
    }
  }
}

// Export singleton instance
export const visitorTracking = new VisitorTrackingService();
