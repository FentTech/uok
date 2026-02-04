import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Heart,
  Share2,
  MessageCircle,
  ThumbsUp,
  Trash2,
  Image,
  Video,
  Search,
  X,
} from "lucide-react";
import RotatingAds from "../components/RotatingAds";
import {
  sharedMomentsStorage,
  notificationStorage,
  type StoredSharedMoment,
  type StoredComment,
} from "../lib/dataStorage";

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
  visibility?: "everyone" | "bonded-contacts" | "specific-users"; // sharing privacy level
}

export default function SharedMemories() {
  const location = useLocation();
  const [caption, setCaption] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fullscreenVideo, setFullscreenVideo] = useState<string | null>(null);
  const [adTimer, setAdTimer] = useState(10); // 10 second timer for video ads
  const [featuredAds, setFeaturedAds] = useState<any[]>([]);
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const [shareVisibility, setShareVisibility] = useState<
    "everyone" | "bonded-contacts" | "specific-users"
  >("everyone");
  const [bondedContactsForShare, setBondedContactsForShare] = useState<any[]>(
    [],
  );
  const [memories, setMemories] = useState<SharedMemory[]>([]);

  const [likedMemories, setLikedMemories] = useState<Record<string, boolean>>(
    {},
  );

  // Load bonded contacts and shared moments on mount
  useEffect(() => {
    // Load bonded contacts
    const bondedContactsStr = localStorage.getItem("bondedContacts");
    if (bondedContactsStr) {
      try {
        setBondedContactsForShare(JSON.parse(bondedContactsStr));
      } catch (e) {
        console.error("Error loading bonded contacts:", e);
      }
    }

    // Load shared moments from persistent storage
    const storedMoments = sharedMomentsStorage.getActive();
    // Convert stored moments to SharedMemory format
    const convertedMemories: SharedMemory[] = storedMoments.map((m) => ({
      id: m.id,
      username: m.username,
      avatar: m.avatar,
      mood: m.mood,
      moodEmoji: m.moodEmoji,
      timestamp: m.timestamp,
      caption: m.caption,
      imageUrl: m.mediaUrl,
      mediaType: m.mediaType,
      likes: m.likes,
      commentsList: m.comments as unknown as Comment[],
      isLiked: false,
      visibility: m.visibility,
      sharedWith: m.sharedWith,
    }));
    setMemories(convertedMemories);

    // Initialize liked memories state
    const initialLikes = convertedMemories.reduce(
      (acc, m) => ({ ...acc, [m.id]: m.isLiked }),
      {},
    );
    setLikedMemories(initialLikes);
  }, []);

  // Load featured ads from localStorage (only images, only verified payments)
  useEffect(() => {
    const featured = localStorage.getItem("featuredPartners");
    if (featured) {
      try {
        const partners = JSON.parse(featured);
        const activeAds: any[] = [];
        partners.forEach((partner: any) => {
          // CRITICAL: Only load ads from partners with verified PayPal payment
          if (
            partner.paymentStatus === "paid" &&
            partner.paymentId &&
            partner.ads
          ) {
            partner.ads.forEach((ad: any) => {
              // Only IMAGE ads in community section with 30-second display timer
              // Exclude: videos, text, unpaid/unverified ads
              if (ad.active && ad.adType === "image") {
                activeAds.push(ad);
              }
            });
          }
        });
        setFeaturedAds(activeAds);
        console.log(`✅ Loaded ${activeAds.length} verified community ads`);
      } catch (e) {
        console.error("Error loading ads:", e);
      }
    }
  }, []);

  // 10-second timer for video ads in community
  useEffect(() => {
    if (fullscreenVideo && adTimer > 0) {
      const interval = setInterval(() => {
        setAdTimer((prev) => {
          if (prev <= 1) {
            setFullscreenVideo(null);
            setAdTimer(10);
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [fullscreenVideo, adTimer]);

  // Handle incoming media from Dashboard
  useEffect(() => {
    const state = location.state as {
      mediaUrl?: string;
      mediaType?: "photo" | "video";
      mood?: string;
    } | null;
    if (state?.mediaUrl && caption) {
      // Media is ready to be shared
    }
  }, [location.state, caption]);

  const toggleLike = (id: string) => {
    const memory = memories.find((m) => m.id === id);
    if (memory) {
      const isLiked = likedMemories[id];
      const newLikeCount = isLiked ? memory.likes - 1 : memory.likes + 1;

      // Update in persistent storage
      sharedMomentsStorage.update(id, {
        likes: newLikeCount,
      });

      // Update local state
      setMemories(
        memories.map((m) =>
          m.id === id
            ? {
                ...m,
                likes: newLikeCount,
                isLiked: !isLiked,
              }
            : m,
        ),
      );
      setLikedMemories((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    }
  };

  const deleteMemory = (id: string) => {
    // Mark as deleted in persistent storage
    sharedMomentsStorage.delete(id);
    // Update local state
    setMemories(memories.filter((m) => m.id !== id));
  };

  const filteredMemories = memories.filter((m) =>
    m.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddComment = (memoryId: string) => {
    if (!commentText.trim()) {
      alert("Please enter a comment");
      return;
    }

    try {
      const currentUserEmail = localStorage.getItem("userEmail") || "You";
      const currentUserName =
        currentUserEmail === "You" ? "You" : currentUserEmail.split("@")[0];

      const newComment: StoredComment = {
        id: Date.now().toString(),
        username: currentUserName,
        email: currentUserEmail,
        avatar: currentUserName.charAt(0).toUpperCase(),
        text: commentText,
        timestamp: "just now",
        createdAt: new Date().toISOString(),
      };

      // Add to persistent storage
      sharedMomentsStorage.addComment(memoryId, newComment);

      // Update local state
      setMemories((prev) =>
        prev.map((m) =>
          m.id === memoryId
            ? { ...m, commentsList: [newComment as any, ...m.commentsList] }
            : m,
        ),
      );

      setCommentText("");
      setOpenCommentId(null);
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    }
  };

  const handleDeleteComment = (memoryId: string, commentId: string) => {
    try {
      setMemories((prev) =>
        prev.map((m) =>
          m.id === memoryId
            ? {
                ...m,
                commentsList: m.commentsList.filter((c) => c.id !== commentId),
              }
            : m,
        ),
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const handleShareMemory = async () => {
    const state = location.state as {
      mediaUrl?: string;
      mediaType?: "photo" | "video";
      mood?: string;
    } | null;

    if (!caption && !state?.mediaUrl) {
      alert("Please add a caption or share a photo/video");
      return;
    }

    setShareLoading(true);

    try {
      // Get current user info
      const currentUserEmail = localStorage.getItem("userEmail") || "You";
      const currentUserName =
        currentUserEmail === "You" ? "You" : currentUserEmail.split("@")[0];

      // Save to persistent storage
      const savedMoment = sharedMomentsStorage.add({
        username: currentUserName,
        email: currentUserEmail,
        avatar: currentUserName.charAt(0).toUpperCase(),
        mood: state?.mood || "Great",
        moodEmoji: "😊",
        timestamp: "just now",
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        caption: caption || "Shared a moment from their day",
        mediaUrl: state?.mediaUrl,
        mediaType: state?.mediaType,
        likes: 0,
        comments: [],
        visibility: shareVisibility,
        sharedWith:
          shareVisibility === "bonded-contacts"
            ? bondedContactsForShare.map((c: any) => c.email)
            : shareVisibility === "specific-users"
              ? [] // Users would select specific users, defaulting to empty for now
              : undefined, // "everyone" - no restrictions
      });

      // Convert and add to local state
      const newMemory: SharedMemory = {
        id: savedMoment.id,
        username: savedMoment.username,
        avatar: savedMoment.avatar,
        mood: savedMoment.mood,
        moodEmoji: savedMoment.moodEmoji,
        timestamp: savedMoment.timestamp,
        caption: savedMoment.caption,
        imageUrl: savedMoment.mediaUrl,
        mediaType: savedMoment.mediaType,
        likes: savedMoment.likes,
        commentsList: [],
        isLiked: false,
        visibility: shareVisibility,
        sharedWith: savedMoment.sharedWith,
      };

      setMemories((prev) => [newMemory, ...prev]);

      // Send notifications to bonded contacts if shared with them
      if (shareVisibility === "bonded-contacts") {
        bondedContactsForShare.forEach((contact: any) => {
          notificationStorage.add({
            type: "media-shared",
            message: `${currentUserName} shared a ${state?.mediaType || "moment"} with you 📸`,
            timestamp: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            date: new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            fromContact: contact.email,
          });
        });
      }

      // Reset form
      setCaption("");
      setShareVisibility("everyone");

      // Clear the location state by replacing history
      window.history.replaceState({}, document.title, window.location.pathname);

      // Show success message
      const visibilityText =
        shareVisibility === "everyone"
          ? "the entire community"
          : shareVisibility === "bonded-contacts"
            ? `${bondedContactsForShare.length} bonded contact${bondedContactsForShare.length !== 1 ? "s" : ""}`
            : "selected users";
      alert(`✓ Memory shared with ${visibilityText}!`);
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
                <p className="text-sm text-slate-600 mb-2">
                  📎 Media ready to share:
                </p>
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

            {/* Sharing Privacy Options */}
            <div className="border-t border-slate-200 pt-4">
              <label className="text-sm font-semibold text-slate-900 block mb-2">
                Share with:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setShareVisibility("everyone")}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
                    shareVisibility === "everyone"
                      ? "bg-cyan-600 text-white border border-cyan-600"
                      : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  🌍 Everyone
                </button>
                <button
                  onClick={() => setShareVisibility("bonded-contacts")}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
                    shareVisibility === "bonded-contacts"
                      ? "bg-cyan-600 text-white border border-cyan-600"
                      : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                  disabled={bondedContactsForShare.length === 0}
                  title={
                    bondedContactsForShare.length === 0
                      ? "No bonded contacts"
                      : ""
                  }
                >
                  💚 Bonded ({bondedContactsForShare.length})
                </button>
                <button
                  onClick={() => setShareVisibility("specific-users")}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
                    shareVisibility === "specific-users"
                      ? "bg-cyan-600 text-white border border-cyan-600"
                      : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  👥 Specific
                </button>
              </div>
            </div>

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
              <p className="text-slate-600">
                No users found matching "{searchQuery}"
              </p>
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
                      <p className="text-sm text-slate-600">
                        {memory.timestamp}
                      </p>
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
                <p className="text-slate-800 leading-relaxed">
                  {memory.caption}
                </p>
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
                  <span>💬 {memory.commentsList.length} comments</span>
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

                <button
                  onClick={() => {
                    setSelectedMemoryId(memory.id);
                    setOpenCommentId(memory.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                >
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

              {/* Comments Section */}
              {memory.commentsList.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Comments
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {memory.commentsList.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-white rounded-lg p-3 border border-slate-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {comment.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-slate-900 text-sm">
                                {comment.username}
                              </p>
                              {comment.username === "You" && (
                                <button
                                  onClick={() =>
                                    handleDeleteComment(memory.id, comment.id)
                                  }
                                  className="text-red-600 hover:text-red-700 text-xs"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            <p className="text-slate-700 text-sm">
                              {comment.text}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {comment.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Comment Form */}
              {openCommentId === memory.id && (
                <div className="px-6 py-4 border-t border-slate-100 bg-cyan-50">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddComment(memory.id);
                        }
                      }}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 bg-white border border-cyan-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button
                      onClick={() => handleAddComment(memory.id)}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
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
