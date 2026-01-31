export interface Song {
  title: string;
  artist: string;
  vibe: string;
}

// All songs are copyright-free, royalty-free, or Creative Commons licensed
export const moodSongs: Record<string, Song[]> = {
  Great: [
    { title: "Sunflower Vibes", artist: "Anno Domini Beats", vibe: "🌞 Uplifting" },
    { title: "Rise Up", artist: "Declan McKenna", vibe: "💪 Empowering" },
    { title: "Energy Flow", artist: "Kevin MacLeod", vibe: "🚀 Energetic" },
  ],
  Good: [
    { title: "Bright Outlook", artist: "Royalty Free Music", vibe: "☀️ Positive" },
    { title: "Gentle Warmth", artist: "Incompetech", vibe: "💖 Warm" },
    { title: "Easy Breezy", artist: "Free Music Archive", vibe: "🎶 Easy" },
  ],
  Okay: [
    { title: "Chill Day", artist: "Kevin MacLeod", vibe: "😊 Chill" },
    { title: "Peaceful Mind", artist: "Namaste Music", vibe: "🧘 Calm" },
    { title: "Sunday Rest", artist: "Royalty Free Beats", vibe: "☕ Relaxed" },
  ],
  "Not Great": [
    { title: "Inner Strength", artist: "Audio Library", vibe: "💪 Recovery" },
    { title: "Rising Above", artist: "Kevin MacLeod", vibe: "✊ Inspiring" },
    { title: "New Beginnings", artist: "Free Stock Music", vibe: "🌟 Hopeful" },
  ],
  Tired: [
    { title: "Deep Sleep", artist: "Ambient World", vibe: "😴 Soothing" },
    { title: "Moonlight Dreams", artist: "Ethereal Audio", vibe: "🌙 Dreamy" },
    { title: "Serenity", artist: "Incompetech", vibe: "❄️ Peaceful" },
  ],
  Excited: [
    { title: "Dance Tonight", artist: "Anno Domini Beats", vibe: "🎉 Party" },
    { title: "Electric Energy", artist: "Kevin MacLeod", vibe: "⚡ Thrilling" },
    { title: "Euphoria", artist: "Free Music Archive", vibe: "✨ Euphoric" },
  ],
  Anxious: [
    { title: "Inner Peace", artist: "Meditation Vibes", vibe: "💭 Reflective" },
    { title: "Grounding Light", artist: "Healing Sounds", vibe: "💙 Grounding" },
    { title: "Comfort Zone", artist: "Ambient Comfort", vibe: "🤝 Comforting" },
  ],
  Happy: [
    { title: "Pure Joy", artist: "Anno Domini Beats", vibe: "🌈 Joyful" },
    { title: "Positive Vibes", artist: "Royalty Free Music", vibe: "🏖️ Fun" },
    { title: "Celebration Time", artist: "Kevin MacLeod", vibe: "💃 Celebratory" },
  ],
};
