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
  deletedAt?: string | null; // null if not deleted
}

export interface StoredNotification {
  id: string;
  type: "checkin" | "missed" | "media-shared" | "media-received";
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

// ===== MEDIA STORAGE =====
export const mediaStorage = {
  getAll: (): StoredMedia[] => {
    try {
      const data = localStorage.getItem("uok_media");
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error loading media:", e);
      return [];
    }
  },

  add: (media: Omit<StoredMedia, "id">): StoredMedia => {
    const allMedia = mediaStorage.getAll();
    const newMedia: StoredMedia = {
      ...media,
      id: Date.now().toString() + Math.random(),
    };
    allMedia.push(newMedia);
    localStorage.setItem("uok_media", JSON.stringify(allMedia));
    return newMedia;
  },

  update: (id: string, updates: Partial<StoredMedia>): StoredMedia | null => {
    const allMedia = mediaStorage.getAll();
    const index = allMedia.findIndex((m) => m.id === id);
    if (index !== -1) {
      allMedia[index] = { ...allMedia[index], ...updates };
      localStorage.setItem("uok_media", JSON.stringify(allMedia));
      return allMedia[index];
    }
    return null;
  },

  delete: (id: string): boolean => {
    const media = mediaStorage.getAll();
    const index = media.findIndex((m) => m.id === id);
    if (index !== -1) {
      media[index].deletedAt = new Date().toISOString();
      localStorage.setItem("uok_media", JSON.stringify(media));
      return true;
    }
    return false;
  },

  // Get only active (not deleted) media
  getActive: (): StoredMedia[] => {
    return mediaStorage.getAll().filter((m) => !m.deletedAt);
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
      const data = localStorage.getItem("uok_notifications");
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
    localStorage.setItem("uok_notifications", JSON.stringify(allNotifications));
    return newNotification;
  },

  markAsRead: (id: string): void => {
    const notifications = notificationStorage.getAll();
    const notification = notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
      localStorage.setItem("uok_notifications", JSON.stringify(notifications));
    }
  },

  getUnread: (): StoredNotification[] => {
    return notificationStorage.getAll().filter((n) => !n.read);
  },

  clear: (): void => {
    localStorage.setItem("uok_notifications", JSON.stringify([]));
  },
};

// ===== SHARED MOMENTS STORAGE =====
export const sharedMomentsStorage = {
  getAll: (): StoredSharedMoment[] => {
    try {
      const data = localStorage.getItem("uok_shared_moments");
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
    localStorage.setItem("uok_shared_moments", JSON.stringify(allMoments));
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
      localStorage.setItem("uok_shared_moments", JSON.stringify(allMoments));
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
  // Create and send a check-in notification to bonded contacts
  sendCheckInNotification: (
    userEmail: string,
    mood: string,
    bondedContacts: Array<{ email: string; name: string }>,
  ): void => {
    bondedContacts.forEach((contact) => {
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
