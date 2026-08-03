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

  appendSharedMoment: async (userEmail: string, moment: any): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return false;
      const { data } = await supabase.from("shared_moments").select("shared_moments").eq("user_email", userEmail).maybeSingle();
      const current = Array.isArray(data?.shared_moments) ? data.shared_moments : [];
      const { error } = await supabase.from("shared_moments").upsert({ user_email: userEmail, shared_moments: [moment, ...current].slice(0, 100), updated_at: new Date().toISOString() }, { onConflict: "user_email" });
      if (error) throw error;
      return true;
    } catch (error) {
      console.warn("⚠️ Failed to publish shared moment:", error);
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
        .select("shared_moments, user_email")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const moments = (data || []).flatMap((row: any) => Array.isArray(row.shared_moments) ? row.shared_moments : []);
      console.log("📥 Fetched shared moments across users from Supabase");
      return moments;
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

  sendMissedCheckInNotification: async (
    recipientEmail: string,
    senderEmail: string,
    senderName: string,
  ): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return false;
      const { error } = await supabase.from("notifications").insert([{
        recipient_email: recipientEmail,
        sender_email: senderEmail,
        sender_name: senderName,
        notification_type: "missed",
        title: `${senderName} missed a check-in`,
        message: `⚠️ ${senderName} missed their scheduled check-in. Please check on them.`,
        metadata: { timestamp: new Date().toISOString() },
        read: false,
      }]);
      if (error) throw error;
      return true;
    } catch (error) {
      console.warn("⚠️ Failed to send missed check-in notification:", error);
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

  sendChatMessage: async (
    recipientEmail: string,
    senderEmail: string,
    senderName: string,
    message: string,
    kind: "text" | "feeling",
  ): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return false;
      const { error } = await supabase.from("notifications").insert([{
        recipient_email: recipientEmail,
        sender_email: senderEmail,
        sender_name: senderName,
        notification_type: "message",
        title: `${senderName} sent you a message`,
        message,
        metadata: { chat_message: true, kind, timestamp: new Date().toISOString() },
        read: false,
      }]);
      if (error) throw error;
      return true;
    } catch (error) {
      console.warn("⚠️ Failed to save chat message:", error);
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

  // Search for users by email (for login)
  searchUserByEmail: async (email: string): Promise<any[]> => {
    try {
      // For now, return empty as we're using localStorage for auth
      // In production, this would query your users table
      console.log("📧 Searching for user with email:", email);
      return [];
    } catch (error) {
      console.warn("⚠️ Failed to search user by email:", error);
      return [];
    }
  },
};

