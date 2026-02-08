import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { analyticsService, DEMO_ADS } from "../lib/analytics";

interface MediaPreRollAdProps {
  onAdComplete: () => void;
  adDuration?: number; // in seconds, default 10
}

export default function MediaPreRollAd({
  onAdComplete,
  adDuration = 20, // Changed to 20 seconds for pre-roll ads
}: MediaPreRollAdProps) {
  const [timeRemaining, setTimeRemaining] = useState(adDuration);
  const [canSkip, setCanSkip] = useState(false); // Skip available after 10 seconds
  const [currentAd] = useState(() => {
    // Randomly select an ad from demo ads
    return DEMO_ADS[Math.floor(Math.random() * DEMO_ADS.length)];
  });

  // Track ad impression
  useEffect(() => {
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
  }, [currentAd]);

  // Enable skip after 10 seconds (out of 20 second ad)
  useEffect(() => {
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, (adDuration - 10) * 1000); // 10 seconds into the ad

    return () => clearTimeout(skipTimer);
  }, [adDuration]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      onAdComplete();
      return;
    }

    const timer = setTimeout(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRemaining, onAdComplete]);

  const handleSkip = () => {
    const userEmail = localStorage.getItem("userEmail") || "user";
    const today = new Date().toISOString().split("T")[0];

    // Track ad click (when user interacts with skip)
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

    onAdComplete();
  };

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

    // In a real scenario, this would open an external link
    console.log("Ad clicked:", currentAd.title);
  };

  const percentage = (timeRemaining / adDuration) * 100;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm">
      {/* Ad Container - Full screen blocking ad */}
      <div className="bg-white rounded-lg overflow-hidden max-w-md w-full mx-4 shadow-2xl border-2 border-gray-300">
        {/* Ad Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{currentAd.image}</div>
              <div>
                <h2 className="font-bold text-lg">{currentAd.title}</h2>
                <p className="text-sm text-white/90">{currentAd.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ad Content */}
        <div className="p-6 space-y-4">
          {/* Timer Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-gray-800">
                ⏱️ Video plays in {timeRemaining}s
              </span>
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {Math.round(percentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden shadow-sm">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-500 h-full transition-all duration-1000 shadow-lg"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Ad Copy */}
          <div>
            <p className="text-gray-700 text-sm">
              {currentAd.type === "promotion"
                ? "Check out this special offer:"
                : "Learn about this feature:"}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              You'll be able to continue shortly. Click to learn more now.
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleAdClick}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3 rounded-lg transition-all"
          >
            {currentAd.cta}
          </button>

          {/* Skip Button (available after 10 seconds) */}
          {canSkip && timeRemaining > 0 ? (
            <button
              onClick={handleSkip}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 text-sm transition-colors rounded"
            >
              Skip Ad (Skip available)
            </button>
          ) : (
            <p className="text-center text-sm text-gray-600">
              Skip available in {adDuration - timeRemaining}s...
            </p>
          )}

          {/* Auto-continue message */}
          {timeRemaining <= 2 && (
            <p className="text-center text-xs text-gray-500">
              Continuing automatically...
            </p>
          )}
        </div>

        {/* Close hint */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">This is a demo advertisement</p>
        </div>
      </div>
    </div>
  );
}
