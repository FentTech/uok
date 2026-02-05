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
  Lock,
} from "lucide-react";
import { moodSongs } from "../data/songs";
import RotatingAds from "../components/RotatingAds";
import MediaPreRollAd from "../components/MediaPreRollAd";
import { analyticsService } from "../lib/analytics";
import {
  mediaStorage,
  notificationStorage,
  notificationHelpers,
  checkInStorage,
  type StoredMedia,
  type StoredCheckIn,
} from "../lib/dataStorage";

// Run cleanup on app load
if (typeof window !== "undefined") {
  checkInStorage.cleanupOldCheckIns();
}

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
  { emoji: "😄", mood: "Great" },
  { emoji: "🙂", mood: "Good" },
  { emoji: "😑", mood: "Okay" },
  { emoji: "☹️", mood: "Not Great" },
  { emoji: "😴", mood: "Sleep" },
  { emoji: "🤩", mood: "Excited" },
  { emoji: "😟", mood: "Anxious" },
  { emoji: "😆", mood: "Happy" },
  { emoji: "😌", mood: "Calm" },
  { emoji: "🥹", mood: "Grateful" },
  { emoji: "😠", mood: "Frustrated" },
  { emoji: "😘", mood: "Loved" },
  { emoji: "😎", mood: "Confident" },
  { emoji: "🤔", mood: "Thoughtful" },
  { emoji: "✨", mood: "Inspired" },
  { emoji: "🌅", mood: "Wake Up" },
  { emoji: "📚", mood: "In Class" },
  { emoji: "🚶", mood: "On My Way" },
  { emoji: "🏠", mood: "At Home" },
  { emoji: "💻", mood: "At Work" },
];

// Function to initialize demo data for testing bonded check-ins
const initializeDemoData = () => {
  // Check if bonded contacts already exist
  const existingBondedContacts = localStorage.getItem("bondedContacts");
  if (existingBondedContacts) {
    console.log(
      "✅ Bonded contacts already exist, skipping demo data initialization",
    );
    return;
  }

  console.log("🎯 Initializing demo bonded contacts and check-ins...");

  // Create demo bonded contacts
  const demoBondedContacts = [
    {
      id: "demo-1",
      name: "Mom",
      email: "mom@example.com",
      bondCode: "UOKDEMO123",
      status: "bonded" as const,
      bondedAt: new Date().toLocaleString(),
      emoji: "👩",
    },
    {
      id: "demo-2",
      name: "Brother",
      email: "brother@example.com",
      bondCode: "UOKDEMO456",
      status: "bonded" as const,
      bondedAt: new Date().toLocaleString(),
      emoji: "👨",
    },
    {
      id: "demo-3",
      name: "Sister",
      email: "sister@example.com",
      bondCode: "UOKDEMO789",
      status: "bonded" as const,
      bondedAt: new Date().toLocaleString(),
      emoji: "👨‍🤝‍👨",
    },
  ];

  localStorage.setItem("bondedContacts", JSON.stringify(demoBondedContacts));
  console.log("✅ Demo bonded contacts created:", demoBondedContacts);

  // Create demo check-ins for each bonded contact
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const moodEmojisArray = [
    { emoji: "😊", mood: "Great" },
    { emoji: "🙂", mood: "Good" },
    { emoji: "😑", mood: "Okay" },
  ];

  const demoCheckIns: StoredCheckIn[] = [];

  demoBondedContacts.forEach((contact, index) => {
    const moodChoice = moodEmojisArray[index % moodEmojisArray.length];
    const now = new Date();
    const timeOffset = (index + 1) * 30 * 60000; // Stagger by 30 mins each
    const checkInTime = new Date(now.getTime() - timeOffset);

    const checkIn: StoredCheckIn = {
      id: `demo-checkin-${index}`,
      userEmail: contact.email,
      userName: contact.name,
      emoji: moodChoice.emoji,
      mood: moodChoice.mood,
      timestamp: checkInTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: today,
      timeSlot: index % 2 === 0 ? "morning" : "afternoon",
      createdAt: new Date().toISOString(),
    };

    demoCheckIns.push(checkIn);
  });

  // Get existing check-ins and add demo ones
  const existingCheckIns = localStorage.getItem("uok_checkins");
  const allCheckIns = existingCheckIns ? JSON.parse(existingCheckIns) : [];

  // Add demo check-ins if not already present
  const demoCheckInIds = new Set(demoCheckIns.map((c) => c.id));
  const filteredExisting = allCheckIns.filter(
    (c: StoredCheckIn) => !demoCheckInIds.has(c.id),
  );

  const finalCheckIns = [...filteredExisting, ...demoCheckIns];
  localStorage.setItem("uok_checkins", JSON.stringify(finalCheckIns));

  console.log("✅ Demo check-ins created:", demoCheckIns);
  console.log("✅ Total check-ins in storage:", finalCheckIns.length);
};

