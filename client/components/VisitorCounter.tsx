import { useState, useEffect } from "react";
import { Eye, Users } from "lucide-react";
import { visitorTracking } from "@/lib/visitorTracking";

export function VisitorCounter() {
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [visitors, events] = await Promise.all([
          visitorTracking.getTotalVisitors(),
          visitorTracking.getTotalPageViews(),
        ]);
        setTotalVisitors(visitors);
        setTotalEvents(events);
      } catch (error) {
        console.warn("Failed to load visitor stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4 min-w-max">
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
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {loading ? "..." : totalVisitors.toLocaleString()}
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
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {loading ? "..." : totalEvents.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
