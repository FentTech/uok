import { useState, useEffect } from "react";
import { Eye, Users } from "lucide-react";
import { visitorTracking } from "@/lib/visitorTracking";

export function VisitorCounter() {
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // First, try to load from localStorage (permanent fallback)
        const storedVisitors = localStorage.getItem("uok_visitor_count");
        const storedInteractions = localStorage.getItem("uok_interaction_count");

        setTotalVisitors(storedVisitors ? parseInt(storedVisitors, 10) : 0);
        setTotalEvents(storedInteractions ? parseInt(storedInteractions, 10) : 0);

        // Then try to load from Supabase in the background
        try {
          const [visitors, events] = await Promise.all([
            visitorTracking.getTotalVisitors(),
            visitorTracking.getTotalPageViews(),
          ]);

          // Update with Supabase data if available
          if (visitors > 0) setTotalVisitors(visitors);
          if (events > 0) setTotalEvents(events);
          setHasError(false);
        } catch (supabaseError) {
          // If Supabase fails, we already have localStorage data
          console.warn("Supabase stats failed, using localStorage:", supabaseError);
          setHasError(false); // Don't show error since we have localStorage data
        }
      } catch (error) {
        console.warn("Failed to load visitor stats:", error);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };

    // Load on mount
    loadStats();

    // Refresh stats every 5 seconds for real-time updates
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Always render the counter, even if data fails to load
  // This ensures consistent UI across all browsers and environments
  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:bottom-6 sm:right-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3 sm:p-4 z-40 max-w-[calc(100vw-1.5rem)] sm:max-w-none">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
        {/* Total Visitors */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg flex-shrink-0">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visitors
            </p>
            <p
              className="text-lg font-bold text-slate-900 dark:text-white"
              title={hasError ? "Stats unavailable" : "Total unique visitors"}
            >
              {loading ? "..." : totalVisitors.toLocaleString("en-US")}
            </p>
          </div>
        </div>

        {/* Total Page Views/Clicks */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg flex-shrink-0">
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactions
            </p>
            <p
              className="text-lg font-bold text-slate-900 dark:text-white"
              title={hasError ? "Stats unavailable" : "Total page interactions"}
            >
              {loading ? "..." : totalEvents.toLocaleString("en-US")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
