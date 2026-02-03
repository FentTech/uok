import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Eye,
  Download,
  Check,
  AlertCircle,
  Calendar,
  DollarSign,
  CreditCard,
} from "lucide-react";

interface FeaturedAd {
  id: string;
  partnerId: string;
  partnerName: string;
  adType: "image" | "video" | "text";
  content: string; // URL or text
  title: string;
  expiresAt: string;
  createdAt: string;
  views: number;
  active: boolean;
  paymentId?: string;
}

interface Partner {
  id: string;
  name: string;
  email: string;
  paymentStatus: "pending" | "paid" | "expired";
  registeredAt: string;
  expiresAt: string;
  totalViews: number;
  ads: FeaturedAd[];
  paymentLink?: string;
}

export default function FeaturedPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [formData, setFormData] = useState({
    partnerName: "",
    email: "",
    adTitle: "",
    adType: "image" as "image" | "video" | "text",
    adContent: "",
  });
  const [selectedAds, setSelectedAds] = useState<FeaturedAd[]>([]);
  const [activeTab, setActiveTab] = useState<"register" | "manage" | "payment">(
    "register"
  );

  // Load partners from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("featuredPartners");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Check for expired partners
        const updated = parsed.map((p: Partner) => {
          const expiryDate = new Date(p.expiresAt);
          const now = new Date();
          if (now > expiryDate && p.paymentStatus === "paid") {
            return { ...p, paymentStatus: "expired" };
          }
          return p;
        });
        setPartners(updated);
        localStorage.setItem("featuredPartners", JSON.stringify(updated));
      } catch (e) {
        console.error("Error loading partners:", e);
      }
    }
  }, []);

  const handleRegisterPartner = () => {
    if (
      !formData.partnerName ||
      !formData.email ||
      !formData.adTitle ||
      !formData.adContent
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const partnerId = Date.now().toString();
      const now = new Date().toISOString();
      const expiryDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();

      const newPartner: Partner = {
        id: partnerId,
        name: formData.partnerName,
        email: formData.email,
        paymentStatus: "pending",
        registeredAt: now,
        expiresAt: expiryDate,
        totalViews: 0,
        ads: [
          {
            id: (Date.now() + 1).toString(),
            partnerId: partnerId,
            partnerName: formData.partnerName,
            adType: formData.adType,
            content: formData.adContent,
            title: formData.adTitle,
            expiresAt: expiryDate,
            createdAt: now,
            views: 0,
            active: false,
          },
        ],
        paymentLink: `https://paypal.me/AFenteng/1000`,
      };

      const updatedPartners = [...partners, newPartner];
      setPartners(updatedPartners);

      // Store in localStorage with error handling
      const jsonString = JSON.stringify(updatedPartners);
      localStorage.setItem("featuredPartners", jsonString);

      // Reset form
      setFormData({
        partnerName: "",
        email: "",
        adTitle: "",
        adType: "image",
        adContent: "",
      });

      alert(
        `Partner registered! Awaiting payment. Payment link: https://paypal.me/AFenteng/1000`
      );
      setShowRegistrationForm(false);
    } catch (error) {
      console.error("Error registering partner:", error);
      alert("Error registering partner. Please check the console for details.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Check file size (limit to 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          alert("File size exceeds 5MB limit. Please choose a smaller file.");
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            setFormData({
              ...formData,
              adContent: event.target?.result as string,
            });
          } catch (error) {
            console.error("Error setting form data:", error);
            alert("Error processing file. Please try again.");
          }
        };
        reader.onerror = () => {
          console.error("Error reading file");
          alert("Error reading file. Please try again.");
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Error uploading file. Please try again.");
      }
    }
  };

  const handlePayment = (partnerId: string) => {
    const partner = partners.find((p) => p.id === partnerId);
    if (partner?.paymentLink) {
      window.open(partner.paymentLink, "_blank");

      // Simulate payment confirmation
      setTimeout(() => {
        try {
          const updatedPartners = partners.map((p) => {
            if (p.id === partnerId) {
              return {
                ...p,
                paymentStatus: "paid" as const,
                ads: p.ads.map((ad) => ({ ...ad, active: true })),
              };
            }
            return p;
          });
          setPartners(updatedPartners);
          localStorage.setItem("featuredPartners", JSON.stringify(updatedPartners));
          alert("✓ Payment confirmed! Your ads are now active for 6 months.");
        } catch (error) {
          console.error("Error processing payment:", error);
          alert("Error processing payment. Please try again.");
        }
      }, 2000);
    }
  };

  const handleDeleteAd = (partnerId: string, adId: string) => {
    try {
      const updatedPartners = partners.map((p) => {
        if (p.id === partnerId) {
          return {
            ...p,
            ads: p.ads.filter((ad) => ad.id !== adId),
          };
        }
        return p;
      });
      setPartners(updatedPartners);
      localStorage.setItem("featuredPartners", JSON.stringify(updatedPartners));
    } catch (error) {
      console.error("Error deleting ad:", error);
      alert("Error deleting ad. Please try again.");
    }
  };

  const handleRenewPartner = (partnerId: string) => {
    const partner = partners.find((p) => p.id === partnerId);
    if (partner) {
      window.open(partner.paymentLink || `https://paypal.me/AFenteng/1000`, "_blank");
      setTimeout(() => {
        try {
          const expiryDate = new Date(
            Date.now() + 180 * 24 * 60 * 60 * 1000
          ).toISOString();

          const updatedPartners = partners.map((p) => {
            if (p.id === partnerId) {
              return {
                ...p,
                paymentStatus: "paid" as const,
                expiresAt: expiryDate,
              };
            }
            return p;
          });
          setPartners(updatedPartners);
          localStorage.setItem("featuredPartners", JSON.stringify(updatedPartners));
          alert("✓ Subscription renewed for 6 months!");
        } catch (error) {
          console.error("Error renewing subscription:", error);
          alert("Error renewing subscription. Please try again.");
        }
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-xl border-b border-cyan-400/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition">
            <ArrowLeft className="w-6 h-6" />
            <span className="font-semibold">Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Featured Partners & Advertising
          </h1>
          <div className="w-24"></div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-cyan-400/20">
          <button
            onClick={() => setActiveTab("register")}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              activeTab === "register"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-cyan-300 hover:text-cyan-200"
            }`}
          >
            Register Your Ad
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              activeTab === "manage"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-cyan-300 hover:text-cyan-200"
            }`}
          >
            Manage Ads ({partners.length})
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              activeTab === "payment"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-cyan-300 hover:text-cyan-200"
            }`}
          >
            Pricing & Payment
          </button>
        </div>

        {/* Registration Tab */}
        {activeTab === "register" && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Info Section */}
            <div className="bg-white/10 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-cyan-100 mb-6">
                Become a Featured Partner
              </h2>

              <div className="space-y-4 text-cyan-300/80">
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-cyan-100">Ads Run Continuously</p>
                    <p className="text-sm">
                      Your ads appear on dashboard (rotating every 2 seconds) and community shared section
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-cyan-100">6-Month Campaign</p>
                    <p className="text-sm">
                      Run your campaign for 6 months non-negotiable at $1,000 USD
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-cyan-100">Analytics & Tracking</p>
                    <p className="text-sm">
                      Receive weekly email reports with view counts and engagement metrics
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-cyan-100">Non-Refundable</p>
                    <p className="text-sm">
                      All sales are final. No refunds or cancellations after payment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="bg-white/10 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-cyan-100 mb-6">Register Your Ad</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-cyan-300 text-sm font-semibold mb-2">
                    Partner/Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.partnerName}
                    onChange={(e) =>
                      setFormData({ ...formData, partnerName: e.target.value })
                    }
                    placeholder="Your company name"
                    className="w-full px-4 py-2 bg-white/10 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-400/50"
                  />
                </div>

                <div>
                  <label className="block text-cyan-300 text-sm font-semibold mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="partner@company.com"
                    className="w-full px-4 py-2 bg-white/10 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-400/50"
                  />
                </div>

                <div>
                  <label className="block text-cyan-300 text-sm font-semibold mb-2">
                    Ad Title
                  </label>
                  <input
                    type="text"
                    value={formData.adTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, adTitle: e.target.value })
                    }
                    placeholder="Your ad headline"
                    className="w-full px-4 py-2 bg-white/10 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-400/50"
                  />
                </div>

                <div>
                  <label className="block text-cyan-300 text-sm font-semibold mb-2">
                    Ad Type
                  </label>
                  <select
                    value={formData.adType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        adType: e.target.value as "image" | "video" | "text",
                      })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-cyan-400/30 rounded-lg text-cyan-100"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="text">Text</option>
                  </select>
                </div>

                {formData.adType !== "text" ? (
                  <div>
                    <label className="block text-cyan-300 text-sm font-semibold mb-2">
                      Upload {formData.adType === "video" ? "Video" : "Image"}
                    </label>
                    <input
                      type="file"
                      accept={formData.adType === "video" ? "video/*" : "image/*"}
                      onChange={handleFileUpload}
                      className="w-full px-4 py-2 bg-white/10 border border-cyan-400/30 rounded-lg text-cyan-100"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-cyan-300 text-sm font-semibold mb-2">
                      Ad Text/Description
                    </label>
                    <textarea
                      value={formData.adContent}
                      onChange={(e) =>
                        setFormData({ ...formData, adContent: e.target.value })
                      }
                      placeholder="Your ad message or description"
                      rows={4}
                      className="w-full px-4 py-2 bg-white/10 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-400/50"
                    />
                  </div>
                )}

                <button
                  onClick={handleRegisterPartner}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-lg transition"
                >
                  Register & Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === "manage" && (
          <div className="space-y-6">
            {partners.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-12 text-center">
                <p className="text-cyan-300 text-lg">
                  No featured partners yet. Register one to get started!
                </p>
              </div>
            ) : (
              partners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white/10 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-cyan-100">
                        {partner.name}
                      </h3>
                      <p className="text-cyan-400 text-sm">{partner.email}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
                      partner.paymentStatus === "paid"
                        ? "bg-green-500/20 text-green-400"
                        : partner.paymentStatus === "expired"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {partner.paymentStatus === "paid"
                        ? "✓ Active"
                        : partner.paymentStatus === "expired"
                        ? "⚠ Expired"
                        : "⏳ Pending Payment"}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-cyan-400/60 text-sm">Total Views</p>
                      <p className="text-2xl font-bold text-cyan-100">
                        {partner.totalViews}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-cyan-400/60 text-sm">Expires</p>
                      <p className="text-lg font-bold text-cyan-100">
                        {new Date(partner.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-cyan-400/60 text-sm">Active Ads</p>
                      <p className="text-2xl font-bold text-cyan-100">
                        {partner.ads.filter((ad) => ad.active).length}
                      </p>
                    </div>
                  </div>

                  {/* Ads Grid */}
                  <div className="space-y-3 mb-6">
                    <p className="text-cyan-100 font-semibold">Uploaded Ads:</p>
                    {partner.ads.length === 0 ? (
                      <p className="text-cyan-400/60 text-sm">No ads uploaded</p>
                    ) : (
                      partner.ads.map((ad) => (
                        <div
                          key={ad.id}
                          className="bg-white/5 rounded-lg p-4 flex justify-between items-center"
                        >
                          <div className="flex-1">
                            <p className="text-cyan-100 font-medium">{ad.title}</p>
                            <p className="text-cyan-400/60 text-sm">
                              {ad.adType.toUpperCase()} • {ad.views} views
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeleteAd(partner.id, ad.id)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Actions */}
                  {partner.paymentStatus === "pending" && (
                    <button
                      onClick={() => handlePayment(partner.id)}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-5 h-5" />
                      Proceed to PayPal Payment ($1000)
                    </button>
                  )}

                  {partner.paymentStatus === "expired" && (
                    <button
                      onClick={() => handleRenewPartner(partner.id)}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-5 h-5" />
                      Renew Subscription ($1000)
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === "payment" && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Pricing Card */}
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-400/40 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-cyan-100 mb-2">
                Featured Ad Package
              </h2>
              <p className="text-cyan-300/80 mb-8">Complete 6-Month Campaign</p>

              <div className="mb-8">
                <p className="text-5xl font-bold text-cyan-100 mb-2">$1,000</p>
                <p className="text-cyan-400/80">USD for 6 months</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-cyan-100">Rotating ads on dashboard (every 2 seconds)</p>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-cyan-100">Display in community shared section</p>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-cyan-100">Minimum 10 minutes daily visibility</p>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-cyan-100">Weekly view count emails</p>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-cyan-100">Download reports & analytics</p>
                </div>
              </div>

              <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-4 mb-8">
                <p className="text-red-300 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Non-Refundable & Final Sale
                </p>
                <p className="text-red-200/80 text-sm mt-2">
                  All sales are final. No refunds, cancellations, or modifications after payment is made.
                </p>
              </div>

              <a
                href="https://paypal.me/AFenteng/1000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg transition text-center flex items-center justify-center gap-2"
              >
                <DollarSign className="w-5 h-5" />
                Pay via PayPal: $1000
              </a>
            </div>

            {/* Renewal & Management */}
            <div className="bg-white/10 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-cyan-100 mb-6">
                Renewal & Management
              </h3>

              <div className="space-y-6">
                <div className="bg-white/5 rounded-lg p-6">
                  <h4 className="text-cyan-100 font-bold mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    6-Month Cycle
                  </h4>
                  <p className="text-cyan-300/80 text-sm">
                    Your campaign runs for exactly 6 months from the date of payment. At the end of this period, your ads will automatically stop displaying.
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-6">
                  <h4 className="text-cyan-100 font-bold mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    Renewal Notification
                  </h4>
                  <p className="text-cyan-300/80 text-sm">
                    We'll send you an email 30 days before expiration. You can renew your subscription for another 6 months at the same $1,000 rate.
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-6">
                  <h4 className="text-cyan-100 font-bold mb-3 flex items-center gap-2">
                    <Download className="w-5 h-5 text-green-400" />
                    Ad Management
                  </h4>
                  <p className="text-cyan-300/80 text-sm">
                    Upload, manage, and remove multiple ads. Switch between image, video, and text formats anytime during your subscription.
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-6">
                  <h4 className="text-cyan-100 font-bold mb-3 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-400" />
                    View Analytics
                  </h4>
                  <p className="text-cyan-300/80 text-sm">
                    Receive weekly emails showing how many users viewed your ads. Track engagement throughout your campaign.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
