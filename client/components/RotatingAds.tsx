import { useState, useEffect } from "react";
import { AlertCircle, ExternalLink } from "lucide-react";

interface Ad {
  id: string;
  partnerId: string;
  partnerName: string;
  adType: "image" | "video" | "text";
  content: string;
  title: string;
  expiresAt: string;
  createdAt: string;
  views: number;
  active: boolean;
}

export default function RotatingAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const currentAd = ads.length > 0 ? ads[currentAdIndex] : null;

  // Load active ads from localStorage
  useEffect(() => {
    const loadAds = () => {
      const featured = localStorage.getItem("featuredPartners");
      if (featured) {
        try {
          const partners = JSON.parse(featured);
          // Get all active ads from paid partners
          const activeAds: Ad[] = [];
          partners.forEach((partner: any) => {
            if (partner.paymentStatus === "paid" && partner.ads) {
              partner.ads.forEach((ad: Ad) => {
                if (ad.active) {
                  activeAds.push(ad);
                }
              });
            }
          });
          setAds(activeAds);
        } catch (e) {
          console.error("Error loading ads:", e);
        }
      }
    };

    loadAds();
  }, []);

  // Rotate ads every 2 seconds
  useEffect(() => {
    if (ads.length === 0) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [ads.length]);

  // Track view
  useEffect(() => {
    if (currentAd && ads.length > 0) {
      // Update view count in localStorage
      const featured = localStorage.getItem("featuredPartners");
      if (featured) {
        try {
          const partners = JSON.parse(featured);
          const updated = partners.map((partner: any) => {
            if (partner.id === currentAd.partnerId) {
              return {
                ...partner,
                totalViews: (partner.totalViews || 0) + 1,
                ads: partner.ads.map((ad: Ad) => {
                  if (ad.id === currentAd.id) {
                    return { ...ad, views: (ad.views || 0) + 1 };
                  }
                  return ad;
                }),
              };
            }
            return partner;
          });
          localStorage.setItem("featuredPartners", JSON.stringify(updated));
        } catch (e) {
          console.error("Error tracking view:", e);
        }
      }
    }
  }, [currentAdIndex]);

  if (!currentAd || ads.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-xl border border-amber-400/30 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {currentAd.adType === "text" ? (
            <div>
              <h3 className="text-lg font-bold text-amber-50 mb-2">
                {currentAd.title}
              </h3>
              <p className="text-amber-200/80 text-sm mb-3">
                {currentAd.content}
              </p>
              <p className="text-amber-400/60 text-xs">
                by {currentAd.partnerName}
              </p>
            </div>
          ) : currentAd.adType === "image" ? (
            <div>
              <img
                src={currentAd.content}
                alt={currentAd.title}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
              <h3 className="text-lg font-bold text-amber-50 mb-1">
                {currentAd.title}
              </h3>
              <p className="text-amber-400/60 text-xs">
                by {currentAd.partnerName}
              </p>
            </div>
          ) : (
            <div>
              <video
                src={currentAd.content}
                controls
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
              <h3 className="text-lg font-bold text-amber-50 mb-1">
                {currentAd.title}
              </h3>
              <p className="text-amber-400/60 text-xs">
                by {currentAd.partnerName}
              </p>
            </div>
          )}
        </div>

        {/* Ad Info */}
        <div className="flex flex-col gap-2">
          <a
            href="https://paypal.me/AFenteng/1000"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm transition flex items-center gap-2"
          >
            Become a Partner
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Ad Rotation Indicator */}
          <div className="text-right">
            <p className="text-amber-400/60 text-xs">
              Ad {currentAdIndex + 1} of {ads.length}
            </p>
            <div className="flex gap-1 mt-1">
              {ads.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition ${
                    idx === currentAdIndex
                      ? "bg-amber-400 w-4"
                      : "bg-amber-400/30 w-2"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
