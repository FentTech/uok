import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Send,
  Zap,
  X,
} from "lucide-react";
import {
  analyticsService,
  DEMO_ADS,
  type WeeklyReport,
} from "../lib/analytics";

export default function AnalyticsDashboard() {
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [adStats, setAdStats] = useState({
    totalImpressions: 0,
    totalClicks: 0,
    ctr: 0,
  });
  const [memoryStats, setMemoryStats] = useState({
    totalViews: 0,
    totalEngagement: 0,
  });
  const [reportSent, setReportSent] = useState(false);
  const [testMode, setTestMode] = useState(false);

  // Load analytics on mount
  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    const report = analyticsService.generateWeeklyReport();
    setWeeklyReport(report);

    // Calculate ad stats
    const totalAds = report.metrics.totalAdImpressions;
    const totalClicks = report.metrics.totalAdClicks;
    const ctr = totalAds > 0 ? (totalClicks / totalAds) * 100 : 0;

    setAdStats({
      totalImpressions: totalAds,
      totalClicks: totalClicks,
      ctr: Math.round(ctr * 100) / 100,
    });

    // Calculate memory stats
    setMemoryStats({
      totalViews: report.metrics.totalViews,
      totalEngagement: report.metrics.totalLikes + report.metrics.totalComments,
    });
  };

  const handleSendWeeklyReport = async () => {
    const userEmail = localStorage.getItem("userEmail") || "demo@example.com";
    const success = await analyticsService.sendWeeklyEmailReport(userEmail);
    setReportSent(success);
    if (success) {
      setTimeout(() => setReportSent(false), 3000);
    }
  };

  const handleGenerateDemoData = () => {
    // Generate random demo events for testing
    const userEmail = localStorage.getItem("userEmail") || "user";
    const today = new Date().toISOString().split("T")[0];

    // Add demo views
    for (let i = 0; i < 15; i++) {
      analyticsService.trackEvent({
        type: "view",
        targetId: `demo-memory-${i}`,
        targetType: "memory",
        userEmail,
        timestamp: new Date().toISOString(),
        date: today,
      });
    }

    // Add demo likes
    for (let i = 0; i < 12; i++) {
      analyticsService.trackEvent({
        type: "like",
        targetId: `demo-memory-${i % 15}`,
        targetType: "memory",
        userEmail,
        timestamp: new Date().toISOString(),
        date: today,
      });
    }

    // Add demo comments
    for (let i = 0; i < 8; i++) {
      analyticsService.trackEvent({
        type: "comment",
        targetId: `demo-memory-${i % 15}`,
        targetType: "memory",
        userEmail,
        timestamp: new Date().toISOString(),
        date: today,
      });
    }

    // Add demo ad impressions
    for (let i = 0; i < 25; i++) {
      const ad = DEMO_ADS[i % DEMO_ADS.length];
      analyticsService.trackEvent({
        type: "ad-impression",
        targetId: ad.id,
        targetType: "ad",
        userEmail,
        timestamp: new Date().toISOString(),
        date: today,
        metadata: {
          adTitle: ad.title,
          adType: ad.type,
        },
      });
    }

    // Add demo ad clicks
    for (let i = 0; i < 4; i++) {
      const ad = DEMO_ADS[i % DEMO_ADS.length];
      analyticsService.trackEvent({
        type: "ad-click",
        targetId: ad.id,
        targetType: "ad",
        userEmail,
        timestamp: new Date().toISOString(),
        date: today,
        metadata: {
          adTitle: ad.title,
          adType: ad.type,
        },
      });
    }

    loadAnalytics();
  };

  const handleClearAnalytics = () => {
    if (window.confirm("Clear all analytics data? This cannot be undone.")) {
      analyticsService.clearAll();
      loadAnalytics();
    }
  };

  if (!weeklyReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-purple-500/20 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">
              Analytics Dashboard
            </h1>
          </div>
          <Link
            to="/dashboard"
            className="text-purple-300 hover:text-purple-200 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            Weekly Analytics Report
          </h2>
          <p className="text-purple-300/80">
            Week: {weeklyReport.startDate} to {weeklyReport.endDate}
          </p>
        </div>

        {/* Test Mode Toggle */}
        <div className="mb-8 p-4 bg-purple-500/10 border border-purple-400/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white mb-1">Test Mode</h3>
              <p className="text-sm text-purple-300/80">
                Generate demo data to test analytics features
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setTestMode(!testMode)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  testMode
                    ? "bg-purple-600 text-white"
                    : "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                }`}
              >
                {testMode ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        {testMode && (
          <div className="mb-8 grid md:grid-cols-2 gap-4">
            <button
              onClick={handleGenerateDemoData}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Generate Demo Data
            </button>
            <button
              onClick={handleClearAnalytics}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Clear All Analytics
            </button>
          </div>
        )}

        {/* Success Message */}
        {reportSent && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-400/30 rounded-lg text-green-300">
            ✓ Weekly report sent successfully!
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {/* Views */}
          <div className="bg-white/10 backdrop-blur-xl border border-purple-400/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-300/80 text-sm font-medium">
                Total Views
              </h3>
              <Eye className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {weeklyReport.metrics.totalViews}
            </p>
            <p className="text-xs text-purple-300/60 mt-2">
              Memory views this week
            </p>
          </div>

          {/* Likes */}
          <div className="bg-white/10 backdrop-blur-xl border border-purple-400/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-300/80 text-sm font-medium">
                Total Likes
              </h3>
              <Heart className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {weeklyReport.metrics.totalLikes}
            </p>
            <p className="text-xs text-purple-300/60 mt-2">Likes received</p>
          </div>

          {/* Comments */}
          <div className="bg-white/10 backdrop-blur-xl border border-purple-400/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-300/80 text-sm font-medium">
                Total Comments
              </h3>
              <MessageCircle className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {weeklyReport.metrics.totalComments}
            </p>
            <p className="text-xs text-purple-300/60 mt-2">Comments received</p>
          </div>

          {/* Engagement Rate */}
          <div className="bg-white/10 backdrop-blur-xl border border-purple-400/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-300/80 text-sm font-medium">
                Engagement Rate
              </h3>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {weeklyReport.metrics.engagementRate.toFixed(1)}%
            </p>
            <p className="text-xs text-purple-300/60 mt-2">
              (Likes + Comments) / Views
            </p>
          </div>
        </div>

        {/* Advertising Stats */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Ad Performance */}
          <div className="bg-white/10 backdrop-blur-xl border border-purple-400/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Ad Performance
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-purple-300/80">Impressions</span>
                  <span className="text-white font-semibold">
                    {weeklyReport.metrics.totalAdImpressions}
                  </span>
                </div>
                <div className="w-full bg-purple-900/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (weeklyReport.metrics.totalAdImpressions / 100) * 100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-purple-300/80">Clicks</span>
                  <span className="text-white font-semibold">
                    {weeklyReport.metrics.totalAdClicks}
                  </span>
                </div>
                <div className="w-full bg-purple-900/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (weeklyReport.metrics.totalAdClicks / 100) * 100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-purple-300/80">Click-Through Rate</span>
                  <span className="text-white font-semibold">
                    {weeklyReport.metrics.adClickThroughRate.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-purple-900/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(weeklyReport.metrics.adClickThroughRate, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top Ads */}
          <div className="bg-white/10 backdrop-blur-xl border border-purple-400/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-6">
              Top Performing Ads
            </h3>
            <div className="space-y-3">
              {weeklyReport.topAds.length > 0 ? (
                weeklyReport.topAds.map((ad) => (
                  <div key={ad.id} className="p-3 bg-purple-500/10 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-white text-sm">
                        {ad.title}
                      </h4>
                      <span className="text-green-400 font-bold text-sm">
                        {ad.ctr.toFixed(1)}% CTR
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-purple-300/80">
                      <span>{ad.impressions} impressions</span>
                      <span>{ad.clicks} clicks</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-purple-300/60 text-sm">No ad data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Memories */}
        <div className="bg-white/10 backdrop-blur-xl border border-purple-400/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">
            Top Performing Memories
          </h3>
          <div className="space-y-3">
            {weeklyReport.topMemories.length > 0 ? (
              weeklyReport.topMemories.map((memory, idx) => (
                <div
                  key={memory.id}
                  className="p-3 bg-purple-500/10 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-purple-400">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-white line-clamp-1">
                        {memory.caption}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm text-purple-300/80">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" /> {memory.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" /> {memory.likes} likes
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" /> {memory.comments}{" "}
                      comments
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-purple-300/60 text-sm">No memory data yet</p>
            )}
          </div>
        </div>

        {/* Send Report */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-2">
            Weekly Email Report
          </h3>
          <p className="text-white/80 mb-4">
            Send this week's analytics to your email address
          </p>
          <button
            onClick={handleSendWeeklyReport}
            className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-white/90 transition flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Send Email Report
          </button>
        </div>
      </div>
    </div>
  );
}
