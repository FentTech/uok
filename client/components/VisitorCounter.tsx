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
        // Set timeout to prevent hanging in slow networks
        const loadWithTimeout = async <T,>(
          promise: Promise<T>,
          timeoutMs = 5000,
        ): Promise<T | null> => {
          return Promise.race([
            promise,
            new Promise<null>((resolve) =>
              setTimeout(() => resolve(null), timeoutMs),
            ),
          ]);
        };

        const [visitors, events] = await Promise.all([
          loadWithTimeout(visitorTracking.getTotalVisitors()),
          loadWithTimeout(visitorTracking.getTotalPageViews()),
        ]);

        // Use 0 as fallback if loading times out or fails
        setTotalVisitors((visitors as number) || 0);
        setTotalEvents((events as number) || 0);
        setHasError(false);
      } catch (error) {
        console.warn("Failed to load visitor stats:", error);
        setHasError(true);
        // Keep previous values or use 0 as fallback
        setTotalVisitors((prev) => prev || 0);
        setTotalEvents((prev) => prev || 0);
      } finally {
        setLoading(false);
      }
    };

    // Load on mount
    loadStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Always render the counter, even if data fails to load
  // This ensures consistent UI across all browsers and environments
  return (
    <div className="fixed bottom-6 right-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4 min-w-max z-40">
      <div className="flex gap-6">
        {/* Total Visitors */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
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
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
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
