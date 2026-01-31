import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-cyan-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
              UOK
            </span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-lg">
          <div className="mb-8">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent mb-4">
              404
            </h1>
            <p className="text-3xl font-bold text-slate-900 mb-2">
              Page Not Found
            </p>
            <p className="text-lg text-slate-600 mb-8">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-cyan-100 p-8 mb-8">
            <p className="text-slate-600 mb-4">
              You tried to access: <span className="font-mono text-cyan-600">{location.pathname}</span>
            </p>
            <p className="text-slate-600">
              Don't worry, use the button below to get back to UOK.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-200 transition"
          >
            <Home className="w-5 h-5" />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
