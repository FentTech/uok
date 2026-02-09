import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
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
            <span className="text-xl font-bold text-blue-600">UOK</span>
          </div>
          <div className="flex gap-3 items-center">
            <Link
              to="/login"
              className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium transition hidden sm:block"
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
                <span className="text-blue-600">Check In,</span>
                <br />
                <span className="text-black">Stay Connected</span>
              </h1>
              <p className="text-xl text-slate-700 mb-8 leading-relaxed">
                UOK is your daily wellness companion. Check in 2-3 times a day
                to let your loved ones know you're okay.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/signup"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Get Started
                </Link>
                <Link
                  to="/features"
                  className="px-8 py-3 border-2 border-slate-300 text-black rounded-lg hover:border-blue-600 hover:text-blue-600 transition font-semibold inline-block"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur-3xl opacity-10"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-blue-100">
                <div className="space-y-4">
                  {/* Morning Check-In */}
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                    <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-xl">
                      🌅
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-black">
                        Morning Check-In
                      </p>
                      <p className="text-xs text-gray-600">8:00 AM</p>
                    </div>
                  </div>

                  {/* Afternoon Check-In */}
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition">
                    <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-xl">
                      ☀️
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-black">
                        Afternoon Check-In
                      </p>
                      <p className="text-xs text-gray-600">2:00 PM</p>
                    </div>
                  </div>

                  {/* Evening Check-In */}
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
                    <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center text-xl">
                      🌙
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-black">
                        Evening Check-In
                      </p>
                      <p className="text-xs text-gray-600">8:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Music for Moods Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-black">
            🎵 Music for Every Mood
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moodSongs.slice(0, 6).map((mood, index) => (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{mood.mood}</div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {mood.moodName}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">
                  {mood.recommendation || "Curated music to match your mood"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-black">
            Why Choose UOK?
          </h2>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">UOK</span>
              </div>
              <p className="text-sm text-slate-400">
                Your daily wellness companion for staying connected with loved
                ones
              </p>
            </div>

            {/* How It Works */}
            <div>
              <h4 className="font-semibold text-white mb-4">How It Works</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link to="/features" className="hover:text-white transition">
                    Daily Check-ins
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="hover:text-white transition">
                    Stay Connected
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="hover:text-white transition">
                    Track Wellness
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="hover:text-white transition">
                    Emergency Alerts
                  </Link>
                </li>
              </ul>
            </div>

            {/* Products & Services */}
            <div>
              <h4 className="font-semibold text-white mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link to="/features" className="hover:text-white transition">
                    UOK Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-white transition">
                    Premium Plans
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="hover:text-white transition">
                    Health Tracking
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="hover:text-white transition">
                    Community Sharing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Contact & Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link to="/contact" className="hover:text-white transition">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white transition">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:support@youok.fit"
                    className="hover:text-white transition"
                  >
                    Email Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
              <p>&copy; 2024 UOK. All rights reserved</p>
              <p>
                Support:{" "}
                <a
                  href="mailto:support@youok.fit"
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  support@youok.fit
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
