import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  LogOut,
  Settings,
  Image,
  Video,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Music,
  Trash2,
} from "lucide-react";
import { moodSongs } from "../data/songs";

interface CheckIn {
  id: string;
  emoji: string;
  mood: string;
  time: string;
  date: string;
}

interface MediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  timestamp: string;
}

const MOOD_EMOJIS = [
  { emoji: "😊", mood: "Great" },
  { emoji: "🙂", mood: "Good" },
  { emoji: "😐", mood: "Okay" },
  { emoji: "😔", mood: "Not Great" },
  { emoji: "😴", mood: "Tired" },
  { emoji: "🎉", mood: "Excited" },
  { emoji: "😰", mood: "Anxious" },
  { emoji: "😍", mood: "Happy" },
];

export default function Dashboard() {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [checkIns, setCheckIns] = useState<CheckIn[]>([
    {
      id: "1",
      emoji: "😊",
      mood: "Great",
      time: "08:30 AM",
      date: "Today",
    },
    {
      id: "2",
      emoji: "🎉",
      mood: "Excited",
      time: "02:15 PM",
      date: "Today",
    },
  ]);
  const [todayCheckInCount, setTodayCheckInCount] = useState(2);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const handleCheckIn = (emoji: string, mood: string) => {
    if (todayCheckInCount >= 3) {
      alert("You've reached your maximum check-ins for today (3)");
      return;
    }

    const now = new Date();
    const newCheckIn: CheckIn = {
      id: Date.now().toString(),
      emoji,
      mood,
      time: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: "Today",
    };

    setCheckIns([newCheckIn, ...checkIns]);
    setTodayCheckInCount((prev) => Math.min(prev + 1, 3));
    setSelectedMood(emoji);

    // Show confirmation
    setTimeout(() => setSelectedMood(null), 2000);
  };

  const checkInStatus = () => {
    if (todayCheckInCount < 2) {
      return {
        icon: AlertCircle,
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: `You need ${2 - todayCheckInCount} more check-in${2 - todayCheckInCount > 1 ? "s" : ""} today`,
      };
    } else if (todayCheckInCount === 2) {
      return {
        icon: Clock,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "1 more check-in available today (optional)",
      };
    } else {
      return {
        icon: CheckCircle,
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
        text: "Great! You've completed your daily check-ins",
      };
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newMedia: MediaItem = {
            id: Date.now().toString() + Math.random(),
            type: "photo",
            url: event.target?.result as string,
            timestamp: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setMediaItems([newMedia, ...mediaItems]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newMedia: MediaItem = {
            id: Date.now().toString() + Math.random(),
            type: "video",
            url: event.target?.result as string,
            timestamp: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setMediaItems([newMedia, ...mediaItems]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const deleteMedia = (id: string) => {
    setMediaItems(mediaItems.filter((item) => item.id !== id));
  };

  const status = checkInStatus();
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-purple-50">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-cyan-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
              UOK
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition">
              <Settings className="w-6 h-6 text-slate-700" />
            </button>
            <button className="p-2 hover:bg-red-50 rounded-lg transition text-red-600">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome Back! 👋
          </h1>
          <p className="text-slate-600">Check in with how you're feeling today</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Check-in Section */}
          <div className="md:col-span-2 space-y-8">
            {/* Status Card */}
            <div
              className={`${status.bg} border ${status.border} rounded-2xl p-6`}
            >
              <div className="flex items-center gap-3">
                <StatusIcon className={`w-8 h-8 ${status.color}`} />
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Daily Check-in Status
                  </h3>
                  <p className={`text-sm ${status.color}`}>{status.text}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-full ${
                      i < todayCheckInCount
                        ? "bg-gradient-to-r from-cyan-500 to-purple-500"
                        : "bg-slate-300"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Check-in Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-cyan-100 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                How are you feeling?
              </h2>

              <div className="grid grid-cols-4 gap-3 mb-6">
                {MOOD_EMOJIS.map((item) => (
                  <button
                    key={item.emoji}
                    onClick={() => handleCheckIn(item.emoji, item.mood)}
                    disabled={todayCheckInCount >= 3}
                    className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition ${
                      selectedMood === item.emoji
                        ? "bg-gradient-to-br from-cyan-400 to-cyan-500 shadow-lg scale-110"
                        : "bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                  >
                    <span className="text-3xl">{item.emoji}</span>
                    <span
                      className={`text-xs font-medium mt-1 ${
                        selectedMood === item.emoji
                          ? "text-white"
                          : "text-slate-700"
                      }`}
                    >
                      {item.mood}
                    </span>
                  </button>
                ))}
              </div>

              {selectedMood && (
                <div className="bg-gradient-to-r from-green-50 to-cyan-50 border border-green-200 rounded-lg p-6">
                  <p className="text-green-700 font-semibold mb-4 text-center">
                    ✓ Check-in recorded! Your contacts have been notified.
                  </p>

                  {/* Inspiration Songs */}
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Music className="w-5 h-5 text-purple-600" />
                      <p className="font-semibold text-slate-900">Inspiration Playlist</p>
                    </div>
                    <div className="space-y-2">
                      {moodSongs[
                        MOOD_EMOJIS.find((m) => m.emoji === selectedMood)?.mood || ""
                      ]?.map((song, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3">
                          <p className="font-medium text-slate-900 text-sm">{song.title}</p>
                          <p className="text-xs text-slate-600">{song.artist}</p>
                          <p className="text-xs text-purple-600 mt-1">{song.vibe}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Media Upload Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-cyan-100 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Share Your Day
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <button className="p-8 border-2 border-dashed border-cyan-300 rounded-2xl hover:bg-cyan-50 transition flex flex-col items-center justify-center gap-3">
                  <Image className="w-8 h-8 text-cyan-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Add Photo</p>
                    <p className="text-sm text-slate-600">
                      Share a picture from your day
                    </p>
                  </div>
                </button>

                <button className="p-8 border-2 border-dashed border-purple-300 rounded-2xl hover:bg-purple-50 transition flex flex-col items-center justify-center gap-3">
                  <Video className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Add Video</p>
                    <p className="text-sm text-slate-600">
                      Share a video from your day
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Today's Check-ins */}
            <div className="bg-white rounded-2xl shadow-lg border border-cyan-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-600" />
                Today's Check-ins
              </h3>

              <div className="space-y-3">
                {checkIns.length > 0 ? (
                  checkIns.map((checkIn) => (
                    <div
                      key={checkIn.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <span className="text-2xl">{checkIn.emoji}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">
                          {checkIn.mood}
                        </p>
                        <p className="text-xs text-slate-600">{checkIn.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600 text-sm">
                    No check-ins yet today
                  </p>
                )}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-2xl shadow-lg border border-cyan-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Emergency Contacts
              </h3>

              <div className="space-y-3">
                {[
                  { name: "Mom", emoji: "👩" },
                  { name: "Brother", emoji: "👨" },
                  { name: "Best Friend", emoji: "👨‍🤝‍👨" },
                ].map((contact, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <span className="text-2xl">{contact.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">
                        {contact.name}
                      </p>
                      <p className="text-xs text-green-600">●  Notified</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-2 text-cyan-600 font-semibold hover:bg-cyan-50 rounded-lg transition text-sm">
                Manage Contacts
              </button>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-2xl border border-cyan-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3">💡 Tip</h3>
              <p className="text-sm text-slate-700">
                Check in consistently to help your loved ones stay assured about
                your wellbeing. Set reminders to never miss a check-in time!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
