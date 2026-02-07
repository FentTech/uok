import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function About() {
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-blue-600 mb-6">About UOK</h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                Our Mission
              </h2>
              <p className="text-gray-700 leading-relaxed">
                UOK is dedicated to keeping families and loved ones connected
                through simple, meaningful wellness check-ins. We believe
                everyone deserves to know that the people they care about are
                safe and doing okay.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                How It Works
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Check in 2-3 times daily by selecting an emoji that represents
                how you're feeling. Your bonded emergency contacts receive
                instant notifications, letting them know you're okay. It's that
                simple.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                Privacy & Security
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is our top priority. All check-in records are
                automatically deleted after 72 hours. We use encrypted
                connections and never sell your data. You're in complete control
                of who can see your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                Our Values
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Simple and intuitive design for everyone</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Complete transparency about how your data is used</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Forever free with no hidden costs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Building a community that cares</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
