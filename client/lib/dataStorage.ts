// Data storage utilities for managing notifications, media, and shared moments

export interface StoredMedia {
  id: string;
  type: "photo" | "video";
  url: string;
  timestamp: string;
  date: string;
  mood?: string;
  sharedWith?: string[]; // bond codes of contacts it's shared with
  visibility?: "personal" | "bonded-contacts" | "community";
  createdAt: string; // ISO timestamp for 3-day auto-deletion tracking
  deletedAt?: string | null; // null if not deleted
}

export interface StoredNotification {
  id: string;
  type:
    | "checkin"
    | "missed"
    | "media-shared"
    | "media-received"
    | "media-expiring";
  message: string;
  timestamp: string;
  date: string;
  fromContact?: string; // name of bonded contact who triggered notification
  read?: boolean;
}

export interface StoredSharedMoment {
  id: string;
  username: string;
  email?: string;
  avatar: string;
  mood: string;
  moodEmoji: string;
  timestamp: string;
  date: string;
  caption: string;
  mediaUrl?: string;
  mediaType?: "photo" | "video";
  likes: number;
  comments: StoredComment[];
  visibility: "everyone" | "bonded-contacts" | "specific-users";
  sharedWith?: string[]; // emails or bond codes
  createdAt: string;
  deletedAt?: string | null;
}

export interface StoredComment {
  id: string;
  username: string;
  email?: string;
  avatar: string;
  text: string;
  timestamp: string;
  createdAt: string;
}

export interface StoredCheckIn {
  id: string;
  userEmail: string;
  userName: string;
  emoji: string;
  mood: string;
  timestamp: string;
  date: string;
  timeSlot?: "morning" | "afternoon" | "evening";
  createdAt: string;
}

// Safe localStorage wrapper for Builder.io sandbox compatibility
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      // localStorage not available in Builder sandbox - return null
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // localStorage not available in Builder sandbox - silently fail
    }
  },
};

// ===== MEDIA STORAGE =====
export const mediaStorage = {
  getAll: (): StoredMedia[] => {
    try {
      const data = safeLocalStorage.getItem("uok_media");
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error loading media:", e);
      return [];
    }
  },

  add: (media: Omit<StoredMedia, "id">): StoredMedia => {
    const allMedia = mediaStorage.getAll();
    const activeMedia = mediaStorage.getActive();

    // LIMIT: Maximum 5 active media items per user
    // If adding new item would exceed limit, remove oldest one
    if (activeMedia.length >= 5) {
      // Find the oldest active media item (by timestamp)
      const oldest = activeMedia.reduce((prev, current) => {
        return new Date(current.timestamp) < new Date(prev.timestamp)
          ? current
          : prev;
      });

      // Mark oldest as deleted instead of removing it
      const index = allMedia.findIndex((m) => m.id === oldest.id);
      if (index !== -1) {
        allMedia[index].deletedAt = new Date().toISOString();
        console.log(
          `📦 Storage limit reached (5/5). Removing oldest media: ${oldest.id}`,
        );
      }
    }

    const newMedia: StoredMedia = {
      ...media,
      id: Date.now().toString() + Math.random(),
      createdAt: new Date().toISOString(),
    };

    allMedia.push(newMedia);
    safeLocalStorage.setItem("uok_media", JSON.stringify(allMedia));
    console.log(`✅ Media added. Active: ${mediaStorage.getActive().length}/5`);
    return newMedia;
  },

  update: (id: string, updates: Partial<StoredMedia>): StoredMedia | null => {
    const allMedia = mediaStorage.getAll();
    const index = allMedia.findIndex((m) => m.id === id);
    if (index !== -1) {
      allMedia[index] = { ...allMedia[index], ...updates };
      safeLocalStorage.setItem("uok_media", JSON.stringify(allMedia));
      return allMedia[index];
    }
    return null;
  },

  delete: (id: string): boolean => {
    const media = mediaStorage.getAll();
    const index = media.findIndex((m) => m.id === id);
    if (index !== -1) {
      media[index].deletedAt = new Date().toISOString();
      safeLocalStorage.setItem("uok_media", JSON.stringify(media));
      return true;
    }
    return false;
  },

  // Get only active (not deleted) media
  getActive: (): StoredMedia[] => {
    return mediaStorage.getAll().filter((m) => !m.deletedAt);
  },

  // Auto-delete media older than 3 days
  cleanupExpiredMedia: (): void => {
    const allMedia = mediaStorage.getAll();
    const now = new Date();
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
    let deletedCount = 0;

    const updatedMedia = allMedia.map((media) => {
      // Skip already deleted media
      if (media.deletedAt) {
        return media;
      }

      // Check if media is older than 3 days
      const createdDate = new Date(media.createdAt);
      const ageInMs = now.getTime() - createdDate.getTime();

      if (ageInMs > threeDaysInMs) {
        // Mark as deleted after 3 days
        deletedCount++;
        console.log(
          `🗑️ Auto-deleting expired media (${Math.floor(ageInMs / (24 * 60 * 60 * 1000))} days old): ${media.id}`,
        );
        return {
          ...media,
          deletedAt: new Date().toISOString(),
        };
      }

      return media;
    });

    // Only save if something was deleted
    if (deletedCount > 0) {
      safeLocalStorage.setItem("uok_media", JSON.stringify(updatedMedia));
      console.log(`✅ Cleaned up ${deletedCount} expired media items`);
    }
  },

  // Share media with bonded contacts
  shareWith: (
    mediaId: string,
    bondCodes: string[],
    visibility: "bonded-contacts" | "community",
  ): boolean => {
    const media = mediaStorage.getActive().find((m) => m.id === mediaId);
    if (media) {
      return (
        mediaStorage.update(mediaId, {
          sharedWith: bondCodes,
          visibility,
        }) !== null
      );
    }
    return false;
  },
};

