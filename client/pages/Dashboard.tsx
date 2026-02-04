import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Play,
  BarChart3,
  Share2,
  Send,
  X,
  Bell,
  Zap,
} from "lucide-react";
import { moodSongs } from "../data/songs";
import RotatingAds from "../components/RotatingAds";

interface CheckIn {
  id: string;
  emoji: string;
  mood: string;
  time: string;
  date: string;
  timeSlot?: "morning" | "afternoon" | "evening"; // 8am, 2pm, 8pm
}

interface MediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  timestamp: string;
  mood?: string;
}

interface Notification {
  id: string;
  type: "checkin" | "missed";
  message: string;
  timestamp: string;
}

const CHECK_IN_TIMES = [
  { slot: "morning", label: "Morning (8 AM)", icon: "🌅" },
  { slot: "afternoon", label: "Afternoon (2 PM)", icon: "☀️" },
  { slot: "evening", label: "Evening (8 PM)", icon: "🌙" },
];

const MOOD_EMOJIS = [
  { emoji: "😊", mood: "Great" },
  { emoji: "🙂", mood: "Good" },
  { emoji: "😐", mood: "Okay" },
  { emoji: "😔", mood: "Not Great" },
  { emoji: "😴", mood: "Sleep" },
  { emoji: "🎉", mood: "Excited" },
  { emoji: "😰", mood: "Anxious" },
  { emoji: "😍", mood: "Happy" },
  { emoji: "😌", mood: "Calm" },
  { emoji: "🤗", mood: "Grateful" },
  { emoji: "😤", mood: "Frustrated" },
  { emoji: "🥰", mood: "Loved" },
  { emoji: "😎", mood: "Confident" },
  { emoji: "🤔", mood: "Thoughtful" },
  { emoji: "🌟", mood: "Inspired" },
  { emoji: "🛏️", mood: "Wake Up" },
  { emoji: "🎓", mood: "In Class" },
  { emoji: "🚗", mood: "On My Way" },
  { emoji: "🏠", mood: "At Home" },
  { emoji: "💼", mood: "At Work" },
];

