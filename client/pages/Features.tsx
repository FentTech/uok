import { Link } from "react-router-dom";
import { Heart, CheckCircle, Bell, Shield, Users, TrendingUp } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Daily Check-ins",
      description: "Check in 2-3 times daily to let loved ones know you're okay",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Smart Notifications",
      description: "Receive reminders and alerts from bonded contacts",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Bond Contacts",
      description: "Connect with up to 3 emergency contacts securely",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy First",
      description: "Your data is encrypted and automatically deleted after 72 hours",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Wellness Insights",
      description: "Track your wellness patterns and get personalized insights",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Share Memories",
      description: "Share photos and videos with your community or bonded contacts",
    },
  ];

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
            to="/login"
            className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium transition"
          >
            Back
          </Link>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-blue-600 mb-6">Our Features</h1>
          <p className="text-xl text-gray-700 mb-16 max-w-2xl">
            UOK is designed with wellness in mind. Here's what makes us special:
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