// Helper function to load demo bonded contacts from localStorage
const loadDemoBondedContacts = (setBondedContacts: any) => {
  const demoBondedContactsStr = localStorage.getItem("bondedContacts");
  if (demoBondedContactsStr) {
    try {
      const parsed = JSON.parse(demoBondedContactsStr);
      setBondedContacts(parsed);
      console.log("✅ Demo bonded contacts loaded and set to state:", parsed.length);
      return parsed;
    } catch (e) {
      console.error("Error loading demo bonded contacts:", e);
      return [];
    }
  }
  return [];
};

export default function Dashboard() {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [todayCheckInCount, setTodayCheckInCount] = useState(0);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<
    "morning" | "afternoon" | "evening" | null
  >(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState<string | null>(null);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bondedContacts, setBondedContacts] = useState<any[]>([]);
  const [mediaShareModalOpen, setMediaShareModalOpen] = useState<string | null>(
    null,
  );
  const [showPreRollAd, setShowPreRollAd] = useState(false);
  const [fullscreenMedia, setFullscreenMedia] = useState<MediaItem | null>(
    null,
  );
  const [shareVisibility, setShareVisibility] = useState<
    "personal" | "bonded-contacts" | "community"
  >("community");
  const [selectedContactsToShare, setSelectedContactsToShare] = useState<
    string[]
  >([]);
  const [bondedCheckIns, setBondedCheckIns] = useState<StoredCheckIn[]>([]);
  const missedCheckInTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play a simple notification beep/tone
  const playNotificationSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.log("Audio playback not available");
    }
  };

  // Send check-in notifications to bonded contacts
  const sendCheckInNotification = (mood: string) => {
    // Get bonded contacts from localStorage
    const bondedContactsStr = localStorage.getItem("bondedContacts");
    const bondedContacts = bondedContactsStr
      ? JSON.parse(bondedContactsStr)
      : [];

    const contactCount = bondedContacts.length;

    // Create notification for current user
    const notification = notificationStorage.add({
      type: "checkin",
      message: `✓ Check-in sent to ${contactCount} bonded contact${contactCount !== 1 ? "s" : ""} - You're feeling ${mood}`,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    });

    setNotifications((prev) => [notification as any, ...prev]);

    // Get user's name/email
    const userEmail = localStorage.getItem("userEmail") || "User";

    // Send notifications to bonded contacts
    bondedContacts.forEach((contact: any) => {
      // Store notification for bonded contact
      notificationStorage.add({
        type: "checkin",
        message: `Your bonded family member just checked in on UOK feeling ${mood}. They're doing okay! 💚`,
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

      console.log("📱 Check-in notification sent to bonded contact:", {
        recipient: contact.name,
        email: contact.email,
        bondCode: contact.bondCode,
        mood: mood,
        timestamp: new Date().toISOString(),
      });

      // Send email notification via API
      if (contact.email) {
        fetch("/api/notifications/send-checkin-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientEmail: contact.email,
            senderName: userEmail.split("@")[0] || "Your contact",
            senderMood: mood,
            timestamp: new Date().toISOString(),
          }),
        }).catch((error) =>
          console.error("Failed to send email notification:", error),
        );
      }
    });

    // Browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("UOK Check-in Recorded", {
        body: `Your check-in has been shared with ${contactCount} bonded contact${contactCount !== 1 ? "s" : ""}.`,
        icon: "/favicon.ico",
      });
    }
  };

  // Load all user data on mount (bonded contacts, check-ins, media, shared moments)
  useEffect(() => {
    const loadAllUserData = async () => {
      const userEmail = localStorage.getItem("userEmail");

      if (!userEmail) {
        console.log("⚠️ No user email found, cannot load user data");
        // Still initialize demo data even without user email for testing
        initializeDemoData();
        loadDemoBondedContacts(setBondedContacts);
        return;
      }

      console.log("🔄 Loading user data for:", userEmail);

      try {
        const { supabaseUserSyncService } = await import("../lib/supabase");

        // Load bonded contacts
        let bondedContactsStr = localStorage.getItem("bondedContacts");
        let bondedContacts = [];

        if (bondedContactsStr) {
          try {
            bondedContacts = JSON.parse(bondedContactsStr);
            console.log(
              "✅ Loaded bonded contacts from localStorage:",
              bondedContacts.length,
            );
          } catch (e) {
            console.error("Error parsing bonded contacts:", e);
          }
        }

        // If not found locally, try Supabase
        if (bondedContacts.length === 0) {
          console.log("📥 Fetching bonded contacts from Supabase...");
          const supabaseBondedContacts =
            await supabaseUserSyncService.fetchBondedContacts(userEmail);

          if (supabaseBondedContacts.length > 0) {
            console.log(
              "✅ Loaded bonded contacts from Supabase:",
              supabaseBondedContacts.length,
            );
            localStorage.setItem(
              "bondedContacts",
              JSON.stringify(supabaseBondedContacts),
            );
            bondedContacts = supabaseBondedContacts;
          }
        }

        // Load check-ins
        let checkInsData = [];
        let checkInsStr = localStorage.getItem("uok_checkins");

        if (checkInsStr) {
          try {
            checkInsData = JSON.parse(checkInsStr);
            console.log(
              "✅ Loaded check-ins from localStorage:",
              checkInsData.length,
            );
          } catch (e) {
            console.error("Error parsing check-ins:", e);
          }
        }

        // If not found locally, try Supabase
        if (checkInsData.length === 0) {
          console.log("📥 Fetching check-ins from Supabase...");
          const supabaseCheckIns =
            await supabaseUserSyncService.fetchCheckIns(userEmail);

          if (supabaseCheckIns.length > 0) {
            console.log(
              "✅ Loaded check-ins from Supabase:",
              supabaseCheckIns.length,
            );
            localStorage.setItem(
              "uok_checkins",
              JSON.stringify(supabaseCheckIns),
            );
            checkInsData = supabaseCheckIns;
          }
        }

        // Load media
        let mediaData = [];
        let mediaStr = localStorage.getItem("uok_media");

        if (mediaStr) {
          try {
            mediaData = JSON.parse(mediaStr);
            console.log("✅ Loaded media from localStorage:", mediaData.length);
          } catch (e) {
            console.error("Error parsing media:", e);
          }
        }

        // If not found locally, try Supabase
        if (mediaData.length === 0) {
          console.log("📥 Fetching media from Supabase...");
          const supabaseMedia =
            await supabaseUserSyncService.fetchMedia(userEmail);

          if (supabaseMedia.length > 0) {
            console.log("✅ Loaded media from Supabase:", supabaseMedia.length);
            localStorage.setItem("uok_media", JSON.stringify(supabaseMedia));
            mediaData = supabaseMedia;
          }
        }

        // Load shared moments
        let sharedMomentsData = [];
        let sharedMomentsStr = localStorage.getItem("uok_shared_moments");

        if (sharedMomentsStr) {
          try {
            sharedMomentsData = JSON.parse(sharedMomentsStr);
            console.log(
              "✅ Loaded shared moments from localStorage:",
              sharedMomentsData.length,
            );
          } catch (e) {
            console.error("Error parsing shared moments:", e);
          }
        }

        // If not found locally, try Supabase
        if (sharedMomentsData.length === 0) {
          console.log("📥 Fetching shared moments from Supabase...");
          const supabaseSharedMoments =
            await supabaseUserSyncService.fetchSharedMoments(userEmail);

          if (supabaseSharedMoments.length > 0) {
            console.log(
              "✅ Loaded shared moments from Supabase:",
              supabaseSharedMoments.length,
            );
            localStorage.setItem(
              "uok_shared_moments",
              JSON.stringify(supabaseSharedMoments),
            );
            sharedMomentsData = supabaseSharedMoments;
          }
        }

        // Set check-ins to state
        if (checkInsData.length > 0) {
          setCheckIns(checkInsData);
          console.log("✅ Check-ins set to state:", checkInsData.length);
        }

        // Set bonded contacts to state
        if (bondedContacts.length > 0) {
          setBondedContacts(bondedContacts);
          console.log(
            "✅ Bonded contacts set to state:",
            bondedContacts.length,
          );
        } else {
          // If no bonded contacts found anywhere, initialize demo data for testing
          console.log(
            "ℹ️ No bonded contacts found. Initializing demo data for testing...",
          );
          initializeDemoData();
          loadDemoBondedContacts();
        }
      } catch (error) {
        console.error("Error loading user data from Supabase:", error);
        // Fall back to using what's in localStorage
        loadDemoBondedContacts();
      }
    };

    loadAllUserData();
  }, []);

  // Load bonded contacts' check-ins whenever bonded contacts change
  useEffect(() => {
    const loadBondedCheckIns = async () => {
      if (bondedContacts.length > 0) {
        console.log(
          "📥 Bonded contacts loaded:",
          bondedContacts.length,
          bondedContacts,
        );

        const bondedEmails = bondedContacts.map((c) => c.email).filter(Boolean); // Filter out undefined emails

        const bondNames = bondedContacts.map((c) => c.name).filter(Boolean);

        console.log("📥 Bonded emails:", bondedEmails);
        console.log("📥 Bonded names:", bondNames);

        let allCheckIns: StoredCheckIn[] = [];

        // First, try to get check-ins by email from Supabase
        if (bondedEmails.length > 0) {
          try {
            const supabaseCheckIns =
              await checkInStorage.fetchBondedCheckInsFromFirebase(
                bondedEmails,
              );

            if (supabaseCheckIns.length > 0) {
              console.log(
                "📥 Loaded bonded check-ins from Supabase:",
                supabaseCheckIns.length,
              );
              allCheckIns.push(...supabaseCheckIns);
            }
          } catch (error) {
            console.log("Supabase fetch failed, continuing with local storage");
          }
        }

        // Fall back to local storage - check by email AND by name
        const allStoredCheckIns = checkInStorage.getAll();
        const today = new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const todayCheckIns = allStoredCheckIns.filter((c) => c.date === today);

        console.log(
          "📥 All stored check-ins:",
          allStoredCheckIns.length,
          "| Today's check-ins:",
          todayCheckIns.length,
        );
        console.log("📥 Today's check-ins detail:", todayCheckIns);

        const localCheckIns = todayCheckIns.filter((c) => {
          // Match by email if email exists
          if (bondedEmails.includes(c.userEmail)) {
            console.log(`✅ Matched check-in by email: ${c.userEmail}`);
            return true;
          }

          // Also match by userName for backwards compatibility
          if (bondNames.includes(c.userName)) {
            console.log(`✅ Matched check-in by userName: ${c.userName}`);
            return true;
          }

          console.log(
            `❌ Check-in ${c.id} not matched - userEmail: ${c.userEmail}, userName: ${c.userName}`,
          );
          return false;
        });

        if (localCheckIns.length > 0) {
          console.log(
            "📥 Loaded bonded check-ins from local storage:",
            localCheckIns.length,
          );
          allCheckIns.push(...localCheckIns);
        }

        // Remove duplicates (in case same check-in is in both Supabase and local)
        const uniqueCheckIns = Array.from(
          new Map(allCheckIns.map((c) => [c.id, c])).values(),
        );

        setBondedCheckIns(uniqueCheckIns);
        console.log(
          "📥 Total bonded check-ins to display:",
          uniqueCheckIns.length,
        );
      } else {
        setBondedCheckIns([]);
      }
    };

    loadBondedCheckIns();
  }, [bondedContacts]);

  // Sync bonded contacts to Supabase whenever they change
  useEffect(() => {
    if (bondedContacts.length > 0) {
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail && userEmail !== "user") {
        import("../lib/supabase")
          .then(({ supabaseUserSyncService }) => {
            return supabaseUserSyncService.syncBondedContacts(
              userEmail,
              bondedContacts,
            );
          })
          .then(() => console.log("✅ Bonded contacts synced to Firebase"))
          .catch((error) =>
            console.log(
              "⚠️ Could not sync bonded contacts to Firebase:",
              error,
            ),
          );
      }
    }
  }, [bondedContacts]);

  // Initialize static content once
  useEffect(() => {
    // Only initialize static content once
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;

      // Load media from persistent storage
      const savedMedia = mediaStorage.getActive();
      // Filter to show only today's media
      const today = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const todayMedia = savedMedia.filter((m) => m.date === today);
      setMediaItems(todayMedia as any[]);

      // Load notifications from persistent storage
      const savedNotifications = notificationStorage.getAll();
      setNotifications(savedNotifications as any[]);

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

  // Auto-refresh bonded check-ins every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (bondedContacts.length === 0) return;

      const bondedEmails = bondedContacts.map((c) => c.email).filter(Boolean);
      const bondNames = bondedContacts.map((c) => c.name).filter(Boolean);

      let allCheckIns: StoredCheckIn[] = [];

      // Try Supabase first
      if (bondedEmails.length > 0) {
        try {
          const supabaseCheckIns =
            await checkInStorage.fetchBondedCheckInsFromFirebase(bondedEmails);

          if (supabaseCheckIns.length > 0) {
            allCheckIns.push(...supabaseCheckIns);
          }
        } catch (error) {
          console.log("Supabase auto-refresh failed");
        }
      }

      // Fall back to local storage - check by email AND by name
      const localCheckIns = checkInStorage.getAll().filter((c) => {
        const today = new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        if (c.date !== today) return false;

        // Match by email if email exists
        if (bondedEmails.includes(c.userEmail)) return true;

        // Also match by userName for backwards compatibility
        if (bondNames.includes(c.userName)) return true;

        return false;
      });

      if (localCheckIns.length > 0) {
        allCheckIns.push(...localCheckIns);
      }

      // Remove duplicates
      const uniqueCheckIns = Array.from(
        new Map(allCheckIns.map((c) => [c.id, c])).values(),
      );

      setBondedCheckIns(uniqueCheckIns);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [bondedContacts]);

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

  const handleCheckIn = async (emoji: string, mood: string) => {
    if (todayCheckInCount >= 3) {
      alert("You've reached your maximum check-ins for today (3)");
      return;
    }

    if (!selectedTimeSlot) {
      alert("Please select a check-in time (Morning, Afternoon, or Evening)");
      return;
    }

    const now = new Date();
    const timestamp = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const date = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const newCheckIn: CheckIn = {
      id: Date.now().toString(),
      emoji,
      mood,
      time: timestamp,
      date: "Today",
      timeSlot: selectedTimeSlot,
    };

    // Save check-in to persistent storage and Firebase
    const userEmail = localStorage.getItem("userEmail") || "user";
    const userName = userEmail === "user" ? "You" : userEmail.split("@")[0];
    await checkInStorage.add({
      userEmail,
      userName,
      emoji,
      mood,
      timestamp,
      date,
      timeSlot: selectedTimeSlot,
    });

    // Sync check-ins to Supabase (fire and forget)
    const allCheckIns = checkInStorage.getAll();
    if (userEmail && userEmail !== "user") {
      import("../lib/supabase")
        .then(({ supabaseUserSyncService }) => {
          return supabaseUserSyncService.syncCheckIns(userEmail, allCheckIns);
        })
        .then(() => console.log("✅ Check-in synced to Firebase"))
        .catch((error) =>
          console.log("⚠️ Could not sync check-in to Firebase:", error),
        );
    }

    setCheckIns([newCheckIn, ...checkIns]);
    setTodayCheckInCount((prev) => Math.min(prev + 1, 3));
    setSelectedMood(emoji);
    playNotificationSound(); // Play sound when mood is selected

    // Send check-in notification to bonded contacts
    sendCheckInNotification(mood);

    // Show confirmation
    setTimeout(() => {
      setSelectedMood(null);
      setSelectedTimeSlot(null);
    }, 2000);
  };

  // Open share modal for media
  const openMediaShareModal = (item: MediaItem) => {
    setMediaShareModalOpen(item.id);
    setShareVisibility("community");
    setSelectedContactsToShare([]);
  };

  // Share media to community or bonded members
  const handleShareMedia = (item: MediaItem) => {
    if (shareVisibility === "community") {
      // Share to community memories
      navigate("/shared-memories", {
        state: {
          mediaUrl: item.url,
          mediaType: item.type,
          mood: item.mood,
        },
      });
    } else if (shareVisibility === "bonded-contacts") {
      if (selectedContactsToShare.length === 0) {
        alert("Please select at least one bonded contact to share with");
        return;
      }

      // Update media in storage with sharing info
      const contactEmails = selectedContactsToShare
        .map((id) => bondedContacts.find((c) => c.id === id)?.email)
        .filter(Boolean);

      mediaStorage.update(item.id, {
        sharedWith: contactEmails,
        visibility: "bonded-contacts",
      });

      // Send notifications to selected contacts
      const userEmail = localStorage.getItem("userEmail") || "User";
      selectedContactsToShare.forEach((contactId) => {
        const contact = bondedContacts.find((c) => c.id === contactId);
        if (contact) {
          // Add in-app notification
          notificationStorage.add({
            type: "media-shared",
            message: `Shared a ${item.type} with you 📸`,
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

          // Send email notification via API
          if (contact.email) {
            fetch("/api/notifications/send-media-shared", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                recipientEmail: contact.email,
                senderName: userEmail.split("@")[0] || "Your contact",
                mediaType: item.type,
                timestamp: new Date().toISOString(),
              }),
            }).catch((error) =>
              console.error("Failed to send media share notification:", error),
            );
          }
        }
      });

      alert(
        `✓ Media shared with ${selectedContactsToShare.length} bonded contact${selectedContactsToShare.length !== 1 ? "s" : ""}!`,
      );
    }

    setMediaShareModalOpen(null);
    setSelectedContactsToShare([]);
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
        const timestamp = new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const date = new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        // Save to persistent storage
        const savedMedia = mediaStorage.add({
          type: "photo",
          url: url,
          timestamp,
          date,
          mood: MOOD_EMOJIS.find((m) => m.emoji === selectedMood)?.mood,
          visibility: "personal",
        });

        // Update local state
        setMediaItems((prev) => [savedMedia as any, ...prev]);

        // Sync to Supabase (fire and forget)
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail && userEmail !== "user") {
          import("../lib/supabase")
            .then(({ supabaseUserSyncService }) => {
              const allMedia = mediaStorage.getActive();
              return supabaseUserSyncService.syncMedia(userEmail, allMedia);
            })
            .then(() => console.log("✅ Photo synced to Firebase"))
            .catch((error) =>
              console.log("⚠️ Could not sync photo to Firebase:", error),
            );
        }
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
        const timestamp = new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const date = new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        // Save to persistent storage
        const savedMedia = mediaStorage.add({
          type: "video",
          url: url,
          timestamp,
          date,
          mood: MOOD_EMOJIS.find((m) => m.emoji === selectedMood)?.mood,
          visibility: "personal",
        });

        // Update local state
        setMediaItems((prev) => [savedMedia as any, ...prev]);

        // Sync to Supabase (fire and forget)
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail && userEmail !== "user") {
          import("../lib/supabase")
            .then(({ supabaseUserSyncService }) => {
              const allMedia = mediaStorage.getActive();
              return supabaseUserSyncService.syncMedia(userEmail, allMedia);
            })
            .then(() => console.log("✅ Video synced to Firebase"))
            .catch((error) =>
              console.log("⚠️ Could not sync video to Firebase:", error),
            );
        }
      });
    }
    // Reset input
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const deleteMedia = (id: string) => {
    // Mark as deleted in persistent storage instead of removing
    mediaStorage.delete(id);
    // Update local state
    setMediaItems(mediaItems.filter((item) => item.id !== id));
  };

  const refreshBondedCheckIns = async () => {
    if (bondedContacts.length === 0) {
      setBondedCheckIns([]);
      return;
    }

    const bondedEmails = bondedContacts.map((c) => c.email).filter(Boolean);
    const bondNames = bondedContacts.map((c) => c.name).filter(Boolean);

    let allCheckIns: StoredCheckIn[] = [];

    // First, try to get check-ins by email from Supabase
    if (bondedEmails.length > 0) {
      try {
        const supabaseCheckIns =
          await checkInStorage.fetchBondedCheckInsFromFirebase(bondedEmails);

        if (supabaseCheckIns.length > 0) {
          console.log(
            "📥 Refreshed bonded check-ins from Supabase:",
            supabaseCheckIns.length,
          );
          allCheckIns.push(...supabaseCheckIns);
        }
      } catch (error) {
        console.log("Supabase refresh failed, continuing with local storage");
      }
    }

    // Fall back to local storage - check by email AND by name
    const localCheckIns = checkInStorage.getAll().filter((c) => {
      const today = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (c.date !== today) return false;

      // Match by email if email exists
      if (bondedEmails.includes(c.userEmail)) return true;

      // Also match by userName for backwards compatibility
      if (bondNames.includes(c.userName)) return true;

      return false;
    });

    if (localCheckIns.length > 0) {
      console.log(
        "📥 Refreshed bonded check-ins from local storage:",
        localCheckIns.length,
      );
      allCheckIns.push(...localCheckIns);
    }

    // Remove duplicates
    const uniqueCheckIns = Array.from(
      new Map(allCheckIns.map((c) => [c.id, c])).values(),
    );

    setBondedCheckIns(uniqueCheckIns);
    console.log(
      "📥 Total bonded check-ins after refresh:",
      uniqueCheckIns.length,
    );
  };

  const addDemoBondedCheckIns = () => {
    if (bondedContacts.length === 0) {
      alert("Please add bonded contacts first!");
      return;
    }

    const moodOptions = ["Great", "Good", "Okay", "Happy", "Excited"];
    const emojiOptions = ["😊", "🙂", "😑", "😍", "🎉"];

    // Add demo check-ins for each bonded contact
    bondedContacts.forEach((contact: any, index: number) => {
      const mood = moodOptions[index % moodOptions.length];
      const emoji = emojiOptions[index % emojiOptions.length];
      const now = new Date();
      const time = new Date(now.getTime() - (index + 1) * 30 * 60000); // Stagger by 30 mins

      checkInStorage.add({
        userEmail: contact.email,
        userName: contact.name,
        emoji: emoji,
        mood: mood,
        timestamp: time.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        timeSlot: index % 2 === 0 ? "morning" : "afternoon",
      });
    });

    // Refresh the display
    refreshBondedCheckIns();
    alert(
      `✓ Demo check-ins added for ${bondedContacts.length} bonded contact${bondedContacts.length !== 1 ? "s" : ""}!`,
    );
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
                  <div className="p-3 border-t border-cyan-400/20">
                    <Link
                      to="/bond-notifications"
                      className="block text-center text-cyan-400 hover:text-cyan-300 text-sm font-medium hover:bg-white/5 py-2 rounded-lg transition"
                    >
                      View all notifications
                    </Link>
                  </div>
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
                    <div className="border-b border-cyan-400/20 pb-4">
                      <h3 className="text-cyan-200 font-semibold mb-2">
                        Notification Settings
                      </h3>
                      <label className="flex items-center gap-3 text-cyan-300">
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

                    <div className="border-b border-cyan-400/20 pb-4">
                      <h3 className="text-cyan-200 font-semibold mb-2">
                        Check-in Reminders
                      </h3>
                      <label className="flex items-center gap-3 text-cyan-300">
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

                    <div className="border-b border-cyan-400/20 pb-4">
                      <h3 className="text-cyan-200 font-semibold mb-2">
                        Account
                      </h3>
                      <Link
                        to="/user-profile"
                        onClick={() => setSettingsOpen(false)}
                        className="block w-full px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 hover:text-cyan-200 rounded-lg font-medium text-sm transition border border-cyan-400/30 text-center"
                      >
                        👤 Manage Profile
                      </Link>
                    </div>

                    <div className="pt-4 space-y-2">
                      <button
                        onClick={() => setSettingsOpen(false)}
                        className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition"
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
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b border-cyan-400/20 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto">
            {notifications.slice(0, 2).map((notif) => (
              <div
                key={notif.id}
                className="flex items-center justify-between bg-white/5 rounded-lg p-3 mb-2 backdrop-blur-sm border border-cyan-400/20"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-cyan-300 text-sm font-medium">
                      {notif.message}
                    </p>
                    <p className="text-cyan-500/60 text-xs">
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
                  className="text-cyan-500/60 hover:text-cyan-400"
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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Welcome Back! 👋
          </h1>
          <p className="text-cyan-300/80">
            How are you feeling today? Let your contacts know you're okay.
          </p>
        </div>

        {/* Data Retention Notice */}
        <div className="mb-8 p-4 bg-orange-500/10 border border-orange-400/30 rounded-xl backdrop-blur-sm">
          <p className="text-orange-300 text-sm">
            <span className="font-semibold">📊 Data Retention:</span> All
            check-in records are automatically deleted after 72 hours to save
            storage space. Go to{" "}
            <Link
              to="/user-profile"
              className="underline hover:text-orange-200 transition"
            >
              Profile Settings
            </Link>{" "}
            to learn more.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Check-in Section */}
          <div className="md:col-span-2 space-y-8">
            {/* Status Card - Futuristic */}
            <div className="bg-white/10 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-6 hover:border-cyan-400/60 transition">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-500/20 rounded-lg">
                  <StatusIcon className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-cyan-100">
                    Daily Check-in Status
                  </h3>
                  <p className="text-sm text-cyan-300/80">{status.text}</p>
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
                <p className="text-cyan-200 font-semibold mb-3 text-sm">
                  Select check-in time:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {CHECK_IN_TIMES.map((timeSlot) => (
                    <button
                      key={timeSlot.slot}
                      onClick={() =>
                        setSelectedTimeSlot(
                          timeSlot.slot as "morning" | "afternoon" | "evening",
                        )
                      }
                      disabled={todayCheckInCount >= 3}
                      className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
                        selectedTimeSlot === timeSlot.slot
                          ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                          : "bg-white/10 text-cyan-200 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed border border-cyan-400/30"
                      }`}
                    >
                      {timeSlot.icon}{" "}
                      {timeSlot.slot.charAt(0).toUpperCase() +
                        timeSlot.slot.slice(1)}
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
                              onClick={playNotificationSound}
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
                        onClick={() => {
                          // Show pre-roll ad before viewing media (for videos)
                          if (item.type === "video") {
                            setShowPreRollAd(true);
                          }
                          setFullscreenMedia(item);
                        }}
                        className="relative group rounded-lg overflow-hidden bg-slate-900 border border-cyan-400/30 hover:border-cyan-400/60 transition cursor-pointer"
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
                            onClick={() => openMediaShareModal(item)}
                            className="opacity-0 group-hover:opacity-100 transition bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                            title="Share media"
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

            {/* Pre-Roll Ad for Media Viewing */}
            {showPreRollAd && (
              <MediaPreRollAd
                onAdComplete={() => {
                  setShowPreRollAd(false);
                  // Track view after ad completes
                  if (fullscreenMedia) {
                    const userEmail =
                      localStorage.getItem("userEmail") || "user";
                    const today = new Date().toISOString().split("T")[0];
                    analyticsService.trackEvent({
                      type: "view",
                      targetId: fullscreenMedia.id,
                      targetType: "memory",
                      userEmail,
                      timestamp: new Date().toISOString(),
                      date: today,
                      metadata: {
                        engagementLevel: "high", // Watched ad = high engagement
                      },
                    });
                  }
                }}
              />
            )}

            {/* Fullscreen Media Modal */}
            {fullscreenMedia && (
              <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-40 backdrop-blur-sm">
                <div className="relative w-full h-full max-w-6xl flex items-center justify-center">
                  <button
                    onClick={() => {
                      setFullscreenMedia(null);
                      setShowPreRollAd(false);
                    }}
                    className="absolute top-4 right-4 z-50 text-white bg-black/50 hover:bg-black/80 p-2 rounded-lg transition"
                    title="Close"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {fullscreenMedia.type === "photo" ? (
                    <img
                      src={fullscreenMedia.url}
                      alt="Fullscreen view"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <video
                      src={fullscreenMedia.url}
                      controls
                      autoPlay
                      className="max-w-full max-h-full"
                    />
                  )}
                </div>
              </div>
            )}
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

            {/* Bonded Family Check-ins - Futuristic */}
            <div className="bg-white/10 backdrop-blur-xl border border-purple-400/30 rounded-2xl p-6 hover:border-purple-400/60 transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-purple-100 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                  Bonded Family Check-ins
                </h3>
                <button
                  onClick={refreshBondedCheckIns}
                  className="text-purple-400 hover:text-purple-300 transition text-xs font-semibold px-2 py-1 rounded hover:bg-purple-500/20"
                  title="Refresh check-ins"
                >
                  🔄 Refresh
                </button>
              </div>

              <div className="space-y-3">
                {bondedCheckIns && bondedCheckIns.length > 0 ? (
                  bondedCheckIns.map((checkIn) => {
                    // Get the current name from bonded contacts, fallback to stored name
                    const currentContact = bondedContacts.find(
                      (c) => c.email === checkIn.userEmail,
                    );
                    const displayName =
                      currentContact?.name || checkIn.userName;
                    const displayEmoji = currentContact?.emoji || checkIn.emoji;

                    return (
                      <div
                        key={checkIn.id}
                        className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-400/20 hover:border-purple-400/40 transition"
                      >
                        <span className="text-2xl">{displayEmoji}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-purple-100 text-sm">
                            {displayName}
                          </p>
                          <p className="text-xs text-purple-300">
                            {checkIn.mood}
                          </p>
                          <p className="text-xs text-purple-400/60">
                            {checkIn.timestamp}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="space-y-3">
                    <p className="text-purple-300/80 text-sm">
                      No check-ins from bonded members yet today
                    </p>
                    {bondedContacts.length > 0 && (
                      <button
                        onClick={addDemoBondedCheckIns}
                        className="w-full px-4 py-2 text-sm bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 hover:text-purple-200 font-semibold rounded-lg transition border border-purple-400/30"
                      >
                        📋 Add Demo Check-ins (Test)
                      </button>
                    )}
                  </div>
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

            {/* Public Analytics Link */}
            <Link
              to="/analytics"
              className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-50 rounded-2xl border border-blue-400/40 p-6 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/20 transition block backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold">Community Insights</h3>
              </div>
              <p className="text-sm text-blue-300/80">
                View top memories and trending ads
              </p>
            </Link>

            {/* Advertiser Portal Link */}
            <Link
              to="/advertiser-login"
              className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-50 rounded-2xl border border-amber-400/40 p-6 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-500/20 transition block backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold">Advertiser Portal</h3>
              </div>
              <p className="text-sm text-amber-300/80">
                Private analytics for registered advertisers
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

        {/* Media Share Modal */}
        {mediaShareModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-cyan-400/30 rounded-2xl p-8 max-w-md w-full mx-4 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-cyan-100">
                  Share Media
                </h2>
                <button
                  onClick={() => {
                    setMediaShareModalOpen(null);
                    setSelectedContactsToShare([]);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Visibility Options */}
                <div>
                  <label className="text-sm font-semibold text-cyan-200 block mb-3">
                    Share with:
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setShareVisibility("community");
                        setSelectedContactsToShare([]);
                      }}
                      className={`w-full px-4 py-3 rounded-lg font-medium text-sm transition border ${
                        shareVisibility === "community"
                          ? "bg-cyan-600/20 border-cyan-400 text-cyan-100"
                          : "bg-white/5 border-cyan-400/30 text-cyan-300 hover:bg-white/10"
                      }`}
                    >
                      🌍 Everyone (Community)
                    </button>
                    <button
                      onClick={() => setShareVisibility("bonded-contacts")}
                      disabled={bondedContacts.length === 0}
                      className={`w-full px-4 py-3 rounded-lg font-medium text-sm transition border ${
                        shareVisibility === "bonded-contacts"
                          ? "bg-cyan-600/20 border-cyan-400 text-cyan-100"
                          : "bg-white/5 border-cyan-400/30 text-cyan-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}
                    >
                      💚 Bonded Contacts ({bondedContacts.length})
                    </button>
                  </div>
                </div>

                {/* Bonded Contacts Selection */}
                {shareVisibility === "bonded-contacts" &&
                  bondedContacts.length > 0 && (
                    <div>
                      <label className="text-sm font-semibold text-cyan-200 block mb-3">
                        Select contacts:
                      </label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {bondedContacts.map((contact) => (
                          <label
                            key={contact.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-cyan-400/20 hover:bg-white/10 cursor-pointer transition"
                          >
                            <input
                              type="checkbox"
                              checked={selectedContactsToShare.includes(
                                contact.id,
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedContactsToShare([
                                    ...selectedContactsToShare,
                                    contact.id,
                                  ]);
                                } else {
                                  setSelectedContactsToShare(
                                    selectedContactsToShare.filter(
                                      (id) => id !== contact.id,
                                    ),
                                  );
                                }
                              }}
                              className="w-4 h-4 rounded"
                            />
                            <div className="flex-1">
                              <p className="text-cyan-100 font-medium text-sm">
                                {contact.name}
                              </p>
                              <p className="text-cyan-400/60 text-xs">
                                {contact.email}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-cyan-400/20">
                  <button
                    onClick={() => {
                      setMediaShareModalOpen(null);
                      setSelectedContactsToShare([]);
                    }}
                    className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-cyan-300 font-medium rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const mediaItem = mediaItems.find(
                        (m) => m.id === mediaShareModalOpen,
                      );
                      if (mediaItem) {
                        handleShareMedia(mediaItem);
                      }
                    }}
                    className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/50 text-white font-medium rounded-lg transition"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
