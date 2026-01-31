export interface Song {
  title: string;
  artist: string;
  vibe: string;
}

export const moodSongs: Record<string, Song[]> = {
  Great: [
    { title: "Walking on Sunshine", artist: "Katrina & The Waves", vibe: "🌞 Uplifting" },
    { title: "Good as Hell", artist: "Lizzo", vibe: "💪 Empowering" },
    { title: "Don't Stop Me Now", artist: "Queen", vibe: "🚀 Energetic" },
  ],
  Good: [
    { title: "Here Comes the Sun", artist: "The Beatles", vibe: "☀️ Positive" },
    { title: "Lovely Day", artist: "Bill Withers", vibe: "💖 Warm" },
    { title: "Three Little Birds", artist: "Bob Marley", vibe: "🎶 Easy" },
  ],
  Okay: [
    { title: "Good Day", artist: "Nappy Roots", vibe: "😊 Chill" },
    { title: "Breathe", artist: "The Pink Floyd", vibe: "🧘 Calm" },
    { title: "Sunday Morning", artist: "Maroon 5", vibe: "☕ Relaxed" },
  ],
  "Not Great": [
    { title: "Stronger", artist: "Kelly Clarkson", vibe: "💪 Recovery" },
    { title: "Fight Song", artist: "Rachel Platten", vibe: "✊ Inspiring" },
    { title: "Unwritten", artist: "Natasha Bedingfield", vibe: "🌟 Hopeful" },
  ],
  Tired: [
    { title: "Weightless", artist: "Marconi Union", vibe: "😴 Soothing" },
    { title: "The Night We Met", artist: "Lord Huron", vibe: "🌙 Dreamy" },
    { title: "Vanilla Sky", artist: "Bon Iver", vibe: "❄️ Peaceful" },
  ],
  Excited: [
    { title: "Shut Up and Dance", artist: "Walk the Moon", vibe: "🎉 Party" },
    { title: "Mr. Brightside", artist: "The Killers", vibe: "⚡ Thrilling" },
    { title: "Levitating", artist: "Dua Lipa", vibe: "✨ Euphoric" },
  ],
  Anxious: [
    { title: "Wildest Dreams", artist: "Taylor Swift", vibe: "💭 Reflective" },
    { title: "I Will Follow You into the Dark", artist: "Death Cab for Cutie", vibe: "💙 Grounding" },
    { title: "Skinny Love", artist: "Bon Iver", vibe: "🤝 Comforting" },
  ],
  Happy: [
    { title: "Walking on Sunshine", artist: "Katrina & The Waves", vibe: "🌈 Joyful" },
    { title: "Good Vibrations", artist: "The Beach Boys", vibe: "🏖️ Fun" },
    { title: "Shut Up and Dance", artist: "Walk the Moon", vibe: "💃 Celebratory" },
  ],
};
