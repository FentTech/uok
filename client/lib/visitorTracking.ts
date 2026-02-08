// Visitor tracking service - tracks app visits and interactions

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

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  /**
   * Get or create a unique session ID for this visitor
   */
  private getOrCreateSessionId(): string {
    const storageKey = "uok_visitor_session_id";
    let sessionId = localStorage.getItem(storageKey);

    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(storageKey, sessionId);
    }

    return sessionId;
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

      // Try to save to Supabase (fire-and-forget)
      import("./supabase").then(async () => {
        try {
          const { getSupabaseClient } = await import("./supabase");
          const supabase = getSupabaseClient();
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
          console.warn("⚠️ Failed to save visitor data:", error);
        }
      });
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

      // Try to save to Supabase (fire-and-forget)
      import("./supabase").then(async () => {
        try {
          const { getSupabaseClient } = await import("./supabase");
          const supabase = getSupabaseClient();
          if (!supabase) return;

          await supabase.from("visitor_events").insert([event]);
          console.log("📊 Event tracked:", eventType);
        } catch (error) {
          console.warn("⚠️ Failed to save event:", error);
        }
      });
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
      if (!supabase) return 0;

      const { count, error } = await supabase
        .from("visitors")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.warn("⚠️ Failed to get visitor count:", error);
      return 0;
    }
  }

  /**
   * Get total page views/clicks
   */
  async getTotalPageViews(): Promise<number> {
    try {
      const { getSupabaseClient } = await import("./supabase");
      const supabase = getSupabaseClient();
      if (!supabase) return 0;

      const { count, error } = await supabase
        .from("visitor_events")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.warn("⚠️ Failed to get page views:", error);
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
      if (!supabase) return { visitors: 0, events: 0 };

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
      console.warn("⚠️ Failed to get today stats:", error);
      return { visitors: 0, events: 0 };
    }
  }
}

// Export singleton instance
export const visitorTracking = new VisitorTrackingService();