// ===== NOTIFICATION STORAGE =====
export const notificationStorage = {
  getAll: (): StoredNotification[] => {
    try {
      const data = safeLocalStorage.getItem("uok_notifications");
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error loading notifications:", e);
      return [];
    }
  },

  add: (notification: Omit<StoredNotification, "id">): StoredNotification => {
    const allNotifications = notificationStorage.getAll();
    const newNotification: StoredNotification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
    };
    allNotifications.unshift(newNotification); // Add to beginning
    safeLocalStorage.setItem(
      "uok_notifications",
      JSON.stringify(allNotifications),
    );
    return newNotification;
  },

  markAsRead: (id: string): void => {
    const notifications = notificationStorage.getAll();
    const notification = notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
      safeLocalStorage.setItem(
        "uok_notifications",
        JSON.stringify(notifications),
      );
    }
  },

  getUnread: (): StoredNotification[] => {
    return notificationStorage.getAll().filter((n) => !n.read);
  },

  clear: (): void => {
    safeLocalStorage.setItem("uok_notifications", JSON.stringify([]));
  },
};

// ===== SHARED MOMENTS STORAGE =====
export const sharedMomentsStorage = {
  getAll: (): StoredSharedMoment[] => {
    try {
      const data = safeLocalStorage.getItem("uok_shared_moments");
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error loading shared moments:", e);
      return [];
    }
  },

  add: (
    moment: Omit<StoredSharedMoment, "id" | "createdAt">,
  ): StoredSharedMoment => {
    const allMoments = sharedMomentsStorage.getAll();
    const newMoment: StoredSharedMoment = {
      ...moment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    allMoments.unshift(newMoment); // Add to beginning
    safeLocalStorage.setItem("uok_shared_moments", JSON.stringify(allMoments));
    return newMoment;
  },

  update: (
    id: string,
    updates: Partial<StoredSharedMoment>,
  ): StoredSharedMoment | null => {
    const allMoments = sharedMomentsStorage.getAll();
    const index = allMoments.findIndex((m) => m.id === id);
    if (index !== -1) {
      allMoments[index] = { ...allMoments[index], ...updates };
      safeLocalStorage.setItem(
        "uok_shared_moments",
        JSON.stringify(allMoments),
      );
      return allMoments[index];
    }
    return null;
  },

  addComment: (momentId: string, comment: StoredComment): boolean => {
    const moment = sharedMomentsStorage.getAll().find((m) => m.id === momentId);
    if (moment) {
      return (
        sharedMomentsStorage.update(momentId, {
          comments: [...moment.comments, comment],
        }) !== null
      );
    }
    return false;
  },

  delete: (id: string): boolean => {
    const moment = sharedMomentsStorage.getAll().find((m) => m.id === id);
    if (moment) {
      return (
        sharedMomentsStorage.update(id, {
          deletedAt: new Date().toISOString(),
        }) !== null
      );
    }
    return false;
  },

  // Get only active (not deleted) moments
  getActive: (): StoredSharedMoment[] => {
    return sharedMomentsStorage.getAll().filter((m) => !m.deletedAt);
  },

  // Get moments visible to user (by visibility setting)
  getVisibleTo: (
    userEmail: string,
    bondedEmails?: string[],
  ): StoredSharedMoment[] => {
    return sharedMomentsStorage.getActive().filter((m) => {
      if (m.visibility === "everyone") return true;
      if (m.visibility === "community") return true;
      if (
        m.visibility === "bonded-contacts" &&
        bondedEmails?.some(
          (email) =>
            m.sharedWith?.includes(email) || m.sharedWith?.includes(userEmail),
        )
      ) {
        return true;
      }
      if (
        m.visibility === "specific-users" &&
        m.sharedWith?.includes(userEmail)
      ) {
        return true;
      }
      return false;
    });
  },

  // Toggle like
  toggleLike: (momentId: string): boolean => {
    const moment = sharedMomentsStorage.getAll().find((m) => m.id === momentId);
    if (moment) {
      // This is a simple toggle - in production, track actual likes per user
      return (
        sharedMomentsStorage.update(momentId, {
          likes: moment.likes + 1,
        }) !== null
      );
    }
    return false;
  },
};

// ===== NOTIFICATION DELIVERY HELPERS =====
export const notificationHelpers = {
  // Send email notification (in production, this would call a backend API)
  sendEmail: (
    recipientEmail: string,
    subject: string,
    message: string,
  ): void => {
    // In production, this would call your backend API:
    // POST /api/emails/send
    // Body: { to: recipientEmail, subject, message, timestamp: new Date() }
    console.log("📧 Email would be sent:", {
      to: recipientEmail,
      subject,
      message,
      timestamp: new Date().toISOString(),
    });

    // For now, we'll just log it as a notification
    notificationStorage.add({
      type: "checkin",
      message: `Email sent to ${recipientEmail}: "${subject}"`,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    });
  },

  // Create and send a check-in notification to bonded contacts
  sendCheckInNotification: (
    userEmail: string,
    mood: string,
    bondedContacts: Array<{ email: string; name: string }>,
  ): void => {
    bondedContacts.forEach((contact) => {
      // Add in-app notification
      notificationStorage.add({
        type: "checkin",
        message: `${userEmail} just checked in feeling ${mood} 💚`,
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

      // Send email notification
      notificationHelpers.sendEmail(
        contact.email,
        "UOK: Check-in Confirmation",
        `${userEmail} just checked in on UOK feeling ${mood}. They're doing okay! 💚`,
      );
    });
  },

  // Create and send a missed check-in alert
  sendMissedCheckInAlert: (
    userEmail: string,
    bondedContacts: Array<{ email: string; name: string }>,
  ): void => {
    bondedContacts.forEach((contact) => {
      notificationStorage.add({
        type: "missed",
        message: `⚠️ ALERT: ${userEmail} missed their check-in!`,
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
  },

  // Create and send a media share notification
  sendMediaShareNotification: (
    userEmail: string,
    mediaType: "photo" | "video",
    bondedContacts: Array<{ email: string; name: string }>,
  ): void => {
    bondedContacts.forEach((contact) => {
      notificationStorage.add({
        type: "media-shared",
        message: `${userEmail} shared a ${mediaType} with you 📸`,
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
  },
};

// ===== CHECK-IN STORAGE =====
export const checkInStorage = {
  getAll: (): StoredCheckIn[] => {
    try {
      const data = safeLocalStorage.getItem("uok_checkins");
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error loading check-ins:", e);
      return [];
    }
  },

  add: async (
    checkIn: Omit<StoredCheckIn, "id" | "createdAt">,
  ): Promise<StoredCheckIn> => {
    const allCheckIns = checkInStorage.getAll();
    const newCheckIn: StoredCheckIn = {
      ...checkIn,
      id: Date.now().toString() + Math.random(),
      createdAt: new Date().toISOString(),
    };
    allCheckIns.push(newCheckIn);
    safeLocalStorage.setItem("uok_checkins", JSON.stringify(allCheckIns));

    // Also save to Supabase for syncing with bonded contacts
    try {
      const { supabaseCheckInService } = await import("./supabase");
      await supabaseCheckInService.saveCheckIn(checkIn);
    } catch (error) {
      console.log("Supabase not available, check-in saved locally only");
    }

    return newCheckIn;
  },

  // Get today's check-ins for a specific user
  getTodayForUser: (userEmail: string): StoredCheckIn[] => {
    const today = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return checkInStorage
      .getAll()
      .filter((c) => c.userEmail === userEmail && c.date === today);
  },

  // Get today's check-ins from bonded contacts
  getTodayFromBondedContacts: (bondedEmails: string[]): StoredCheckIn[] => {
    const today = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return checkInStorage
      .getAll()
      .filter((c) => bondedEmails.includes(c.userEmail) && c.date === today);
  },

  // Get check-in count for today for a user
  getTodayCountForUser: (userEmail: string): number => {
    return checkInStorage.getTodayForUser(userEmail).length;
  },

  // Fetch bonded contacts' check-ins from Supabase (real-time sync)
  fetchBondedCheckInsFromSupabase: async (
    bondedEmails: string[],
  ): Promise<StoredCheckIn[]> => {
    try {
      const { supabaseCheckInService } = await import("./supabase");

      const supabaseCheckIns =
        await supabaseCheckInService.getBondedCheckIns(bondedEmails);

      // Supabase check-ins are already in StoredCheckIn format
      return supabaseCheckIns as StoredCheckIn[];
    } catch (error) {
      console.log("Supabase not available, returning local check-ins only");
      return [];
    }
  },

  // Backward-compatible alias for the old Firebase method name
  fetchBondedCheckInsFromFirebase: async (
    bondedEmails: string[],
  ): Promise<StoredCheckIn[]> => {
    return checkInStorage.fetchBondedCheckInsFromSupabase(bondedEmails);
  },

  // Delete check-ins older than 72 hours
  cleanupOldCheckIns: (): number => {
    const allCheckIns = checkInStorage.getAll();
    const now = new Date().getTime();
    const seventyTwoHoursInMs = 72 * 60 * 60 * 1000;

    const filtered = allCheckIns.filter((c) => {
      const checkInTime = new Date(c.createdAt).getTime();
      return now - checkInTime < seventyTwoHoursInMs;
    });

    const deletedCount = allCheckIns.length - filtered.length;

    if (deletedCount > 0) {
      safeLocalStorage.setItem("uok_checkins", JSON.stringify(filtered));
      console.log(
        `🧹 Cleaned up ${deletedCount} check-in(s) older than 72 hours`,
      );
    }

    return deletedCount;
  },
};
