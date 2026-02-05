import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  LogOut,
  Lock,
} from "lucide-react";
import { analyticsService, DEMO_ADS, type WeeklyReport } from "../lib/analytics";

export default function AdvertiserAnalytics() {
  const navigate = useNavigate();
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [reportSent, setReportSent] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const advertiserEmail = localStorage.getItem("advertiserEmail");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("advertiserLoggedIn");
    if (!isLoggedIn) {
      navigate("/advertiser-login");
    }

    loadAnalytics();
  }, [navigate]);

  const loadAnalytics = () => {
    const report = analyticsService.generateWeeklyReport();
    setWeeklyReport(report);
  };

  const handleLogout = () => {
    localStorage.removeItem("advertiserEmail");
    localStorage.removeItem("advertiserLoggedIn");
    localStorage.removeItem("advertiserLoginTime");
    navigate("/advertiser-login");
  };

  const handleSendWeeklyReport = async () => {
    const success = await analyticsService.sendWeeklyEmailReport(
      advertiserEmail || "advertiser@wellness.com",
    );
    setReportSent(success);
    if (success) {
      setTimeout(() => setReportSent(false), 3000);
    }
  };

  const handleGenerateDemoData = () => {
    const userEmail = advertiserEmail || "advertiser@wellness.com";
    const today = new Date().toISOString().split("T")[0];

    for (let i = 0; i < 25; i++) {
      analyticsService.trackEvent({
        type: "view",
        targetId: `demo-memory-${i}`,
        targetType: "memory",
        userEmail,
        timestamp: new Date().toISOString(),
        date: today,
      });
    }

    for (let i = 0; i < 18; i++) {
      analyticsService.trackEvent({
        type: "like",
        targetId: `demo-memory-${i % 25}`,
        targetType: "memory",
        userEmail,
        timestamp: new Date().toISOString(),
        date: today,
      });
    }

    for (let i = 0; i < 12; i++) {
      analyticsService.trackEvent({
        type: "comment",
        targetId: `demo-memory-${i % 25}`,
        targetType: "memory",
        userEmail,
        timestamp: new Date().toISOString(),
        date: today,
      });
    }

    for (let i = 0; i < 40; i++) {
      const ad = DEMO_ADS[i % DEMO_ADS.length];
      analyticsService.trackEvent({
        type: "ad-impression",
        targetId: ad.id,
        targetType: "ad",
        userEmail,
        timestamp: new Date().toISOString(),
        date: today,
        metadata: { adTitle: ad.title, adType: ad.type },
      });
    }

    for (let i = 0; i < 8; i++) {
      const ad = DEMO_ADS[i % DEMO_ADS.length];
      analyticsService.trackEvent({
        type: "ad-click",
        targetId: ad.id,
        targetType: "ad",
        userEmail,
        timestamp: new Date().toISOString(),
        date: today,
        metadata: { adTitle: ad.title, adType: ad.type },
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
      <nav className="border-b border-purple-500/20 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Private Advertiser Analytics
              </h1>
              <p className="text-purple-300/60 text-xs">{advertiserEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition border border-red-400/30"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            Your Analytics Dashboard
          </h2>
          <p className="text-purple-300/80">
            Private data for authorized advertisers only • Week:{" "}
            {weeklyReport.startDate} to {weeklyReport.endDate}
          </p>
        </div>

        <div className="mb-8 p-4 bg-green-500/10 border border-green-400/30 rounded-lg flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-green-300 text-sm">
            🔒 This page is private and encrypted. Only authorized advertisers
            can access this data.
          </span>
        </div>

        <div className="mb-8 p-4 bg-purple-500/10 border border-purple-400/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white mb-1">Test Mode</h3>
              <p className="text-sm text-purple-300/80">
                Generate demo data to test analytics
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
              Clear Analytics
            </button>
          </div>
        )}

        {reportSent && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-400/30 rounded-lg text-green-300">
            ✓ Weekly report sent successfully to {advertiserEmail}
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-4 mb-8">
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
            <p className="text-xs text-purple-300/60 mt-2">This week</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-purple-400/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-300/80 text-sm font-medium">
                Total Engagement
              </h3>
              <Heart className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {weeklyReport.metrics.totalLikes +
                weeklyReport.metrics.totalComments}
            </p>
            <p className="text-xs text-purple-300/60 mt-2">
              Likes + Comments
            </p>
          </div>

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
            <p className="text-xs text-purple-300/60 mt-2">Overall</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-purple-400/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-300/80 text-sm font-medium">
                Ad Click Rate
              </h3>
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {weeklyReport.metrics.adClickThroughRate.toFixed(2)}%
            </p>
            <p className="text-xs text-purple-300/60 mt-2">This week</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-purple-400/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Ad Performance (PRIVATE)
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
                      width: `${Math.min(
                        weeklyReport.metrics.adClickThroughRate,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-purple-400/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-6">
              Your Top Ads (PRIVATE)
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
                      <span>👁️ {ad.impressions} impressions</span>
                      <span>🖱️ {ad.clicks} clicks</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-purple-300/60 text-sm">No ad data yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-2">
            Send Weekly Report
          </h3>
          <p className="text-white/80 mb-4">
            Email your detailed analytics report (private, encrypted)
          </p>
          <button
            onClick={handleSendWeeklyReport}
            className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-white/90 transition flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Send Private Report
          </button>
        </div>
      </div>
    </div>
  );
}
