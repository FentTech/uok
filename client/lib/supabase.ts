// Supabase Integration Service
// Drop-in replacement for Firebase with same API interface

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with error handling
let supabaseClientInstance: ReturnType<typeof createClient> | null = null;
let lastInitAttempt = 0;
let isNetworkAvailable = true;

const getSupabaseClient = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn("⚠️ Supabase credentials not configured");
    return null;
  }

  try {
    // Only create client once and reuse it
    if (!supabaseClientInstance) {
      supabaseClientInstance = createClient(url, key);
    }
    return supabaseClientInstance;
  } catch (error) {
    console.warn(
      "⚠️ Failed to initialize Supabase client:",
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
};

// Monitor network connectivity
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    isNetworkAvailable = true;
    console.log("✅ Network is available");
  });

  window.addEventListener("offline", () => {
    isNetworkAvailable = false;
    console.warn("⚠️ Network is unavailable");
  });
}

export const supabaseCheckInService = {
  // Save check-in to Supabase
  saveCheckIn: async (checkInData: {
    userEmail: string;
    timestamp: string;
    date: string;
    mood: string;
    notes: string;
  }): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log("Supabase not configured, saving locally only");
        return false;
      }

      const { error } = await supabase.from("check_ins").insert([
        {
          user_email: checkInData.userEmail,
          timestamp: checkInData.timestamp,
          date: checkInData.date,
          mood: checkInData.mood,
          notes: checkInData.notes,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      console.log("✅ Check-in saved to Supabase");
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (
        errorMsg.includes("Failed to fetch") ||
        errorMsg.includes("NetworkError")
      ) {
        console.warn("⚠️ Network error: Cannot save check-in to Supabase");
      } else {
        console.warn("⚠️ Failed to save check-in to Supabase:", errorMsg);
      }
      return false;
    }
  },

  // Get bonded contacts' check-ins from Supabase
  getBondedCheckIns: async (bondedEmails: string[]): Promise<any[]> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log("Supabase not configured");
        return [];
      }

      const { data, error } = await supabase
        .from("check_ins")
        .select("*")
        .in("user_email", bondedEmails)
        .order("timestamp", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (
        errorMsg.includes("Failed to fetch") ||
        errorMsg.includes("NetworkError")
      ) {
        console.warn(
          "⚠️ Network error: Cannot fetch bonded check-ins from Supabase",
        );
      } else {
        console.warn(
          "⚠️ Failed to fetch bonded check-ins from Supabase:",
          errorMsg,
        );
      }
      return [];
    }
  },
};

// Supabase User Sync Service
export const supabaseUserSyncService = {
  // Save user profile to Supabase
  syncUserProfile: async (
    userEmail: string,
    profile: any,
  ): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log("Supabase not configured, skipping profile sync");
        return false;
      }

      const { error } = await supabase.from("user_profiles").upsert(
        {
          email: userEmail,
          profile_data: profile,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" },
      );

      if (error) throw error;

      console.log("✅ User profile synced to Supabase");
      return true;
    } catch (error) {
      console.warn("⚠️ Failed to sync user profile to Supabase:", error);
      return false;
    }
  },

  // Fetch user profile from Supabase
  fetchUserProfile: async (userEmail: string): Promise<any | null> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return null;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("profile_data")
        .eq("email", userEmail)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found

      console.log("📥 Fetched user profile from Supabase");
      return data?.profile_data || null;
    } catch (error) {
      console.warn("⚠️ Failed to fetch user profile from Supabase:", error);
      return null;
    }
  },

  // Save bonded contacts to Supabase
  syncBondedContacts: async (
    userEmail: string,
    contacts: any[],
  ): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log("Supabase not configured, skipping bonded contacts sync");
        return false;
      }

      const { error } = await supabase.from("bonded_contacts").upsert(
        {
          user_email: userEmail,
          contacts: contacts,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_email" },
      );

      if (error) throw error;

      console.log("✅ Bonded contacts synced to Supabase");
      return true;
    } catch (error) {
      console.warn("⚠️ Failed to sync bonded contacts to Supabase:", error);
      return false;
    }
  },

  // Fetch bonded contacts from Supabase
  fetchBondedContacts: async (userEmail: string): Promise<any[]> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return [];
      }

      const { data, error } = await supabase
        .from("bonded_contacts")
        .select("contacts")
        .eq("user_email", userEmail)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      console.log("📥 Fetched bonded contacts from Supabase");
      return data?.contacts || [];
    } catch (error) {
      console.warn("⚠️ Failed to fetch bonded contacts from Supabase:", error);
      return [];
    }
  },

  // Save user's check-ins to Supabase
  syncCheckIns: async (
    userEmail: string,
    checkIns: any[],
  ): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log("Supabase not configured, skipping check-ins sync");
        return false;
      }

      const { error } = await supabase.from("user_check_ins").upsert(
        {
          user_email: userEmail,
          check_ins: checkIns,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_email" },
      );

      if (error) throw error;

      console.log("✅ Check-ins synced to Supabase");
      return true;
    } catch (error) {
      console.warn("⚠️ Failed to sync check-ins to Supabase:", error);
      return false;
    }
  },

  // Fetch user's check-ins from Supabase
  fetchCheckIns: async (userEmail: string): Promise<any[]> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return [];
      }

      const { data, error } = await supabase
        .from("user_check_ins")
        .select("check_ins")
        .eq("user_email", userEmail)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      console.log("📥 Fetched check-ins from Supabase");
      return data?.check_ins || [];
    } catch (error) {
      console.warn("⚠️ Failed to fetch check-ins from Supabase:", error);
      return [];
    }
  },

  // Save media to Supabase
  syncMedia: async (userEmail: string, media: any[]): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log("Supabase not configured, skipping media sync");
        return false;
      }

      const { error } = await supabase.from("user_media").upsert(
        {
          user_email: userEmail,
          media: media,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_email" },
      );

      if (error) throw error;

      console.log("✅ Media synced to Supabase");
      return true;
    } catch (error) {
      console.warn("⚠️ Failed to sync media to Supabase:", error);
      return false;
    }
  },

  // Fetch media from Supabase
  fetchMedia: async (userEmail: string): Promise<any[]> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return [];
      }

      const { data, error } = await supabase
        .from("user_media")
        .select("media")
        .eq("user_email", userEmail)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      console.log("📥 Fetched media from Supabase");
      return data?.media || [];
    } catch (error) {
      console.warn("⚠️ Failed to fetch media from Supabase:", error);
      return [];
    }
  },

  // Save shared moments to Supabase
  syncSharedMoments: async (
    userEmail: string,
    sharedMoments: any[],
  ): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log("Supabase not configured, skipping shared moments sync");
        return false;
      }

      const { error } = await supabase.from("shared_moments").upsert(
        {
          user_email: userEmail,
          shared_moments: sharedMoments,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_email" },
      );

      if (error) throw error;

      console.log("✅ Shared moments synced to Supabase");
      return true;
    } catch (error) {
      console.warn("⚠️ Failed to sync shared moments to Supabase:", error);
      return false;
    }
  },

  // Fetch shared moments from Supabase
  fetchSharedMoments: async (userEmail: string): Promise<any[]> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return [];
      }

      const { data, error } = await supabase
        .from("shared_moments")
        .select("shared_moments")
        .eq("user_email", userEmail)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      console.log("📥 Fetched shared moments from Supabase");
      return data?.shared_moments || [];
    } catch (error) {
      console.warn("⚠️ Failed to fetch shared moments from Supabase:", error);
      return [];
    }
  },
};

