// Free mood-based suggestions using simple heuristics (no API required)

interface MoodSuggestion {
  emoji: string;
  mood: string;
  suggestions: string[];
  affirmation: string;
  activities: string[];
}

export const moodSuggestionsData: Record<string, MoodSuggestion> = {
  "😄": {
    emoji: "😄",
    mood: "Great",
    suggestions: [
      "Share your joy with someone you care about",
      "Capture this moment with a photo or video",
      "Do something fun to amplify your good mood",
      "Help someone else feel as good as you do",
    ],
    affirmation: "You're absolutely crushing it! Keep this energy going!",
    activities: [
      "Share with friends",
      "Celebrate",
      "Create content",
      "Help others",
    ],
  },
  "🙂": {
    emoji: "🙂",
    mood: "Good",
    suggestions: [
      "Maintain this positive momentum",
      "Engage in activities you enjoy",
      "Connect with people who make you happy",
      "Take time to appreciate the good things",
    ],
    affirmation: "You're in a great place. Keep building on this feeling!",
    activities: ["Social time", "Hobbies", "Relaxation", "Gratitude"],
  },
  "😑": {
    emoji: "😑",
    mood: "Okay",
    suggestions: [
      "Take a short break and do something you enjoy",
      "Go for a walk or stretch your body",
      "Call or message someone close to you",
      "Try a quick meditation or breathing exercise",
    ],
    affirmation: "It's okay to feel neutral. Things will improve!",
    activities: ["Break time", "Movement", "Connection", "Meditation"],
  },
  "☹️": {
    emoji: "☹️",
    mood: "Not Great",
    suggestions: [
      "Take deep breaths - you're stronger than this",
      "Reach out to someone you trust for support",
      "Do something that normally makes you feel better",
      "Take a step back and practice self-care",
      "Remember this feeling will pass",
    ],
    affirmation:
      "Tough times don't last, but tough people do. You've got this!",
    activities: ["Self-care", "Support", "Rest", "Reflection"],
  },
  "😴": {
    emoji: "😴",
    mood: "Sleep",
    suggestions: [
      "Consider getting some rest soon",
      "Avoid caffeine and heavy tasks",
      "Create a relaxing environment",
      "Practice wind-down techniques before bed",
    ],
    affirmation: "Rest is productive. Taking care of yourself matters!",
    activities: ["Rest", "Relaxation", "Sleep prep", "Light activity"],
  },
  "🤩": {
    emoji: "🤩",
    mood: "Excited",
    suggestions: [
      "Channel this energy into your goals",
      "Share your excitement with others",
      "Start that project you've been thinking about",
      "Do something bold and exciting",
    ],
    affirmation: "Harness this amazing energy and make something great!",
    activities: ["New projects", "Sharing", "Bold action", "Create"],
  },
  "😟": {
    emoji: "😟",
    mood: "Anxious",
    suggestions: [
      "Practice grounding techniques (5-4-3-2-1 sensory method)",
      "Take slow, deep breaths to calm your nervous system",
      "Write down your worries to get them out of your head",
      "Focus on what you can control, not what you can't",
      "Talk to someone trusted about how you're feeling",
    ],
    affirmation:
      "Anxiety is temporary. You have the strength to overcome this.",
    activities: ["Breathing", "Grounding", "Journal", "Talk"],
  },
  "😆": {
    emoji: "😆",
    mood: "Happy",
    suggestions: [
      "Spread this happiness to those around you",
      "Do more of what makes you laugh",
      "Create a memory of this moment",
      "Share laughter with friends or family",
    ],
    affirmation: "Your happiness is contagious and beautiful!",
    activities: ["Laughing", "Sharing", "Memories", "Fun"],
  },
  "😌": {
    emoji: "😌",
    mood: "Calm",
    suggestions: [
      "Maintain this peaceful state with mindful activities",
      "Journal your thoughts and feelings",
      "Practice gentle yoga or stretching",
      "Spend time in nature or a quiet space",
    ],
    affirmation: "This calm is a gift. Protect and nurture it.",
    activities: ["Mindfulness", "Journaling", "Yoga", "Nature"],
  },
  "🥹": {
    emoji: "🥹",
    mood: "Grateful",
    suggestions: [
      "Write down 3 things you're grateful for",
      "Express gratitude to someone important",
      "Take time to appreciate your blessings",
      "Share your gratitude with your community",
    ],
    affirmation: "Gratitude multiplies the good in your life!",
    activities: ["Gratitude", "Appreciation", "Sharing", "Reflection"],
  },
  "😠": {
    emoji: "😠",
    mood: "Frustrated",
    suggestions: [
      "Take a time-out to cool down before reacting",
      "Express your feelings constructively through writing or art",
      "Do a physical activity to release tension (walk, exercise)",
      "Identify what's frustrating you and one step to fix it",
      "Practice the 'name it to tame it' technique",
    ],
    affirmation: "Your feelings are valid. Channel them into positive action.",
    activities: ["Cool down", "Exercise", "Creative", "Problem-solving"],
  },
  "😘": {
    emoji: "😘",
    mood: "Loved",
    suggestions: [
      "Express love to someone who matters to you",
      "Spend quality time with loved ones",
      "Do something kind for someone special",
      "Appreciate and celebrate your relationships",
    ],
    affirmation: "Love is the greatest force. Cherish those you care about!",
    activities: ["Quality time", "Kindness", "Connection", "Celebration"],
  },
  "😎": {
    emoji: "😎",
    mood: "Confident",
    suggestions: [
      "Take on a challenge you've been avoiding",
      "Lead with confidence in what you do",
      "Encourage others with your positive energy",
      "Pursue that goal you've been thinking about",
    ],
    affirmation: "You are capable, strong, and amazing. Believe in yourself!",
    activities: ["Challenge", "Lead", "Inspire", "Pursue goals"],
  },
  "🤔": {
    emoji: "🤔",
    mood: "Thoughtful",
    suggestions: [
      "Take time for deep reflection and introspection",
      "Journal about what's on your mind",
      "Discuss your thoughts with someone wise",
      "Consider different perspectives on your situation",
    ],
    affirmation: "Thoughtfulness is a strength. Trust your inner wisdom.",
    activities: ["Reflection", "Journaling", "Conversation", "Meditation"],
  },
  "✨": {
    emoji: "✨",
    mood: "Inspired",
    suggestions: [
      "Create something beautiful from your inspiration",
      "Share your ideas and vision with others",
      "Take action on what inspires you",
      "Surround yourself with inspiration",
    ],
    affirmation: "Your inspiration can change the world. Act on it!",
    activities: ["Create", "Share", "Action", "Inspiration"],
  },
  "🌅": {
    emoji: "🌅",
    mood: "Wake Up",
    suggestions: [
      "Start your day with intention",
      "Have a healthy breakfast",
      "Plan your day positively",
      "Move your body to energize yourself",
    ],
    affirmation: "A new day brings new possibilities!",
    activities: ["Planning", "Breakfast", "Movement", "Intention"],
  },
  "📚": {
    emoji: "📚",
    mood: "In Class",
    suggestions: [
      "Stay focused and engaged in learning",
      "Take notes to reinforce what you're learning",
      "Ask questions to deepen understanding",
      "Be present in the moment",
    ],
    affirmation: "Every lesson learned makes you smarter and stronger!",
    activities: ["Learning", "Focus", "Questions", "Growth"],
  },
  "🚶": {
    emoji: "🚶",
    mood: "On My Way",
    suggestions: [
      "Enjoy the journey, not just the destination",
      "Be present and aware of your surroundings",
      "Use travel time for thinking or listening to inspiring content",
      "Stay safe and focused on where you're going",
    ],
    affirmation: "Every journey is progress toward your goals!",
    activities: ["Journey", "Awareness", "Learning", "Focus"],
  },
  "🏠": {
    emoji: "🏠",
    mood: "At Home",
    suggestions: [
      "Make your space comfortable and welcoming",
      "Spend quality time with family or roommates",
      "Take care of yourself in your safe space",
      "Enjoy simple comforts of home",
    ],
    affirmation: "Home is where you can truly be yourself!",
    activities: ["Comfort", "Family", "Self-care", "Relax"],
  },
  "💻": {
    emoji: "💻",
    mood: "At Work",
    suggestions: [
      "Stay focused and productive on your tasks",
      "Take regular breaks to avoid burnout",
      "Collaborate and communicate with your team",
      "Remember the value of your work",
    ],
    affirmation: "Your work matters and contributes to something meaningful!",
    activities: ["Focus", "Breaks", "Collaboration", "Purpose"],
  },
};

export const moodSuggestionsService = {
  getSuggestionsForMood: (emoji: string): MoodSuggestion | null => {
    return moodSuggestionsData[emoji] || null;
  },

  getRandomSuggestion: (emoji: string): string | null => {
    const data = moodSuggestionsData[emoji];
    if (!data) return null;
    return data.suggestions[
      Math.floor(Math.random() * data.suggestions.length)
    ];
  },

  getAffirmationForMood: (emoji: string): string | null => {
    return moodSuggestionsData[emoji]?.affirmation || null;
  },

  getAllMoods: () => Object.keys(moodSuggestionsData),
};
