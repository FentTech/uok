import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Share2, MessageCircle, ThumbsUp, Trash2, Image, Video, Search, X } from "lucide-react";
import RotatingAds from "../components/RotatingAds";

interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: string;
}

interface SharedMemory {
  id: string;
  username: string;
  avatar: string;
  mood: string;
  moodEmoji: string;
  timestamp: string;
  caption: string;
  imageUrl?: string;
  mediaType?: "photo" | "video";
  likes: number;
  commentsList: Comment[];
  isLiked: boolean;
  sharedWith?: string[]; // usernames who can see this
}

export default function SharedMemories() {
  const location = useLocation();
  const [caption, setCaption] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fullscreenVideo, setFullscreenVideo] = useState<string | null>(null);
  const [adTimer, setAdTimer] = useState(30); // 30 second timer for video ads
  const [featuredAds, setFeaturedAds] = useState<any[]>([]);
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const [memories, setMemories] = useState<SharedMemory[]>([
    {
      id: "1",
      username: "Sarah Mitchell",
      avatar: "S",
      mood: "Great",
      moodEmoji: "😊",
      timestamp: "2 hours ago",
      caption:
        "Had an amazing day at the park! The weather was perfect and I got to spend time with my loved ones. Feeling so grateful! 🌳",
      imageUrl:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%2306b6d4' width='400' height='300'/%3E%3Ctext x='200' y='150' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle'%3E🌳 Park Day%3C/text%3E%3C/svg%3E",
      likes: 124,
      commentsList: [],
      isLiked: false,
    },
    {
      id: "2",
      username: "James Chen",
      avatar: "J",
      mood: "Excited",
      moodEmoji: "🎉",
      timestamp: "5 hours ago",
      caption:
        "Just finished my first 5K run! So proud of myself for pushing through. Never thought I could do it! 🏃",
      likes: 89,
      commentsList: [],
      isLiked: true,
    },
    {
      id: "3",
      username: "Emma Rodriguez",
      avatar: "E",
      mood: "Happy",
      moodEmoji: "😍",
      timestamp: "8 hours ago",
      caption:
        "Morning meditation session was incredible. Starting the day feeling centered and at peace. 🧘‍♀️",
      likes: 156,
      commentsList: [],
      isLiked: false,
    },
  ]);

  const [likedMemories, setLikedMemories] = useState<Record<string, boolean>>(
    memories.reduce((acc, m) => ({ ...acc, [m.id]: m.isLiked }), {})
  );

  // Load featured ads from localStorage (only images, with 30-second timer)
  useEffect(() => {
    const featured = localStorage.getItem("featuredPartners");
    if (featured) {
      try {
        const partners = JSON.parse(featured);
        const activeAds: any[] = [];
        partners.forEach((partner: any) => {
          if (partner.paymentStatus === "paid" && partner.ads) {
            partner.ads.forEach((ad: any) => {
              // Only IMAGE ads in community section, with 30-second display
              if (ad.active && ad.adType === "image") {
                activeAds.push(ad);
              }
            });
          }
        });
        setFeaturedAds(activeAds);
      } catch (e) {
        console.error("Error loading ads:", e);
      }
    }
  }, []);

  // 30-second timer for video ads in community
  useEffect(() => {
    if (fullscreenVideo && adTimer > 0) {
      const interval = setInterval(() => {
        setAdTimer((prev) => {
          if (prev <= 1) {
            setFullscreenVideo(null);
            setAdTimer(30);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [fullscreenVideo, adTimer]);

  // Handle incoming media from Dashboard
  useEffect(() => {
    const state = location.state as { mediaUrl?: string; mediaType?: "photo" | "video"; mood?: string } | null;
    if (state?.mediaUrl && caption) {
      // Media is ready to be shared
    }
  }, [location.state, caption]);

  const toggleLike = (id: string) => {
    setMemories(
      memories.map((m) =>
        m.id === id
          ? {
              ...m,
              likes: likedMemories[id] ? m.likes - 1 : m.likes + 1,
              isLiked: !likedMemories[id],
            }
          : m
      )
    );
    setLikedMemories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const deleteMemory = (id: string) => {
    setMemories(memories.filter((m) => m.id !== id));
  };

  const filteredMemories = memories.filter((m) =>
    m.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShareMemory = async () => {
    const state = location.state as { mediaUrl?: string; mediaType?: "photo" | "video"; mood?: string } | null;

    if (!caption && !state?.mediaUrl) {
      alert("Please add a caption or share a photo/video");
      return;
    }

    setShareLoading(true);

    try {
      // Create new memory object
      const newMemory: SharedMemory = {
        id: Date.now().toString(),
        username: "You",
        avatar: "Y",
        mood: state?.mood || "Great",
        moodEmoji: "😊",
        timestamp: "just now",
        caption: caption || "Shared a moment from their day",
        imageUrl: state?.mediaUrl,
        mediaType: state?.mediaType,
        likes: 0,
        comments: 0,
        isLiked: false,
      };

      // Add to memories
      setMemories((prev) => [newMemory, ...prev]);

      // Reset form
      setCaption("");

      // Clear the location state by replacing history
      window.history.replaceState({}, document.title, window.location.pathname);

      // Show success message
      alert("✓ Memory shared with the community!");
    } catch (error) {
      console.error("Error sharing memory:", error);
      alert("Failed to share memory. Please try again.");
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-purple-50">
      {/* Header */}
      <div className="border-b border-cyan-100 bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
              UOK
            </span>
          </Link>
          <Link
            to="/dashboard"
            className="text-cyan-600 hover:text-cyan-700 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Community Memories
          </h1>
          <p className="text-slate-600">
            Share your wellness journey with others and celebrate together
          </p>
        </div>

        {/* Featured Ads */}
        <div className="mb-8">
          <RotatingAds />
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative">
          <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by username..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-cyan-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Share Memory Prompt */}
        <div className="bg-white rounded-2xl shadow-lg border border-cyan-100 p-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                Y
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Share how you're feeling today..."
                className="flex-1 bg-slate-100 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none h-24"
              />
            </div>

            {/* Media Preview from Dashboard */}
            {location.state && (location.state as any)?.mediaUrl && (
              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-600 mb-2">📎 Media ready to share:</p>
                <div className="relative rounded-lg overflow-hidden bg-slate-900 h-32">
                  {(location.state as any)?.mediaType === "video" ? (
                    <video
                      src={(location.state as any)?.mediaUrl}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={(location.state as any)?.mediaUrl}
                      alt="Media to share"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleShareMemory}
              disabled={shareLoading}
              className="w-full px-6 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="w-5 h-5" />
              <span>{shareLoading ? "Sharing..." : "Share Memory"}</span>
            </button>
          </div>
        </div>

        {/* Fullscreen Video Modal */}
        {fullscreenVideo && (
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <button
              onClick={() => setFullscreenVideo(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
            >
              <X className="w-8 h-8" />
            </button>
            <video
              src={fullscreenVideo}
              className="w-full h-full object-contain"
              controls
              autoPlay
            />
          </div>
        )}

        {/* Memories Feed */}
        <div className="space-y-6">
          {filteredMemories.length === 0 && searchQuery ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <p className="text-slate-600">No users found matching "{searchQuery}"</p>
            </div>
          ) : null}

          {filteredMemories.map((memory) => (
            <div
              key={memory.id}
              className="bg-white rounded-2xl shadow-lg border border-cyan-100 overflow-hidden hover:shadow-xl transition"
            >
              {/* Memory Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                      {memory.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {memory.username}
                      </p>
                      <p className="text-sm text-slate-600">{memory.timestamp}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl">{memory.moodEmoji}</p>
                    <p className="text-xs text-slate-600 font-medium">
                      {memory.mood}
                    </p>
                  </div>
                </div>

                {/* Caption */}
                <p className="text-slate-800 leading-relaxed">{memory.caption}</p>
              </div>

              {/* Memory Media */}
              {memory.imageUrl && (
                <div className="w-full bg-slate-900 relative group">
                  {memory.mediaType === "video" ? (
                    <div className="relative">
                      <video
                        src={memory.imageUrl}
                        className="w-full h-96 object-cover cursor-pointer"
                        controls
                        onClick={() => setFullscreenVideo(memory.imageUrl)}
                      />
                      <button
                        onClick={() => setFullscreenVideo(memory.imageUrl)}
                        className="absolute inset-0 w-full h-full bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center"
                      >
                        <div className="hidden group-hover:flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
                          <Video className="w-8 h-8 text-white" />
                        </div>
                      </button>
                    </div>
                  ) : (
                    <img
                      src={memory.imageUrl}
                      alt="Shared memory"
                      className="w-full h-96 object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-white text-xs flex items-center gap-1">
                    {memory.mediaType === "video" ? (
                      <>
                        <Video className="w-4 h-4" />
                        Video
                      </>
                    ) : (
                      <>
                        <Image className="w-4 h-4" />
                        Photo
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Memory Stats */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600">
                <div className="flex gap-4">
                  <span>❤️ {memory.likes} likes</span>
                  <span>💬 {memory.comments} comments</span>
                </div>
              </div>

              {/* Memory Actions */}
              <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => toggleLike(memory.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition ${
                    likedMemories[memory.id]
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <ThumbsUp
                    className={`w-5 h-5 ${
                      likedMemories[memory.id] ? "fill-current" : ""
                    }`}
                  />
                  <span className="hidden sm:inline">Like</span>
                </button>

                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition">
                  <MessageCircle className="w-5 h-5" />
                  <span className="hidden sm:inline">Comment</span>
                </button>

                <button
                  onClick={() => deleteMemory(memory.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-red-600 bg-red-50 hover:bg-red-100 transition"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {memories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">
              No shared memories yet. Be the first to share! 🎉
            </p>
            <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition">
              Share Your First Memory
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
