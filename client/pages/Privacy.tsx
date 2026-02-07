import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function Privacy() {
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
          <h1 className="text-5xl font-bold text-blue-600 mb-2">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: February 2025</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                1. Introduction
              </h2>
              <p>
                UOK ("we" or "us" or "our") operates the website. This page informs
                you of our policies regarding the collection, use, and disclosure of
                personal data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                2. Information Collection
              </h2>
              <p>
                We collect information you provide directly, such as when you create
                an account, including your name, email, and phone number. We also
                collect device information and usage patterns to improve our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                3. How We Use Information
              </h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Provide and maintain our service</li>
                <li>Notify you about changes to our service</li>
                <li>Send notifications about your check-ins</li>
                <li>Gather analytics to improve user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                4. Data Retention
              </h2>
              <p>
                Check-in records are automatically deleted after 72 hours. Account
                information is retained until you delete your account. You can request
                deletion of your data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                5. Security
              </h2>
              <p>
                We use industry-standard encryption to protect your data. However, no
                method of transmission over the internet is 100% secure. We cannot
                guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                6. Changes to This Policy
              </h2>
              <p>
                We may update this policy occasionally. We will notify you of any
                changes by posting the new policy on this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">7. Contact Us</h2>
              <p>
                If you have any questions about this policy, please contact us at
                support@youok.fit
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