// Notification Service - Real-time notifications for bonded contacts
export const supabaseNotificationService = {
  // Send notification to bonded contacts (completely free, no email needed)
  sendCheckInNotification: async (
    recipientEmail: string,
    senderEmail: string,
    senderName: string,
    mood: string,
    emoji: string,
  ): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log(
          "Supabase not configured, notification saved to localStorage only",
        );
        return false;
      }

      const { error } = await supabase.from("notifications").insert([
        {
          recipient_email: recipientEmail,
          sender_email: senderEmail,
          sender_name: senderName,
          notification_type: "checkin",
          title: `${senderName} checked in`,
          message: `${emoji} ${senderName} just checked in feeling ${mood}. They're doing okay!`,
          metadata: {
            mood: mood,
            emoji: emoji,
            timestamp: new Date().toISOString(),
          },
          read: false,
        },
      ]);

      if (error) throw error;
      console.log(
        "✅ Check-in notification saved to Supabase for:",
        recipientEmail,
      );
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn("⚠️ Failed to send check-in notification:", errorMsg);
      return false;
    }
  },

  // Send media shared notification
  sendMediaSharedNotification: async (
    recipientEmail: string,
    senderEmail: string,
    senderName: string,
    mediaType: "photo" | "video",
  ): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log(
          "Supabase not configured, notification saved to localStorage only",
        );
        return false;
      }

      const { error } = await supabase.from("notifications").insert([
        {
          recipient_email: recipientEmail,
          sender_email: senderEmail,
          sender_name: senderName,
          notification_type: "media_shared",
          title: `${senderName} shared a ${mediaType}`,
          message: `${senderName} shared a ${mediaType} with you 📸`,
          metadata: {
            media_type: mediaType,
            timestamp: new Date().toISOString(),
          },
          read: false,
        },
      ]);

      if (error) throw error;
      console.log(
        "✅ Media shared notification saved to Supabase for:",
        recipientEmail,
      );
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn("⚠️ Failed to send media shared notification:", errorMsg);
      return false;
    }
  },

  // Fetch user's notifications
  getNotifications: async (
    userEmail: string,
    limit: number = 50,
  ): Promise<any[]> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log("Supabase not configured");
        return [];
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_email", userEmail)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn("⚠️ Failed to fetch notifications:", errorMsg);
      return [];
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log("Supabase not configured");
        return false;
      }

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn("⚠️ Failed to mark notification as read:", errorMsg);
      return false;
    }
  },
};

// Export the Supabase client for direct use if needed
export const getSupabase = () => getSupabaseClient();
