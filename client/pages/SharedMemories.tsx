import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Share2, MessageCircle, ThumbsUp, Trash2, Image, Video } from "lucide-react";

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
  comments: number;
  isLiked: boolean;
}

export default function SharedMemories() {
  const location = useLocation();
  const [caption, setCaption] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
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
      comments: 18,
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
      comments: 12,
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
      comments: 24,
      isLiked: false,
    },
  ]);

  const [likedMemories, setLikedMemories] = useState<Record<string, boolean>>(
    memories.reduce((acc, m) => ({ ...acc, [m.id]: m.isLiked }), {})
  );

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

        {/* Share Memory Prompt */}
        <div className="bg-white rounded-2xl shadow-lg border border-cyan-100 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
              Y
            </div>
            <input
              type="text"
              placeholder="Share how you're feeling today..."
              className="flex-1 bg-slate-100 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Memories Feed */}
        <div className="space-y-6">
          {memories.map((memory) => (
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

              {/* Memory Image */}
              {memory.imageUrl && (
                <img
                  src={memory.imageUrl}
                  alt="Shared memory"
                  className="w-full h-64 object-cover"
                />
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
