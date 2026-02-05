// Analytics tracking service for monitoring views, engagement, and generating reports

export interface AnalyticsEvent {
  id: string;
  type: "view" | "like" | "comment" | "share" | "ad-impression" | "ad-click";
  targetId: string; // ID of the shared memory or ad
  targetType: "memory" | "ad";
  userEmail: string;
  timestamp: string;
  date: string; // YYYY-MM-DD format for weekly report grouping
  metadata?: {
    adTitle?: string;
    adType?: string;
    viewDuration?: number; // in seconds
    engagementLevel?: "low" | "medium" | "high";
  };
}

export interface AnalyticsMetrics {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalAdImpressions: number;
  totalAdClicks: number;
  engagementRate: number; // (likes + comments) / views
  adClickThroughRate: number; // ad-clicks / ad-impressions
}

export interface WeeklyReport {
  week: string; // "2024-01-01 to 2024-01-07"
  startDate: string;
  endDate: string;
  metrics: AnalyticsMetrics;
  topMemories: Array<{
    id: string;
    caption: string;
    views: number;
    likes: number;
    comments: number;
  }>;
  topAds: Array<{
    id: string;
    title: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
}

const ANALYTICS_STORAGE_KEY = "uok_analytics_events";
const LAST_REPORT_EMAIL_KEY = "uok_last_report_email_sent";

// Demo ads for testing
export const DEMO_ADS = [
  {
    id: "demo-ad-1",
    title: "Premium Wellness Plan",
    description: "Upgrade to premium for unlimited family connections",
    image: "🎯",
    cta: "Learn More",
    type: "promotion",
  },
  {
    id: "demo-ad-2",
    title: "Family Safety Features",
    description: "Keep your loved ones safe with advanced monitoring",
    image: "🛡️",
    cta: "Explore",
    type: "feature",
  },
  {
    id: "demo-ad-3",
    title: "Wellness Reports",
    description: "Get weekly insights about your family's wellness",
    image: "📊",
    cta: "View Reports",
    type: "feature",
  },
  {
    id: "demo-ad-4",
    title: "Connect More Family Members",
    description: "Expand your wellness circle",
    image: "👨‍👩‍👧‍👦",
    cta: "Invite",
    type: "promotion",
  },
];

export const analyticsService = {
  // Log an analytics event
  trackEvent: (event: Omit<AnalyticsEvent, "id">): void => {
    try {
      const events = analyticsService.getAllEvents();
      const newEvent: AnalyticsEvent = {
        ...event,
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      events.push(newEvent);
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(events));
      console.log(
        "✅ Analytics event tracked:",
        newEvent.type,
        newEvent.targetId,
      );
    } catch (error) {
      console.error("❌ Failed to track analytics event:", error);
    }
  },

  // Get all analytics events
  getAllEvents: (): AnalyticsEvent[] => {
    try {
      const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("❌ Failed to load analytics events:", error);
      return [];
    }
  },

  // Get events for a specific date range
  getEventsByDateRange: (
    startDate: string,
    endDate: string,
  ): AnalyticsEvent[] => {
    const allEvents = analyticsService.getAllEvents();
    return allEvents.filter((event) => {
      return event.date >= startDate && event.date <= endDate;
    });
  },

  // Get this week's events (Monday to Sunday)
  getThisWeeksEvents: (): AnalyticsEvent[] => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust to Monday
    const monday = new Date(today.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);

    const startDateStr = monday.toISOString().split("T")[0];
    const endDateStr = sunday.toISOString().split("T")[0];

    return analyticsService.getEventsByDateRange(startDateStr, endDateStr);
  },

  // Calculate metrics for a set of events
  calculateMetrics: (events: AnalyticsEvent[]): AnalyticsMetrics => {
    const totalViews = events.filter((e) => e.type === "view").length;
    const totalLikes = events.filter((e) => e.type === "like").length;
    const totalComments = events.filter((e) => e.type === "comment").length;
    const totalShares = events.filter((e) => e.type === "share").length;
    const totalAdImpressions = events.filter(
      (e) => e.type === "ad-impression",
    ).length;
    const totalAdClicks = events.filter((e) => e.type === "ad-click").length;

    const engagementRate =
      totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;
    const adClickThroughRate =
      totalAdImpressions > 0 ? (totalAdClicks / totalAdImpressions) * 100 : 0;

    return {
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      totalAdImpressions,
      totalAdClicks,
      engagementRate: Math.round(engagementRate * 100) / 100,
      adClickThroughRate: Math.round(adClickThroughRate * 100) / 100,
    };
  },

