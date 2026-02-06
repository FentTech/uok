import { Link } from "react-router-dom";
import { Heart, Users, Clock, Camera, Shield, TrendingUp, Music } from "lucide-react";
import { moodSongs } from "../data/songs";

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-600">
              UOK
            </span>
          </div>
          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
                <span className="text-blue-600">
                  Check In,
                </span>
                <br />
                <span className="text-black">Stay Connected</span>
              </h1>
              <p className="text-xl text-slate-700 mb-8 leading-relaxed">
                UOK is your daily wellness companion. Check in 2-3 times a day to let your loved ones know you're okay. Express how you're feeling with emojis and stay connected with those who matter most.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/signup"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Get Started
                </Link>
                <button className="px-8 py-3 border-2 border-slate-300 text-black rounded-lg hover:border-blue-600 hover:text-blue-600 transition font-semibold">
                  Learn More
                </button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur-3xl opacity-10"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-blue-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-xl">
                      😊
                    </div>
                    <div>
                      <p className="font-semibold text-black">Morning Check-in</p>
                      <p className="text-sm text-slate-700">Feeling great today!</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-lg">
                    <div className="w-12 h-12 bg-slate-400 rounded-full flex items-center justify-center text-xl">
                      🎉
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Afternoon Check-in</p>
                      <p className="text-sm text-slate-600">All is well!</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-xl">
                      😴
                    </div>
                    <div>
                      <p className="font-semibold text-black">Evening Check-in</p>
                      <p className="text-sm text-slate-700">Ready for bed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-black">
            Why Choose{" "}
            <span className="text-blue-600">
              UOK?
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-blue-50 rounded-2xl border border-blue-200 hover:shadow-lg transition">
              <Clock className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-black">
                Daily Check-ins
              </h3>
              <p className="text-slate-700">
                Check in 2-3 times a day to confirm you're okay. Consistent wellness tracking with minimum effort.
              </p>
            </div>

            <div className="p-8 bg-slate-100 rounded-2xl border border-slate-300 hover:shadow-lg transition">
              <Users className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-black">
                Emergency Contacts
              </h3>
              <p className="text-slate-700">
                Add up to 3 trusted family or friends. They'll be notified if something seems off.
              </p>
            </div>

            <div className="p-8 bg-blue-50 rounded-2xl border border-blue-200 hover:shadow-lg transition">
              <Heart className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-black">
                Express Yourself
              </h3>
              <p className="text-slate-700">
                Use emojis to share your mood and feeling with every check-in. More expressive, more personal.
              </p>
            </div>

            <div className="p-8 bg-slate-100 rounded-2xl border border-slate-300 hover:shadow-lg transition">
              <Shield className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-black">
                Instant Alerts
              </h3>
              <p className="text-slate-700">
                Emergency contacts are notified immediately when you check in, and if you miss a check-in.
              </p>
            </div>

            <div className="p-8 bg-blue-50 rounded-2xl border border-blue-200 hover:shadow-lg transition">
              <Camera className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-black">
                Share Memories
              </h3>
              <p className="text-slate-700">
                Upload daily photos and videos to share your life. A visual diary of your wellness journey.
              </p>
            </div>

            <div className="p-8 bg-slate-100 rounded-2xl border border-slate-300 hover:shadow-lg transition">
              <TrendingUp className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-black">
                Wellness Insights
              </h3>
              <p className="text-slate-700">
                Track patterns and trends in your wellness journey. See how you're really doing over time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-black">
            How It{" "}
            <span className="text-blue-600">
              Works
            </span>
          </h2>

          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black">
                  Sign Up
                </h3>
                <p className="text-slate-700">
                  Create your UOK account in seconds with your email and basic info.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black">
                  Add Contacts
                </h3>
                <p className="text-slate-700">
                  Add up to 3 emergency contacts with their phone or WhatsApp numbers.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black">
                  Check In Daily
                </h3>
                <p className="text-slate-700">
                  Check in 2-3 times a day with an emoji expressing your mood. Your contacts are instantly notified.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black">
                  Share & Connect
                </h3>
                <p className="text-slate-700">
                  Upload photos and videos to share your moments. Stay truly connected with loved ones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inspiration Songs Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-black">
            <span className="text-blue-600">
              Music for Every Mood
            </span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { mood: "Great", color: "from-yellow-400 to-orange-400", gradient: "from-yellow-50 to-orange-50" },
              { mood: "Good", color: "from-green-400 to-emerald-400", gradient: "from-green-50 to-emerald-50" },
              { mood: "Okay", color: "from-blue-400 to-cyan-400", gradient: "from-blue-50 to-cyan-50" },
              { mood: "Happy", color: "from-pink-400 to-rose-400", gradient: "from-pink-50 to-rose-50" },
            ].map((moodCategory) => (
              <div
                key={moodCategory.mood}
                className={`bg-gradient-to-br ${moodCategory.gradient} rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition`}
              >
                <h3 className="text-xl font-bold text-slate-900 mb-4">{moodCategory.mood} Vibes</h3>
                <div className="space-y-3">
                  {moodSongs[moodCategory.mood]?.slice(0, 2).map((song, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3">
                      <p className="font-medium text-slate-900 text-sm">{song.title}</p>
                      <p className="text-xs text-slate-600">{song.artist}</p>
                      <p className="text-xs text-purple-600 mt-1">{song.vibe}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-2xl border border-purple-200 p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Music className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-slate-900">Personalized Playlists</h3>
            </div>
            <p className="text-slate-700 max-w-2xl mx-auto">
              Every mood is valid, and music can help. When you check in with your mood, we'll suggest inspiring songs tailored to how you're feeling. Use music as a tool for wellness and self-expression.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-cyan-500 via-cyan-400 to-purple-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Your Wellness Journey Today
          </h2>
          <p className="text-xl text-cyan-50 mb-8">
            Join thousands of people staying connected and keeping their loved ones assured.
          </p>
          <Link
            to="/signup"
            className="inline-block px-10 py-4 bg-white text-cyan-600 font-bold rounded-lg hover:shadow-2xl hover:scale-105 transition"
          >
            Create Your Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">UOK</span>
              </div>
              <p className="text-sm text-slate-400">
                Your daily wellness companion
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-cyan-400 transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-cyan-400 transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-cyan-400 transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 UOK. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
