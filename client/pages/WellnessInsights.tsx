import { Link } from "react-router-dom";
import {
  Heart,
  TrendingUp,
  Calendar,
  Zap,
  Award,
  BarChart3,
} from "lucide-react";

export default function WellnessInsights() {
  // Sample data - in a real app this would come from backend
  const insightsData = {
    thisWeek: {
      checkins: 16,
      streak: 7,
      consistency: 95,
      bestMood: "😊",
      bestMoodName: "Great",
    },
    thisMonth: {
      checkins: 68,
      streak: 7,
      daysActive: 25,
      moodBreakdown: {
        Great: 18,
        Good: 16,
        Okay: 14,
        Excited: 12,
        Happy: 5,
        Tired: 2,
        Anxious: 1,
        "Not Great": 0,
      },
    },
    allTime: {
      totalCheckins: 156,
      daysSinceStart: 52,
      totalPhotos: 24,
      totalVideos: 8,
      longestStreak: 23,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-purple-50">
      {/* Header */}
      <div className="border-b border-cyan-100 bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
              UOK
            </span>
          </Link>
          <Link
            to="/dashboard"
            className="text-cyan-600 hover:text-cyan-700 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Wellness Insights
          </h1>
          <p className="text-slate-600">
            Track your wellness journey and celebrate your progress
          </p>
        </div>

        {/* This Week Stats */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-cyan-600" />
            This Week
          </h2>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow border border-cyan-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-600 font-medium">Check-ins</p>
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-4xl font-bold text-cyan-600">
                {insightsData.thisWeek.checkins}
              </p>
              <p className="text-sm text-slate-600 mt-2">out of 21 possible</p>
            </div>

            <div className="bg-white rounded-2xl shadow border border-cyan-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-600 font-medium">Current Streak</p>
                <TrendingUp className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-4xl font-bold text-red-600">
                {insightsData.thisWeek.streak}
              </p>
              <p className="text-sm text-slate-600 mt-2">days in a row</p>
            </div>

            <div className="bg-white rounded-2xl shadow border border-cyan-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-600 font-medium">Consistency</p>
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-4xl font-bold text-purple-600">
                {insightsData.thisWeek.consistency}%
              </p>
              <p className="text-sm text-slate-600 mt-2">perfect score!</p>
            </div>

            <div className="bg-white rounded-2xl shadow border border-cyan-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-600 font-medium">Best Mood</p>
                <span className="text-2xl">{insightsData.thisWeek.bestMood}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {insightsData.thisWeek.bestMoodName}
              </p>
              <p className="text-sm text-slate-600 mt-2">most common this week</p>
            </div>
          </div>
        </div>

        {/* This Month Stats */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">This Month</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow border border-cyan-100 p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-600" />
                Mood Distribution
              </h3>

              <div className="space-y-4">
                {Object.entries(insightsData.thisMonth.moodBreakdown).map(
                  ([mood, count]) => (
                    <div key={mood}>
                      <div className="flex justify-between mb-2">
                        <p className="text-sm font-medium text-slate-900">
                          {mood}
                        </p>
                        <p className="text-sm font-semibold text-slate-600">
                          {count}
                        </p>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition"
                          style={{
                            width: `${(count / insightsData.thisMonth.checkins) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow border border-cyan-100 p-6">
                <p className="text-slate-600 font-medium mb-2">Total Check-ins</p>
                <p className="text-3xl font-bold text-cyan-600">
                  {insightsData.thisMonth.checkins}
                </p>
                <p className="text-sm text-slate-600 mt-2">
                  Average: {(insightsData.thisMonth.checkins / 28).toFixed(1)} per day
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow border border-cyan-100 p-6">
                <p className="text-slate-600 font-medium mb-2">Active Days</p>
                <p className="text-3xl font-bold text-green-600">
                  {insightsData.thisMonth.daysActive}/28
                </p>
                <p className="text-sm text-slate-600 mt-2">
                  {((insightsData.thisMonth.daysActive / 28) * 100).toFixed(0)}% of the month
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow border border-cyan-100 p-6">
                <p className="text-slate-600 font-medium mb-2">Current Streak</p>
                <p className="text-3xl font-bold text-red-600">
                  {insightsData.thisMonth.streak}
                </p>
                <p className="text-sm text-slate-600 mt-2">consecutive days</p>
              </div>
            </div>
          </div>
        </div>

        {/* All Time Stats */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">All Time</h2>

          <div className="grid md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl border border-cyan-200 p-6">
              <p className="text-slate-700 font-medium mb-2">Total Check-ins</p>
              <p className="text-3xl font-bold text-cyan-700">
                {insightsData.allTime.totalCheckins}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 p-6">
              <p className="text-slate-700 font-medium mb-2">Days Active</p>
              <p className="text-3xl font-bold text-purple-700">
                {insightsData.allTime.daysSinceStart}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 p-6">
              <p className="text-slate-700 font-medium mb-2">Longest Streak</p>
              <p className="text-3xl font-bold text-green-700">
                {insightsData.allTime.longestStreak}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6">
              <p className="text-slate-700 font-medium mb-2">Photos Shared</p>
              <p className="text-3xl font-bold text-blue-700">
                {insightsData.allTime.totalPhotos}
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl border border-pink-200 p-6">
              <p className="text-slate-700 font-medium mb-2">Videos Shared</p>
              <p className="text-3xl font-bold text-pink-700">
                {insightsData.allTime.totalVideos}
              </p>
            </div>
          </div>
        </div>

        {/* Motivational Section */}
        <div className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">Keep Going! 🎉</h3>
          <p className="mb-6">
            You're doing amazing! Your consistent check-ins are helping you stay
            connected with your loved ones and track your wellness journey.
          </p>
          <Link
            to="/dashboard"
            className="inline-block px-8 py-3 bg-white text-cyan-600 font-bold rounded-lg hover:shadow-lg transition"
          >
            Continue Checking In
          </Link>
        </div>
      </div>
    </div>
  );
}