export default function Dashboard() {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [todayCheckInCount, setTodayCheckInCount] = useState(0);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<"morning" | "afternoon" | "evening" | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState<string | null>(null);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bondedContacts, setBondedContacts] = useState<any[]>([]);
  const missedCheckInTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);

  // Send check-in notifications to bonded contacts
  const sendCheckInNotification = (mood: string) => {
    // Get bonded contacts from localStorage or state
    const bondedContactsStr = localStorage.getItem("bondedContacts");
    const bondedContacts = bondedContactsStr
      ? JSON.parse(bondedContactsStr)
      : [];

    const contactCount = bondedContacts.length;

    // Create notification
    const notification: Notification = {
      id: Date.now().toString(),
      type: "checkin",
      message: `✓ Check-in sent to ${contactCount} bonded contact${contactCount !== 1 ? "s" : ""} - You're feeling ${mood}`,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setNotifications((prev) => [notification, ...prev]);

    // Backend integration - Send to bonded contacts
    bondedContacts.forEach((contact: any) => {
      console.log("📱 Check-in notification sent to bonded contact:", {
        recipient: contact.name,
        bondCode: contact.bondCode,
        mood: mood,
        timestamp: new Date().toISOString(),
        message: `Your bonded family member just checked in on UOK feeling ${mood}. They're doing okay! 💚`,
      });

      // In production, this would call your backend API:
      // POST /api/notifications/send
      // Body: { bondCode, type: 'checkin', mood, message }
    });

    // Browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("UOK Check-in Recorded", {
        body: `Your check-in has been shared with ${contactCount} bonded contact${contactCount !== 1 ? "s" : ""}.`,
        icon: "/favicon.ico",
      });
    }
  };

  // Initialize with sample check-ins and load bonded contacts
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;

      // Load bonded contacts from localStorage
      const bondedContactsStr = localStorage.getItem("bondedContacts");
      if (bondedContactsStr) {
        try {
          setBondedContacts(JSON.parse(bondedContactsStr));
        } catch (e) {
          console.error("Error loading bonded contacts:", e);
        }
      }

      setCheckIns([
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
      setTodayCheckInCount(2);
    }
  }, []);

  // Setup missed check-in alerts (10 minutes) - Alert bonded contacts if 3rd check-in is missed
  useEffect(() => {
    if (todayCheckInCount >= 2 && hasInitializedRef.current) {
      // Clear any existing timer
      if (missedCheckInTimerRef.current) {
        clearTimeout(missedCheckInTimerRef.current);
        missedCheckInTimerRef.current = null;
      }

      // Only set timer if not already at 3
      if (todayCheckInCount < 3) {
        // Set timer for missed check-in alert (30 seconds = 30000 ms)
        const timer = setTimeout(() => {
          // Get bonded contacts
          const bondedContactsStr = localStorage.getItem("bondedContacts");
          const bondedContacts = bondedContactsStr
            ? JSON.parse(bondedContactsStr)
            : [];

          const notification: Notification = {
            id: Date.now().toString(),
            type: "missed",
            message: `⚠ ALERT: You missed your 3rd check-in! Alert sent to ${bondedContacts.length} bonded contact${bondedContacts.length !== 1 ? "s" : ""} + email notifications.`,
            timestamp: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          setNotifications((prev) => [notification, ...prev]);

          // Send alerts to bonded contacts
          bondedContacts.forEach((contact: any) => {
            console.log("🚨 MISSED CHECK-IN ALERT sent to bonded contact:", {
              recipient: contact.name,
              bondCode: contact.bondCode,
              timestamp: new Date().toISOString(),
              message:
                "Your bonded family member missed their 30-second check-in window!",
            });
          });

          // Send email alerts (Backend integration)
          console.log("📧 Email alerts would be sent to bonded contacts at:", {
            timestamp: new Date().toISOString(),
            emailSubject: "UOK Alert: Family Member Missed Check-In",
            bondedContacts: bondedContacts.map((c: any) => c.name),
          });

          // In production, this would call your backend API:
          // POST /api/alerts/missed-checkin
          // Body: { bondedContacts, message, timestamp }
        }, 30000); // 30 seconds

        missedCheckInTimerRef.current = timer;
      }

      return () => {
        if (missedCheckInTimerRef.current) {
          clearTimeout(missedCheckInTimerRef.current);
        }
      };
    }
  }, [todayCheckInCount]);

  const handleCheckIn = (emoji: string, mood: string) => {
    if (todayCheckInCount >= 3) {
      alert("You've reached your maximum check-ins for today (3)");
      return;
    }

    if (!selectedTimeSlot) {
      alert("Please select a check-in time (Morning, Afternoon, or Evening)");
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
      timeSlot: selectedTimeSlot,
    };

    setCheckIns([newCheckIn, ...checkIns]);
    setTodayCheckInCount((prev) => Math.min(prev + 1, 3));
    setSelectedMood(emoji);

    // Send check-in notification to bonded contacts
    sendCheckInNotification(mood);

    // Show confirmation
    setTimeout(() => {
      setSelectedMood(null);
      setSelectedTimeSlot(null);
    }, 2000);
  };

  // Share media to community
  const shareToMemories = (item: MediaItem) => {
    // Navigate to shared memories with pre-filled data
    navigate("/shared-memories", {
      state: {
        mediaUrl: item.url,
        mediaType: item.type,
        mood: item.mood,
      },
    });
    setShareModalOpen(null);
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
        // Use createObjectURL for better performance and compatibility
        const url = URL.createObjectURL(file);
        const newMedia: MediaItem = {
          id: Date.now().toString() + Math.random(),
          type: "photo",
          url: url,
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          mood: MOOD_EMOJIS.find((m) => m.emoji === selectedMood)?.mood,
        };
        setMediaItems((prev) => [newMedia, ...prev]);
      });
    }
    // Reset input
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        // Use createObjectURL for video playback
        const url = URL.createObjectURL(file);
        const newMedia: MediaItem = {
          id: Date.now().toString() + Math.random(),
          type: "video",
          url: url,
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          mood: MOOD_EMOJIS.find((m) => m.emoji === selectedMood)?.mood,
        };
        setMediaItems((prev) => [newMedia, ...prev]);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
      {/* Top Navigation - Futuristic Glassmorphism */}
      <nav className="bg-white/10 backdrop-blur-xl border-b border-cyan-400/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50 group-hover:shadow-cyan-500/100 transition">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              UOK
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() =>
                  setNotificationDropdownOpen(!notificationDropdownOpen)
                }
                className="p-2 hover:bg-white/10 rounded-lg transition text-cyan-400 relative"
              >
                <Bell className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {Math.min(notifications.length, 9)}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {notificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-cyan-400/30 rounded-xl shadow-xl z-50 backdrop-blur-xl">
                  <div className="p-4 border-b border-cyan-400/20">
                    <h3 className="text-cyan-100 font-bold">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 10).map((notif) => (
                        <div
                          key={notif.id}
                          className="px-4 py-3 border-b border-cyan-400/10 hover:bg-white/5 transition"
                        >
                          <p className="text-cyan-300 text-sm font-medium">
                            {notif.message}
                          </p>
                          <p className="text-cyan-500/60 text-xs mt-1">
                            {notif.timestamp}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-cyan-400/60">
                        No notifications yet
                      </div>
                    )}
                  </div>
                  {notifications.length > 10 && (
                    <div className="p-3 border-t border-cyan-400/20 text-center">
                      <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition text-cyan-400"
            >
              <Settings className="w-6 h-6" />
            </button>

            {/* Settings Modal */}
            {settingsOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-slate-900 border border-cyan-400/30 rounded-2xl p-6 max-w-md w-full mx-4 backdrop-blur-xl">
                  <h2 className="text-2xl font-bold text-cyan-100 mb-6">
                    Settings
                  </h2>

                  <div className="space-y-4">
                    <div className="border-b border-orange-200 pb-4">
                      <h3 className="text-orange-800 font-semibold mb-2">
                        Notification Settings
                      </h3>
                      <label className="flex items-center gap-3 text-orange-700">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4"
                        />
                        <span className="text-sm">
                          SMS/WhatsApp alerts for check-ins
                        </span>
                      </label>
                    </div>

                    <div className="border-b border-orange-200 pb-4">
                      <h3 className="text-orange-800 font-semibold mb-2">
                        Check-in Reminders
                      </h3>
                      <label className="flex items-center gap-3 text-orange-700">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4"
                        />
                        <span className="text-sm">
                          Daily check-in notifications
                        </span>
                      </label>
                    </div>

                    <div className="border-b border-orange-200 pb-4">
                      <h3 className="text-orange-800 font-semibold mb-2">
                        Privacy
                      </h3>
                      <select className="w-full bg-orange-50 border border-orange-300 rounded-lg px-3 py-2 text-orange-900 text-sm">
                        <option>Public profile</option>
                        <option>Friends only</option>
                        <option>Private</option>
                      </select>
                    </div>

                    <div className="pt-4 space-y-2">
                      <button
                        onClick={() => setSettingsOpen(false)}
                        className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition"
                      >
                        Save Settings
                      </button>
                      <button
                        onClick={() => setSettingsOpen(false)}
                        className="w-full py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg font-medium transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                // Clear user session and data
                localStorage.clear();
                sessionStorage.clear();
                // Redirect to login
                navigate("/login");
              }}
              className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400"
              title="Logout"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <div className="bg-gradient-to-r from-orange-100/50 to-rose-100/50 border-b border-orange-200 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto">
            {notifications.slice(0, 2).map((notif) => (
              <div
                key={notif.id}
                className="flex items-center justify-between bg-white/70 rounded-lg p-3 mb-2 backdrop-blur-sm border border-orange-200"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-orange-800 text-sm font-medium">
                      {notif.message}
                    </p>
                    <p className="text-orange-500/60 text-xs">
                      {notif.timestamp}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setNotifications((prev) =>
                      prev.filter((n) => n.id !== notif.id),
                    )
                  }
                  className="text-orange-500/60 hover:text-orange-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Welcome Back! 👋
          </h1>
          <p className="text-orange-700/80">
            How are you feeling today? Let your contacts know you're okay.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Check-in Section */}
          <div className="md:col-span-2 space-y-8">
            {/* Status Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-orange-200 rounded-2xl p-6 hover:border-orange-400 transition">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <StatusIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-900">
                    Daily Check-in Status
                  </h3>
                  <p className="text-sm text-orange-700/80">{status.text}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-3 rounded-full ${
                      i < todayCheckInCount
                        ? "bg-gradient-to-r from-cyan-400 to-purple-400 shadow-lg shadow-cyan-500/50"
                        : "bg-white/10"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Check-in Section - Futuristic */}
            <div className="bg-white/10 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-8 hover:border-cyan-400/60 transition">
              <h2 className="text-2xl font-bold text-cyan-100 mb-6">
                How are you feeling?
              </h2>

              {/* Time Slot Selection */}
              <div className="mb-6">
                <p className="text-cyan-200 font-semibold mb-3 text-sm">Select check-in time:</p>
                <div className="grid grid-cols-3 gap-3">
                  {CHECK_IN_TIMES.map((timeSlot) => (
                    <button
                      key={timeSlot.slot}
                      onClick={() => setSelectedTimeSlot(timeSlot.slot as "morning" | "afternoon" | "evening")}
                      disabled={todayCheckInCount >= 3}
                      className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
                        selectedTimeSlot === timeSlot.slot
                          ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                          : "bg-white/10 text-cyan-200 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed border border-cyan-400/30"
                      }`}
                    >
                      {timeSlot.icon} {timeSlot.slot.charAt(0).toUpperCase() + timeSlot.slot.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3 mb-6">
                {MOOD_EMOJIS.map((item) => (
                  <button
                    key={item.emoji}
                    onClick={() => handleCheckIn(item.emoji, item.mood)}
                    disabled={todayCheckInCount >= 3}
                    className={`aspect-square flex flex-col items-center justify-center rounded-xl transition transform ${
                      selectedMood === item.emoji
                        ? "bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50 scale-110"
                        : "bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed border border-cyan-400/30 hover:border-cyan-400/60"
                    }`}
                  >
                    <span className="text-3xl">{item.emoji}</span>
                    <span
                      className={`text-xs font-medium mt-1 ${
                        selectedMood === item.emoji
                          ? "text-white"
                          : "text-cyan-200"
                      }`}
                    >
                      {item.mood}
                    </span>
                  </button>
                ))}
              </div>

              {selectedMood && (
                <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-400/50 rounded-lg p-6 backdrop-blur-sm">
                  <p className="text-green-300 font-semibold mb-4 text-center">
                    ✓ Check-in recorded! Alert sent to your emergency contacts.
                  </p>

                  {/* Inspiration Songs */}
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Music className="w-5 h-5 text-purple-600" />
                      <p className="font-semibold text-slate-900">
                        Inspiration Playlist
                      </p>
                    </div>
                    <div className="space-y-2">
                      {moodSongs[
                        MOOD_EMOJIS.find((m) => m.emoji === selectedMood)
                          ?.mood || ""
                      ]?.map((song, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-lg p-3 hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900 text-sm">
                                {song.title}
                              </p>
                              <p className="text-xs text-slate-600">
                                {song.artist}
                              </p>
                              <p className="text-xs text-purple-600 mt-1">
                                {song.vibe}
                              </p>
                            </div>
                            <button
                              className="flex-shrink-0 p-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition"
                              title="Play music"
                            >
                              <Play className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Media Upload Section - Futuristic */}
            <div className="bg-white/10 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-8 hover:border-cyan-400/60 transition">
              <h2 className="text-2xl font-bold text-cyan-100 mb-6">
                Share Your Day
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-cyan-400/50 rounded-2xl hover:bg-cyan-500/10 hover:border-cyan-400 transition flex flex-col items-center justify-center gap-3 cursor-pointer group"
                >
                  <Image className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300" />
                  <div>
                    <p className="font-semibold text-cyan-100 group-hover:text-cyan-50">
                      Add Photo
                    </p>
                    <p className="text-sm text-cyan-300/80">Capture a moment</p>
                  </div>
                </button>

                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-purple-400/50 rounded-2xl hover:bg-purple-500/10 hover:border-purple-400 transition flex flex-col items-center justify-center gap-3 cursor-pointer group"
                >
                  <Video className="w-8 h-8 text-purple-400 group-hover:text-purple-300" />
                  <div>
                    <p className="font-semibold text-cyan-100 group-hover:text-cyan-50">
                      Add Video
                    </p>
                    <p className="text-sm text-cyan-300/80">
                      Share a video update
                    </p>
                  </div>
                </button>
              </div>

              {/* Hidden File Inputs */}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoUpload}
                className="hidden"
              />

              {/* Media Gallery */}
              {mediaItems.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-cyan-100">
                      Today's Memories ({mediaItems.length})
                    </h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    {mediaItems.map((item) => (
                      <div
                        key={item.id}
                        className="relative group rounded-lg overflow-hidden bg-slate-900 border border-cyan-400/30 hover:border-cyan-400/60 transition"
                      >
                        {item.type === "photo" ? (
                          <img
                            src={item.url}
                            alt="Shared photo"
                            className="w-full h-48 object-cover group-hover:scale-105 transition"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center relative">
                            <video
                              key={item.id}
                              className="w-full h-full object-cover"
                              controls
                              style={{ maxWidth: "100%", maxHeight: "100%" }}
                            >
                              <source src={item.url} type="video/mp4" />
                              <source src={item.url} type="video/webm" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex items-center justify-center gap-2">
                          <button
                            onClick={() => shareToMemories(item)}
                            className="opacity-0 group-hover:opacity-100 transition bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                            title="Share to community"
                          >
                            <Share2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteMedia(item.id)}
                            className="opacity-0 group-hover:opacity-100 transition bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                            title="Delete media"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-xs text-cyan-300 p-2 bg-white/10 backdrop-blur-sm border-t border-cyan-400/20">
                          {item.type === "photo" ? "📷" : "🎥"} {item.timestamp}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rotating Featured Ads */}
            <RotatingAds />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Today's Check-ins - Futuristic */}
            <div className="bg-white/10 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-6 hover:border-cyan-400/60 transition">
              <h3 className="text-lg font-bold text-cyan-100 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Today's Check-ins
              </h3>

              <div className="space-y-3">
                {checkIns.length > 0 ? (
                  checkIns.map((checkIn) => (
                    <div
                      key={checkIn.id}
                      className="flex items-center gap-3 p-3 bg-white/10 rounded-lg border border-cyan-400/20 hover:border-cyan-400/40 transition"
                    >
                      <span className="text-2xl">{checkIn.emoji}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-cyan-100 text-sm">
                          {checkIn.mood}
                        </p>
                        <p className="text-xs text-cyan-400/60">
                          {checkIn.time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-cyan-300/80 text-sm">
                    No check-ins yet today
                  </p>
                )}
              </div>
            </div>

            {/* Bonded Emergency Contacts - Futuristic */}
            <div className="bg-white/10 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-6 hover:border-cyan-400/60 transition">
              <h3 className="text-lg font-bold text-cyan-100 mb-4">
                Bonded Emergency Contacts
              </h3>

              <div className="space-y-3">
                {bondedContacts && bondedContacts.length > 0 ? (
                  bondedContacts.map((contact: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-white/10 rounded-lg border border-cyan-400/20 hover:border-cyan-400/40 transition cursor-pointer group"
                    >
                      <div className="relative">
                        <span className="text-2xl">
                          {contact.emoji || "👤"}
                        </span>
                        <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-400"></span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-cyan-100 text-sm">
                          {contact.name}
                        </p>
                        <p className="text-xs text-green-400">
                          ● Bonded & Active
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-cyan-300/80 text-sm p-3 bg-white/5 rounded-lg border border-cyan-400/20 text-center">
                    No bonded contacts yet. Tap the button below to add family
                    members.
                  </p>
                )}
              </div>

              <Link
                to="/bond-contacts"
                className="block w-full mt-4 py-2 text-cyan-400 font-semibold hover:bg-cyan-400/10 rounded-lg transition text-sm text-center border border-cyan-400/30"
              >
                Add Emergency Contacts
              </Link>
            </div>

            {/* Wellness Insights - Futuristic */}
            <Link
              to="/wellness-insights"
              className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-100 rounded-2xl border border-cyan-400/40 p-6 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/20 transition block backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold">Wellness Insights</h3>
              </div>
              <p className="text-sm text-cyan-300/80">
                View your statistics and progress
              </p>
            </Link>

            {/* Shared Memories - Futuristic */}
            <Link
              to="/shared-memories"
              className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-cyan-100 rounded-2xl border border-purple-400/40 p-6 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20 transition block backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <Share2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold">Share Memories</h3>
              </div>
              <p className="text-sm text-purple-300/80">
                Share your day with community
              </p>
            </Link>

            {/* Featured Partners Link */}
            <Link
              to="/featured-partners"
              className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-50 rounded-2xl border border-amber-400/40 p-6 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-500/20 transition block backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold">Featured Partners</h3>
              </div>
              <p className="text-sm text-amber-300/80">
                Advertise your business to our users
              </p>
            </Link>

            {/* Tip Section - Futuristic */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl border border-cyan-400/30 p-6 backdrop-blur-xl">
              <h3 className="text-lg font-bold text-cyan-100 mb-3">
                💡 Daily Tip
              </h3>
              <p className="text-sm text-cyan-300/80">
                Consistent check-ins keep your loved ones assured. Set reminders
                for your daily check-in times!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