  // Get top memories by engagement
  getTopMemories: (
    events: AnalyticsEvent[],
    limit: number = 5,
  ): Array<{
    id: string;
    caption: string;
    views: number;
    likes: number;
    comments: number;
  }> => {
    const memoryMetrics: Record<
      string,
      { views: number; likes: number; comments: number; caption?: string }
    > = {};

    events.forEach((event) => {
      if (!memoryMetrics[event.targetId]) {
        memoryMetrics[event.targetId] = {
          views: 0,
          likes: 0,
          comments: 0,
        };
      }
      if (event.type === "view") memoryMetrics[event.targetId].views++;
      else if (event.type === "like") memoryMetrics[event.targetId].likes++;
      else if (event.type === "comment")
        memoryMetrics[event.targetId].comments++;
    });

    return Object.entries(memoryMetrics)
      .map(([id, metrics]) => ({
        id,
        caption: metrics.caption || "Shared Memory",
        views: metrics.views,
        likes: metrics.likes,
        comments: metrics.comments,
      }))
      .sort(
        (a, b) =>
          b.views + b.likes + b.comments - (a.views + a.likes + a.comments),
      )
      .slice(0, limit);
  },

  // Get top ads by CTR
  getTopAds: (
    events: AnalyticsEvent[],
    limit: number = 5,
  ): Array<{
    id: string;
    title: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }> => {
    const adMetrics: Record<
      string,
      { impressions: number; clicks: number; title?: string }
    > = {};

    events.forEach((event) => {
      if (event.targetType === "ad") {
        if (!adMetrics[event.targetId]) {
          adMetrics[event.targetId] = {
            impressions: 0,
            clicks: 0,
            title: event.metadata?.adTitle,
          };
        }
        if (event.type === "ad-impression")
          adMetrics[event.targetId].impressions++;
        else if (event.type === "ad-click") adMetrics[event.targetId].clicks++;
      }
    });

    return Object.entries(adMetrics)
      .map(([id, metrics]) => ({
        id,
        title: metrics.title || "Unnamed Ad",
        impressions: metrics.impressions,
        clicks: metrics.clicks,
        ctr:
          metrics.impressions > 0
            ? (metrics.clicks / metrics.impressions) * 100
            : 0,
      }))
      .sort((a, b) => b.ctr - a.ctr)
      .slice(0, limit);
  },

  // Generate weekly report
  generateWeeklyReport: (): WeeklyReport => {
    const weekEvents = analyticsService.getThisWeeksEvents();
    const metrics = analyticsService.calculateMetrics(weekEvents);
    const topMemories = analyticsService.getTopMemories(weekEvents);
    const topAds = analyticsService.getTopAds(weekEvents);

    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);

    const startDateStr = monday.toISOString().split("T")[0];
    const endDateStr = sunday.toISOString().split("T")[0];

    return {
      week: `${startDateStr} to ${endDateStr}`,
      startDate: startDateStr,
      endDate: endDateStr,
      metrics,
      topMemories,
      topAds,
    };
  },

  // Check if weekly report was already sent today
  wasWeeklyReportSentToday: (): boolean => {
    try {
      const lastSent = localStorage.getItem(LAST_REPORT_EMAIL_KEY);
      if (!lastSent) return false;

      const today = new Date().toISOString().split("T")[0];
      return lastSent === today;
    } catch (error) {
      return false;
    }
  },

  // Mark weekly report as sent
  markWeeklyReportSent: (): void => {
    try {
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem(LAST_REPORT_EMAIL_KEY, today);
    } catch (error) {
      console.error("❌ Failed to mark report as sent:", error);
    }
  },

  // Send weekly report via email API
  sendWeeklyEmailReport: async (userEmail: string): Promise<boolean> => {
    try {
      // Check if already sent today
      if (analyticsService.wasWeeklyReportSentToday()) {
        console.log("⚠️ Weekly report already sent today");
        return false;
      }

      const report = analyticsService.generateWeeklyReport();

      // Call backend API to send email
      const response = await fetch("/api/send-weekly-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          report,
        }),
      });

      if (response.ok) {
        analyticsService.markWeeklyReportSent();
        console.log("✅ Weekly report email sent to:", userEmail);
        return true;
      } else {
        console.error("❌ Failed to send weekly report email");
        return false;
      }
    } catch (error) {
      console.error("❌ Error sending weekly report:", error);
      return false;
    }
  },

  // Clear all analytics (for testing)
  clearAll: (): void => {
    try {
      localStorage.removeItem(ANALYTICS_STORAGE_KEY);
      localStorage.removeItem(LAST_REPORT_EMAIL_KEY);
      console.log("✅ Analytics cleared");
    } catch (error) {
      console.error("❌ Failed to clear analytics:", error);
    }
  },
};
