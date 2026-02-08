import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { moodSongs } from "../data/songs";

export default function Index() {
  const { t } = useTranslation(["home", "common"]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation with Language Selector */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-600">UOK</span>
          </div>
          <div className="flex gap-3 items-center">
            {/* Language Selector */}
            <LanguageSelector />
            <Link
              to="/login"
              className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium transition hidden sm:block"
            >
              {t("common:nav.login")}
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {t("common:nav.signup")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
                <span className="text-blue-600">
                  {t("home:hero.mainTitle")}
                </span>
                <br />
                <span className="text-black">{t("home:hero.subTitle")}</span>
              </h1>
              <p className="text-xl text-slate-700 mb-8 leading-relaxed">
                {t("home:hero.description")}
              </p>
              <div className="flex gap-4">
                <Link
                  to="/signup"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  {t("home:hero.cta")}
                </Link>
                <button className="px-8 py-3 border-2 border-slate-300 text-black rounded-lg hover:border-blue-600 hover:text-blue-600 transition font-semibold">
                  {t("home:hero.learnMore")}
                </button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur-3xl opacity-10"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-blue-100">
                <div className="space-y-4">
                  {/* Placeholder - Can be updated with translations for time slots */}
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-xl">
                      😊
                    </div>
                    <div>
                      <p className="font-semibold text-black">
                        {t("dashboard:timeSlots.morning")}{" "}
                        {t("common:common.loading")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-black">
            {t("home:features.title")}
          </h2>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">UOK</span>
              </div>
              <p className="text-sm text-slate-400">
                {t("common:footer.description")}
              </p>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 UOK. {t("common:footer.rights")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
