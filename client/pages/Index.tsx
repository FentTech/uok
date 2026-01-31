import { Link } from "react-router-dom";
import { Heart, Users, Clock, Camera, Shield, TrendingUp } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-cyan-50 to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-cyan-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
              UOK
            </span>
          </div>
          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-6 py-2 text-cyan-600 hover:text-cyan-700 font-medium transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-200 transition font-medium"
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
                <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                  Check In,
                </span>
                <br />
                <span className="text-slate-900">Stay Connected</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                UOK is your daily wellness companion. Check in 2-3 times a day to let your loved ones know you're okay. Express how you're feeling with emojis and stay connected with those who matter most.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/signup"
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:shadow-xl hover:shadow-cyan-200 transition font-semibold"
                >
                  Get Started
                </Link>
                <button className="px-8 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:border-cyan-400 hover:text-cyan-600 transition font-semibold">
                  Learn More
                </button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-2xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-cyan-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-lg">
                    <div className="w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center text-xl">
                      😊
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Morning Check-in</p>
                      <p className="text-sm text-slate-600">Feeling great today!</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                    <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center text-xl">
                      🎉
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Afternoon Check-in</p>
                      <p className="text-sm text-slate-600">All is well!</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-lg">
                    <div className="w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center text-xl">
                      😴
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Evening Check-in</p>
                      <p className="text-sm text-slate-600">Ready for bed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 border-y border-cyan-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
              UOK?
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-2xl border border-cyan-200 hover:shadow-lg transition">
              <Clock className="w-10 h-10 text-cyan-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Daily Check-ins
              </h3>
              <p className="text-slate-700">
                Check in 2-3 times a day to confirm you're okay. Consistent wellness tracking with minimum effort.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200 hover:shadow-lg transition">
              <Users className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Emergency Contacts
              </h3>
              <p className="text-slate-700">
                Add up to 3 trusted family or friends. They'll be notified if something seems off.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-2xl border border-cyan-200 hover:shadow-lg transition">
              <Heart className="w-10 h-10 text-cyan-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Express Yourself
              </h3>
              <p className="text-slate-700">
                Use emojis to share your mood and feeling with every check-in. More expressive, more personal.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200 hover:shadow-lg transition">
              <Shield className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Instant Alerts
              </h3>
              <p className="text-slate-700">
                Emergency contacts are notified immediately when you check in, and if you miss a check-in.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-2xl border border-cyan-200 hover:shadow-lg transition">
              <Camera className="w-10 h-10 text-cyan-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Share Memories
              </h3>
              <p className="text-slate-700">
                Upload daily photos and videos to share your life. A visual diary of your wellness journey.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200 hover:shadow-lg transition">
              <TrendingUp className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-slate-900">
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
          <h2 className="text-4xl font-bold text-center mb-16">
            How It{" "}
            <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>

          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">
                  Sign Up
                </h3>
                <p className="text-slate-700">
                  Create your UOK account in seconds with your email and basic info.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">
                  Add Contacts
                </h3>
                <p className="text-slate-700">
                  Add up to 3 emergency contacts with their phone or WhatsApp numbers.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">
                  Check In Daily
                </h3>
                <p className="text-slate-700">
                  Check in 2-3 times a day with an emoji expressing your mood. Your contacts are instantly notified.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">
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
