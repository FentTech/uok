import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, Mail, Save, X } from "lucide-react";

export default function UserProfile() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Load saved email from localStorage
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail && storedEmail !== "You") {
      setSavedEmail(storedEmail);
      setEmail(storedEmail);
    }
  }, []);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSaveEmail = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      localStorage.setItem("userEmail", email);
      setSavedEmail(email);
      setIsEditing(false);
      setSuccessMessage("✓ Email saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleCancel = () => {
    setEmail(savedEmail);
    setIsEditing(false);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
      {/* Header */}
      <nav className="bg-white/10 backdrop-blur-xl border-b border-cyan-400/20 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              UOK
            </span>
          </Link>
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            User Profile
          </h1>
          <p className="text-cyan-300/80">
            Manage your account information and preferences
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-400/50 rounded-lg">
            <p className="text-green-300 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Email Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-cyan-100">Email Address</h2>
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <div className="bg-white/5 border border-cyan-400/20 rounded-lg p-4">
                <p className="text-sm text-cyan-300/60 mb-2">Current Email</p>
                <p className="text-xl font-semibold text-cyan-100">
                  {savedEmail || "Not set"}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/50 text-white font-medium rounded-lg transition"
              >
                {savedEmail ? "Update Email" : "Add Email"}
              </button>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                <p className="text-sm text-blue-300">
                  <span className="font-semibold">Why we need your email:</span>
                  <br />
                  • Check-in confirmations will be sent to your email
                  <br />
                  • Emergency alerts about missed check-ins
                  <br />• Your bonded contacts can reach you via the app
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-cyan-200 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.email;
                        return newErrors;
                      });
                    }
                  }}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-white/10 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-2">{errors.email}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveEmail}
                  className="flex-1 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:shadow-green-500/50 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Email
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-cyan-300 font-medium rounded-lg transition flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Data Retention Policy */}
        <div className="bg-white/10 backdrop-blur-xl border border-purple-400/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-purple-100 mb-4">
            📊 Data Retention Policy
          </h2>

          <div className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4">
              <p className="text-purple-200 font-semibold mb-2">
                ⏰ Check-in Data Retention
              </p>
              <p className="text-purple-300 text-sm">
                All check-in records are automatically deleted after{" "}
                <span className="font-bold">72 hours</span>. This helps us save
                storage space and maintain your privacy.
              </p>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4">
              <p className="text-cyan-200 font-semibold mb-2">
                💾 What Gets Deleted
              </p>
              <ul className="text-cyan-300 text-sm space-y-1">
                <li>
                  • Individual check-in records (mood, timestamp, details)
                </li>
                <li>• Check-in notifications older than 72 hours</li>
                <li>• Temporary session data</li>
              </ul>
            </div>

            <div className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-4">
              <p className="text-orange-200 font-semibold mb-2">
                ✅ What Is Kept
              </p>
              <ul className="text-orange-300 text-sm space-y-1">
                <li>• Your profile and account information</li>
                <li>• Bonded contact relationships</li>
                <li>• Shared memories and community posts</li>
                <li>• Email address and preferences</li>
              </ul>
            </div>

            <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4">
              <p className="text-green-200 font-semibold mb-2">
                🔒 Privacy & Security
              </p>
              <p className="text-green-300 text-sm">
                All data is stored locally on your device. We do not send
                personal information to external servers. Your privacy is our
                priority.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
