import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ArrowLeft,
  Bell,
  AlertCircle,
  CheckCircle,
  Trash2,
  Mail,
} from "lucide-react";
import { notificationStorage, type StoredNotification } from "../lib/dataStorage";

export default function BondNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "checkin" | "missed" | "media"
  >("all");

  useEffect(() => {
    // Load all notifications
    const allNotifications = notificationStorage.getAll();
    setNotifications(allNotifications);
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "checkin") return n.type === "checkin";
    if (selectedFilter === "missed") return n.type === "missed";
    if (selectedFilter === "media")
      return n.type === "media-shared" || n.type === "media-received";
    return true;
  });

  const handleMarkAsRead = (id: string) => {
    notificationStorage.markAsRead(id);
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDelete = (id: string) => {
    const updated = notificationStorage.getAll().filter((n) => n.id !== id);
    localStorage.setItem("uok_notifications", JSON.stringify(updated));
    setNotifications(updated);
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to delete all notifications? This cannot be undone."
      )
    ) {
      notificationStorage.clear();
      setNotifications([]);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "checkin":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "missed":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "media-shared":
      case "media-received":
        return <Mail className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "checkin":
        return "border-green-400/30 bg-green-500/10";
      case "missed":
        return "border-red-400/30 bg-red-500/10";
      case "media-shared":
      case "media-received":
        return "border-purple-400/30 bg-purple-500/10";
      default:
        return "border-cyan-400/30 bg-cyan-500/10";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
      {/* Header */}
      <nav className="bg-white/10 backdrop-blur-xl border-b border-cyan-400/20 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              UOK
            </span>
          </Link>
          <div className="text-cyan-400 font-semibold">
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                {unreadCount} new
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Notifications from Bonded Contacts
          </h1>
          <p className="text-cyan-300/80">
            Stay updated on check-ins and shared moments from your family and
            friends
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {(["all", "checkin", "missed", "media"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition ${
                selectedFilter === filter
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                  : "bg-white/10 text-cyan-200 hover:bg-white/20 border border-cyan-400/30"
              }`}
            >
              {filter === "all" && "All"}
              {filter === "checkin" && "✓ Check-ins"}
              {filter === "missed" && "⚠ Missed"}
              {filter === "media" && "📸 Media"}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-cyan-400/40 mx-auto mb-4" />
            <p className="text-cyan-300/80 text-lg mb-2">
              {notifications.length === 0
                ? "No notifications yet"
                : "No notifications matching this filter"}
            </p>
            <p className="text-cyan-400/60 text-sm">
              {notifications.length === 0
                ? "When bonded family members check in or share moments, their updates will appear here"
                : "Try selecting a different filter"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-xl p-4 backdrop-blur-xl transition ${
                  getNotificationColor(notification.type)
                } ${!notification.read ? "border-opacity-60" : "border-opacity-30"}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-cyan-100 font-medium text-sm">
                      {notification.fromContact &&
                        `From: ${notification.fromContact}`}
                    </p>
                    <p className="text-cyan-200 mt-1">{notification.message}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-cyan-400/70">
                      <span>{notification.date}</span>
                      <span>•</span>
                      <span>{notification.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition text-cyan-400 hover:text-cyan-300"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400 hover:text-red-300"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear All Button */}
            {notifications.length > 0 && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleClearAll}
                  className="px-6 py-2 text-red-400 hover:text-red-300 font-semibold text-sm border border-red-400/30 rounded-lg hover:bg-red-500/10 transition"
                >
                  Clear All Notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