// Bond Relationship Service - Handles directional bonds between users
export const supabaseBondService = {
  // Check rate limit: Max 10 bonds per hour per user
  checkRateLimit: async (userEmail: string): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log("Supabase not configured, rate limit check skipped");
        return true; // Allow if Supabase unavailable
      }

      // Count bonds created in last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from("bond_relationships")
        .select("id", { count: "exact", head: true })
        .eq("bonding_user_email", userEmail)
        .gt("created_at", oneHourAgo);

      if (error) {
        console.warn("⚠️ Rate limit check failed:", error.message);
        return true; // Allow if check fails (fail-open)
      }

      const count = data?.length || 0;
      const canCreate = count < 10;

      if (!canCreate) {
        console.warn(
          `⚠️ Rate limit exceeded: ${userEmail} has ${count} bonds in last hour`,
        );
      }

      return canCreate;
    } catch (error) {
      console.warn("⚠️ Rate limit check error:", error);
      return true; // Allow if check fails (fail-open)
    }
  },

  // Create a bond relationship (User A bonds with User B)
  createBond: async (
    bondingUserName: string,
    bondingUserEmail: string,
    contactName: string,
    bondCode: string,
    contactEmail?: string,
  ): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.log("Supabase not configured, bond saved to localStorage only");
        return false;
      }

      // Check rate limit before creating
      const withinLimit =
        await supabaseBondService.checkRateLimit(bondingUserEmail);
      if (!withinLimit) {
        console.warn(
          "⚠️ Rate limit exceeded: Cannot create more bonds this hour",
        );
        return false;
      }

      // Create a bond record that shows User A has bonded with User B
      const { error } = await supabase.from("bond_relationships").insert([
        {
          bonding_user_name: bondingUserName,
          bonding_user_email: bondingUserEmail,
          contact_name: contactName,
          contact_email: contactEmail || null,
          bond_code: bondCode,
          status: "active",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        // Handle RLS violations
        if (error.code === "42501") {
          console.warn(
            "⚠️ Access denied: You do not have permission to create this bond",
          );
          return false;
        }
        throw error;
      }

      console.log(
        `✅ Bond created in Supabase: ${bondingUserName} -> ${contactName}`,
      );
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn("⚠️ Failed to create bond in Supabase:", errorMsg);
      return false;
    }
  },

  // Get all contacts that a user has bonded with
  getUserBonds: async (userEmail: string): Promise<any[]> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return [];
      }

      const { data, error } = await supabase
        .from("bond_relationships")
        .select("*")
        .eq("bonding_user_email", userEmail)
        .order("created_at", { ascending: false });

      if (error) {
        // Handle RLS violations
        if (error.code === "42501") {
          console.warn(
            "⚠️ Access denied: Cannot view bonds for this user (RLS policy)",
          );
          return [];
        }
        throw error;
      }

      console.log(
        `📥 Fetched ${data?.length || 0} bonds for user ${userEmail}`,
      );
      return data || [];
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn("⚠️ Failed to fetch bonds from Supabase:", errorMsg);
      return [];
    }
  },

  // Get all users who have bonded with this user (incoming bonds)
  getIncomingBonds: async (userName: string): Promise<any[]> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return [];
      }

      // Find all bonds where this user is the contact_name
      const { data, error } = await supabase
        .from("bond_relationships")
        .select("*")
        .eq("contact_name", userName)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        // Handle RLS violations (expected if user doesn't have access)
        if (error.code === "42501") {
          console.warn(
            "⚠️ Note: Incoming bonds require contact to have verified email",
          );
          return [];
        }
        // Non-RLS errors should still be logged
        if (!error.code?.includes("PGRST")) {
          throw error;
        }
      }

      console.log(
        `📥 Found ${data?.length || 0} incoming bonds for ${userName}`,
      );
      return data || [];
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn("⚠️ Failed to fetch incoming bonds:", errorMsg);
      return [];
    }
  },

  // Set up realtime listener for check-ins from bonded contacts
  subscribeToCheckIns: (
    userName: string,
    onCheckIn: (checkIn: any) => void,
  ) => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.warn("Supabase not configured for realtime");
        return null;
      }

      // Subscribe to check-in events where bonded contacts check in
      const subscription = supabase
        .from("check_ins")
        .on("INSERT", (payload) => {
          // When someone checks in, see if they're bonded with this user
          const senderName = payload.new.user_name;
          console.log(`🔔 Real-time check-in received from: ${senderName}`);
          onCheckIn(payload.new);
        })
        .subscribe();

      console.log(`✅ Realtime subscription active for ${userName}`);
      return subscription;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn("⚠️ Failed to subscribe to realtime check-ins:", errorMsg);
      return null;
    }
  },

  // Set up realtime listener for notifications
  subscribeToNotifications: (
    userEmail: string,
    onNotification: (notification: any) => void,
  ) => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.warn("Supabase not configured for realtime");
        return null;
      }

      // Subscribe to new notifications for this user
      const subscription = supabase
        .from("notifications")
        .on("INSERT", (payload) => {
          if (payload.new.recipient_email === userEmail) {
            console.log(
              `🔔 Real-time notification received from: ${payload.new.sender_name}`,
            );
            onNotification(payload.new);
          }
        })
        .subscribe();

      console.log(`✅ Notification subscription active for ${userEmail}`);
      return subscription;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn("⚠️ Failed to subscribe to notifications:", errorMsg);
      return null;
    }
  },
};

// Media Sync Service - Store and sync media metadata to Supabase
export const supabaseMediaService = {
  uploadMediaFile: async (file: File, mediaId: string, userEmail: string): Promise<string | null> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return null;
      const safeEmail = userEmail.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${safeEmail}/${mediaId}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage.from("uok-media").upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("uok-media").getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      console.warn("⚠️ Shared media upload failed:", error);
      return null;
    }
  },

  // Sync media to Supabase database for persistence
  syncMedia: async (userEmail: string, media: any[]): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.warn("⚠️ Supabase not configured, falling back to localStorage");
        return false;
      }

      // Store media metadata in database
      const { error } = await supabase.from("user_media").upsert(
        {
          user_email: userEmail,
          media_data: media, // Store as JSONB
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_email" },
      );

      if (error) {
        console.warn("⚠️ Failed to sync media to Supabase:", error.message);
        return false;
      }

      console.log("✅ Media synced to Supabase for user:", userEmail);
      return true;
    } catch (error) {
      console.warn(
        "⚠️ Error syncing media:",
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  },

  // Fetch media from Supabase
  fetchMedia: async (userEmail: string): Promise<any[]> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.warn("⚠️ Supabase not configured, using localStorage only");
        return [];
      }

      const { data, error } = await supabase
        .from("user_media")
        .select("media_data")
        .eq("user_email", userEmail)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows found, which is ok
        console.warn("⚠️ Failed to fetch media from Supabase:", error.message);
        return [];
      }

      const media = data?.media_data || [];
      console.log("✅ Loaded media from Supabase:", media.length, "items");
      return media;
    } catch (error) {
      console.warn(
        "⚠️ Error fetching media:",
        error instanceof Error ? error.message : String(error),
      );
      return [];
    }
  },

  // Delete media record
  deleteMedia: async (userEmail: string, mediaId: string): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return false;

      // Get current media
      const media = await supabaseMediaService.fetchMedia(userEmail);
      const updated = media.filter((m) => m.id !== mediaId);

      // Update database
      const { error } = await supabase.from("user_media").upsert(
        {
          user_email: userEmail,
          media_data: updated,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_email" },
      );

      if (error) {
        console.warn("⚠️ Failed to delete media from Supabase:", error.message);
        return false;
      }

      console.log("✅ Media deleted from Supabase:", mediaId);
      return true;
    } catch (error) {
      console.warn(
        "⚠️ Error deleting media:",
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  },
};

// Export the Supabase client for direct use if needed
export const getSupabase = () => getSupabaseClient();
