import { Link } from "react-router-dom";
import { Heart, Check } from "lucide-react";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-600">UOK</span>
          </Link>
          <Link
            to="/"
            className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium transition"
          >
            Back
          </Link>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-blue-600 mb-6">Pricing</h1>
          <p className="text-xl text-gray-700 mb-16">
            UOK is completely{" "}
            <span className="font-bold text-blue-600">free</span> and always
            will be
          </p>

          <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">
              Free Forever Plan
            </h2>
            <ul className="text-left space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  Unlimited daily check-ins (2-3 times per day)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  Up to 3 bonded emergency contacts
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  Share photos and videos with community
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  Real-time notifications and wellness insights
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  Privacy-first design with automatic data deletion
                </span>
              </li>
            </ul>

            <p className="text-gray-600 italic">
              No credit card required. No ads. No hidden fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
