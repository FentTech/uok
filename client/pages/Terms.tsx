import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function Terms() {
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
          <h1 className="text-5xl font-bold text-blue-600 mb-2">
            Terms of Service
          </h1>
          <p className="text-gray-600 mb-8">Last updated: February 2025</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using UOK, you accept and agree to be bound by the
                terms and provision of this agreement. If you do not agree to abide by
                the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                2. Use License
              </h2>
              <p>
                Permission is granted to temporarily download one copy of the materials
                (information or software) on UOK for personal, non-commercial transitory
                viewing only. This is the grant of a license, not a transfer of title.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                3. Disclaimer
              </h2>
              <p>
                The materials on UOK are provided on an 'as is' basis. UOK makes no
                warranties, expressed or implied, and hereby disclaims and negates all
                other warranties including, without limitation, implied warranties or
                conditions of merchantability, fitness for a particular purpose.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                4. Limitations
              </h2>
              <p>
                In no event shall UOK or its suppliers be liable for any damages
                (including, without limitation, damages for loss of data or profit, or
                due to business interruption) arising out of the use or inability to use
                the materials on UOK.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                5. Accuracy of Materials
              </h2>
              <p>
                The materials appearing on UOK could include technical, typographical,
                or photographic errors. UOK does not warrant that any of the materials
                on the site are accurate, complete, or current.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                6. Links
              </h2>
              <p>
                UOK has not reviewed all of the sites linked to its website and is not
                responsible for the contents of any such linked site. The inclusion of
                any link does not imply endorsement by UOK of the site. Use of any such
                linked website is at the user's own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                7. Modifications
              </h2>
              <p>
                UOK may revise these terms of service for its website at any time
                without notice. By using this website, you are agreeing to be bound by
                the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                8. Governing Law
              </h2>
              <p>
                These terms and conditions are governed by and construed in accordance
                with the laws of your jurisdiction and you irrevocably submit to the
                exclusive jurisdiction of the courts located there.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
