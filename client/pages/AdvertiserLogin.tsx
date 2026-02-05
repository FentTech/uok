import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail, AlertCircle } from "lucide-react";
import { advertiserAuthService } from "../lib/advertiserAuth";

export default function AdvertiserLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize demo advertiser on component mount
  useEffect(() => {
    advertiserAuthService.initializeDemoAdvertiser();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Verify against stored credentials
    const isValidAdvertiser = advertiserAuthService.verifyLogin(
      email,
      password,
    );

    if (isValidAdvertiser) {
      // Store advertiser session
      localStorage.setItem("advertiserEmail", email);
      localStorage.setItem("advertiserLoggedIn", "true");
      localStorage.setItem("advertiserLoginTime", new Date().toISOString());

      navigate("/advertiser-analytics");
    } else {
      setError("Invalid email or password. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-600/30 rounded-lg">
              <Lock className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Advertiser Portal
          </h1>
          <p className="text-purple-300/80">
            Access your private analytics and ad performance data
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-xl border border-purple-400/30 rounded-2xl p-8 mb-6">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-400/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 text-sm font-medium">Login Failed</p>
                <p className="text-red-200/80 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="text-purple-300/80 text-sm font-medium block mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-purple-400/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="advertiser@wellness.com"
                  className="w-full pl-10 pr-4 py-3 bg-purple-900/30 border border-purple-400/30 rounded-lg text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400 transition"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="text-purple-300/80 text-sm font-medium block mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-purple-400/60" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-purple-900/30 border border-purple-400/30 rounded-lg text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400 transition"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? "Logging in..." : "Login to Analytics"}
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4 mb-6">
          <h3 className="text-purple-200 font-semibold text-sm mb-3">
            Demo Credentials
          </h3>
          <div className="space-y-2 text-sm text-purple-300/80">
            <div>
              <span className="font-medium">Email:</span>{" "}
              advertiser@wellness.com
            </div>
            <div>
              <span className="font-medium">Password:</span> admin123
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
          <h3 className="text-blue-200 font-semibold text-sm mb-2">
            ℹ️ Private Analytics
          </h3>
          <p className="text-blue-300/80 text-xs">
            This portal is exclusively for authorized advertisers. Your detailed
            ad performance data, engagement metrics, and campaign analytics are
            private and secure.
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            to="/dashboard"
            className="text-purple-300/80 hover:text-purple-300 text-sm transition"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
