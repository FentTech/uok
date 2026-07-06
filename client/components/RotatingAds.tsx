import { useState, useEffect } from "react";
import { ChevronRight, X } from "lucide-react";
import { analyticsService, DEMO_ADS } from "../lib/analytics";

interface Ad {
  id: string;
  title: string;
  description: string;
  image: string;
  cta: string;
  type: "promotion" | "feature";
}

interface RotatingAdsProps {
  ads?: Ad[];
  autoRotateInterval?: number; // milliseconds, default 2000 (2 seconds)
  height?: string;
  onAdClick?: (ad: Ad) => void;
}

export default function RotatingAds({
  ads = DEMO_ADS,
  autoRotateInterval = 2000,
  height = "h-96",
  onAdClick,
}: RotatingAdsProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const currentAd = ads[currentAdIndex];

  // Auto-rotate ads
  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, autoRotateInterval);

    return () => clearInterval(timer);
  }, [ads.length, autoRotateInterval, isVisible]);

  // Track ad impression when it changes
  useEffect(() => {
    if (currentAd && isVisible) {
      const userEmail = localStorage.getItem("userEmail") || "user";
      const today = new Date().toISOString().split("T")[0];

      analyticsService.trackEvent({
        type: "ad-impression",
        targetId: currentAd.id,
        targetType: "ad",
        userEmail,
        timestamp: new Date().toISOString(),
        date: today,
        metadata: {
          adTitle: currentAd.title,
          adType: currentAd.type,
        },
      });
    }
  }, [currentAdIndex, currentAd, isVisible]);

  const handleAdClick = () => {
    const userEmail = localStorage.getItem("userEmail") || "user";
    const today = new Date().toISOString().split("T")[0];

    // Track ad click
    analyticsService.trackEvent({
      type: "ad-click",
      targetId: currentAd.id,
      targetType: "ad",
      userEmail,
      timestamp: new Date().toISOString(),
      date: today,
      metadata: {
        adTitle: currentAd.title,
        adType: currentAd.type,
      },
    });

    // Call external handler if provided
    if (onAdClick) {
      onAdClick(currentAd);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || ads.length === 0) {
    return null;
  }

  return (
    <div
      className={`${height} w-40 mx-auto bg-gradient-to-b from-purple-600 to-pink-500 rounded-3xl p-4 flex flex-col items-center justify-between shadow-lg relative group overflow-hidden`}
      style={{ minHeight: height.includes("h-") ? undefined : "384px" }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/40 rounded-full p-1"
        title="Close ad"
      >
        <X size={16} className="text-white" />
      </button>

      {/* Ad Content - Stable container */}
      <div className="flex flex-col items-center gap-2 flex-1 justify-center min-h-0">
        {/* Ad Image/Icon - Fixed size to prevent shift */}
        <div className="text-5xl flex-shrink-0 select-none w-16 h-16 flex items-center justify-center">
          {currentAd.image}
        </div>

        {/* Ad Text - Centered text for vertical layout */}
        <div className="flex-1 min-w-0 overflow-hidden text-center">
          <h3 className="font-bold text-white text-sm lg:text-base line-clamp-2">
            {currentAd.title}
          </h3>
          <p className="text-white/80 text-xs lg:text-sm line-clamp-2">
            {currentAd.description}
          </p>
        </div>
      </div>

      {/* CTA Button - Fixed width */}
      <button
        onClick={handleAdClick}
        className="flex-shrink-0 bg-white/30 hover:bg-white/50 text-white font-semibold py-2 px-4 rounded-full flex items-center gap-1 text-xs lg:text-sm transition-colors whitespace-nowrap"
      >
        {currentAd.cta}
        <ChevronRight size={16} />
      </button>

      {/* Ad Indicator Dots - Fixed position - Vertical */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1.5 pointer-events-auto">
        {ads.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentAdIndex(index)}
            className={`transition-all rounded-full flex-shrink-0 ${
              index === currentAdIndex
                ? "bg-white w-2 h-2"
                : "bg-white/40 hover:bg-white/60 w-1.5 h-1.5"
            }`}
            title={`Go to ad ${index + 1}`}
          />
        ))}
      </div>

      {/* Animation indicator - Smooth progress bar - Vertical */}
      <div className="absolute bottom-0 right-0 top-0 w-0.5 bg-white/40 overflow-hidden">
        <div
          className="w-full bg-white"
          style={{
            height: "100%",
            animation: `progress ${autoRotateInterval}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes progress {
          from {
            height: 100%;
          }
          to {
            height: 0%;
          }
        }
      `}</style>
    </div>
  );
}
