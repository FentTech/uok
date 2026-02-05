import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Eye,
  Heart,
  MessageCircle,
  Zap,
  Lock,
  TrendingUp,
} from "lucide-react";
import { analyticsService, type WeeklyReport } from "../lib/analytics";

export default function AnalyticsDashboard() {
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);

  // Load analytics on mount
  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    const report = analyticsService.generateWeeklyReport();
    setWeeklyReport(report);
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
              Community Analytics
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
            Community Insights
          </h2>
          <p className="text-purple-300/80">
            Celebrating top memories and popular ads • Week:{" "}
            {weeklyReport.startDate} to {weeklyReport.endDate}
          </p>
        </div>

        {/* Public Info Banner */}
        <div className="mb-8 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
          <p className="text-blue-300 text-sm">
            ℹ️ This page shows public community highlights. Detailed ad
            performance analytics are private and only available to authorized
            advertisers.{" "}
            <Link
              to="/advertiser-login"
              className="text-blue-400 hover:text-blue-300 font-semibold underline"
            >
              Login as advertiser →
            </Link>
          </p>
        </div>

        {/* Top Memories Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <h3 className="text-2xl font-bold text-white">
              Top Performing Memories
            </h3>
          </div>

          {weeklyReport.topMemories.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weeklyReport.topMemories.map((memory, idx) => (
                <div
                  key={memory.id}
                  className="bg-white/10 backdrop-blur-xl border border-purple-400/30 rounded-lg p-4 hover:border-purple-400/60 transition"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl font-bold text-purple-400">
                      #{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">
                        {memory.caption}
                      </h4>
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm text-purple-300/80">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" /> {memory.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" /> {memory.likes} likes
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" /> {memory.comments}
                      comments
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-purple-400/20 rounded-lg p-8 text-center">
              <p className="text-purple-300/60">
                No memory data yet. Start sharing to see analytics!
              </p>
            </div>
          )}
        </div>

        {/* Popular Ads Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h3 className="text-2xl font-bold text-white">Most Engaging Ads</h3>
          </div>

          {weeklyReport.topAds.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weeklyReport.topAds.map((ad, idx) => (
                <div
                  key={ad.id}
                  className="bg-white/10 backdrop-blur-xl border border-purple-400/30 rounded-lg p-4 hover:border-purple-400/60 transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-yellow-400">
                        #{idx + 1}
                      </span>
                      <h4 className="font-semibold text-white truncate">
                        {ad.title}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-300/80">
                        👁️ {ad.impressions} views
                      </span>
                      <span className="text-green-400 font-semibold">
                        {ad.ctr.toFixed(1)}% CTR
                      </span>
                    </div>
                    <div className="w-full bg-purple-900/50 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(ad.ctr, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-purple-400/20 rounded-lg p-8 text-center">
              <p className="text-purple-300/60">
                No ad data yet. Check back soon!
              </p>
            </div>
          )}
        </div>

        {/* Advertiser Info */}
        <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-400/30 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Lock className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Are you an advertiser?
              </h3>
              <p className="text-purple-300/80 mb-4">
                Log in to your private advertiser portal to view detailed
                analytics, performance metrics, ad click-through rates, and more
                for your campaigns.
              </p>
              <Link
                to="/advertiser-login"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition"
              >
                Access Advertiser Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
