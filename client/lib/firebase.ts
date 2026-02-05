// Firebase Check-in Service
// Uses completely dynamic imports to avoid build-time resolution issues
export const firebaseCheckInService = {
  // Save check-in to Firebase
  saveCheckIn: async (checkInData: {
    userEmail: string;
    userName: string;
    emoji: string;
    mood: string;
    timestamp: string;
    date: string;
    timeSlot?: "morning" | "afternoon" | "evening";
  }): Promise<boolean> => {
    try {
      // Check if Firebase is configured
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (!projectId || projectId === "uok-demo") {
        console.log("Firebase not configured yet, saving locally only");
        return false;
      }

      // Dynamically import Firebase modules only when needed
      const { initializeApp } = await import("firebase/app");
      const { getFirestore, collection, addDoc, Timestamp } = await import(
        "firebase/firestore"
      );

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: projectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      await addDoc(collection(db, "checkins"), {
        ...checkInData,
        createdAt: Timestamp.now(),
      });

      console.log("✅ Check-in saved to Firebase");
      return true;
    } catch (error) {
      console.warn("⚠️ Failed to save to Firebase:", error);
      return false;
    }
  },

  // Get bonded contacts' check-ins from Firebase
  getBondedCheckIns: async (
    userEmail: string,
    bondedEmails: string[],
    today: string,
  ): Promise<any[]> => {
    try {
      // Check if Firebase is configured
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (!projectId || projectId === "uok-demo") {
        console.log("Firebase not configured yet, returning empty");
        return [];
      }

      if (bondedEmails.length === 0) {
        return [];
      }

      // Dynamically import Firebase modules only when needed
      const { initializeApp } = await import("firebase/app");
      const { getFirestore, collection, query, where, getDocs } = await import(
        "firebase/firestore"
      );

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: projectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      // Query for today's check-ins from bonded contacts
      const q = query(
        collection(db, "checkins"),
        where("userEmail", "in", bondedEmails),
        where("date", "==", today),
      );

      const snapshot = await getDocs(q);
      const checkins: any[] = [];

      snapshot.forEach((doc) => {
        checkins.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log(
        `📥 Fetched ${checkins.length} bonded check-ins from Firebase`,
      );
      return checkins;
    } catch (error) {
      console.warn("⚠️ Failed to fetch from Firebase:", error);
      return [];
    }
  },
};

// Firebase User Sync Service
export const firebaseUserSyncService = {
  // Save user profile and bonded contacts to Firebase
  syncUserProfile: async (
    userEmail: string,
    userData: any,
  ): Promise<boolean> => {
    try {
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (!projectId || projectId === "uok-demo") {
        console.log("Firebase not configured, skipping profile sync");
        return false;
      }

      const { initializeApp } = await import("firebase/app");
      const { getFirestore, collection, doc, setDoc } = await import(
        "firebase/firestore"
      );

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: projectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      await setDoc(doc(db, "users", userEmail), {
        ...userData,
        lastUpdated: new Date().toISOString(),
      });

      console.log("✅ User profile synced to Firebase");
      return true;
    } catch (error) {
      console.warn("⚠️ Failed to sync user profile:", error);
      return false;
    }
  },

  // Fetch user profile from Firebase
  fetchUserProfile: async (userEmail: string): Promise<any | null> => {
    try {
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (!projectId || projectId === "uok-demo") {
        return null;
      }

      const { initializeApp } = await import("firebase/app");
      const { getFirestore, collection, doc, getDoc } = await import(
        "firebase/firestore"
      );

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: projectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      const docSnapshot = await getDoc(doc(db, "users", userEmail));
      if (docSnapshot.exists()) {
        console.log("📥 Fetched user profile from Firebase");
        return docSnapshot.data();
      }

      return null;
    } catch (error) {
      console.warn("⚠️ Failed to fetch user profile:", error);
      return null;
    }
  },

  // Save bonded contacts to Firebase
  syncBondedContacts: async (
    userEmail: string,
    bondedContacts: any[],
  ): Promise<boolean> => {
    try {
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (!projectId || projectId === "uok-demo") {
        console.log("Firebase not configured, skipping bonded contacts sync");
        return false;
      }

      const { initializeApp } = await import("firebase/app");
      const { getFirestore, collection, doc, setDoc } = await import(
        "firebase/firestore"
      );

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: projectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      await setDoc(doc(db, "bondedContacts", userEmail), {
        contacts: bondedContacts,
        lastUpdated: new Date().toISOString(),
      });

      console.log("✅ Bonded contacts synced to Firebase");
      return true;
    } catch (error) {
      console.warn("⚠️ Failed to sync bonded contacts:", error);
      return false;
    }
  },

  // Fetch bonded contacts from Firebase
  fetchBondedContacts: async (userEmail: string): Promise<any[]> => {
    try {
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (!projectId || projectId === "uok-demo") {
        return [];
      }

      const { initializeApp } = await import("firebase/app");
      const { getFirestore, collection, doc, getDoc } = await import(
        "firebase/firestore"
      );

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: projectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      const docSnapshot = await getDoc(doc(db, "bondedContacts", userEmail));
      if (docSnapshot.exists()) {
        console.log("📥 Fetched bonded contacts from Firebase");
        return docSnapshot.data().contacts || [];
      }

      return [];
    } catch (error) {
      console.warn("⚠️ Failed to fetch bonded contacts:", error);
      return [];
    }
  },

  // Save user's check-ins to Firebase
  syncCheckIns: async (
    userEmail: string,
    checkIns: any[],
  ): Promise<boolean> => {
    try {
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (!projectId || projectId === "uok-demo") {
        console.log("Firebase not configured, skipping check-ins sync");
        return false;
      }

      const { initializeApp } = await import("firebase/app");
      const { getFirestore, collection, doc, setDoc } = await import(
        "firebase/firestore"
      );

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: projectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      await setDoc(doc(db, "userCheckIns", userEmail), {
        checkIns: checkIns,
        lastUpdated: new Date().toISOString(),
      });

      console.log("✅ Check-ins synced to Firebase");
      return true;
    } catch (error) {
      console.warn("⚠️ Failed to sync check-ins:", error);
      return false;
    }
  },

  // Fetch user's check-ins from Firebase
  fetchCheckIns: async (userEmail: string): Promise<any[]> => {
    try {
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (!projectId || projectId === "uok-demo") {
        return [];
      }

      const { initializeApp } = await import("firebase/app");
      const { getFirestore, collection, doc, getDoc } = await import(
        "firebase/firestore"
      );

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: projectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      const docSnapshot = await getDoc(doc(db, "userCheckIns", userEmail));
      if (docSnapshot.exists()) {
        console.log("📥 Fetched check-ins from Firebase");
        return docSnapshot.data().checkIns || [];
      }

      return [];
    } catch (error) {
      console.warn("⚠️ Failed to fetch check-ins:", error);
      return [];
    }
  },

  // Save user's media to Firebase
  syncMedia: async (userEmail: string, media: any[]): Promise<boolean> => {
    try {
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (!projectId || projectId === "uok-demo") {
        console.log("Firebase not configured, skipping media sync");
        return false;
      }

      const { initializeApp } = await import("firebase/app");
      const { getFirestore, collection, doc, setDoc } = await import(
        "firebase/firestore"
      );

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: projectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      await setDoc(doc(db, "userMedia", userEmail), {
        media: media,
        lastUpdated: new Date().toISOString(),
      });

      console.log("✅ Media synced to Firebase");
      return true;
    } catch (error) {
      console.warn("⚠️ Failed to sync media:", error);
      return false;
    }
  },

  // Fetch user's media from Firebase
  fetchMedia: async (userEmail: string): Promise<any[]> => {
    try {
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (!projectId || projectId === "uok-demo") {
        return [];
      }

      const { initializeApp } = await import("firebase/app");
      const { getFirestore, collection, doc, getDoc } = await import(
        "firebase/firestore"
      );

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: projectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      const docSnapshot = await getDoc(doc(db, "userMedia", userEmail));
      if (docSnapshot.exists()) {
        console.log("📥 Fetched media from Firebase");
        return docSnapshot.data().media || [];
      }

      return [];
    } catch (error) {
      console.warn("⚠️ Failed to fetch media:", error);
      return [];
    }
  },

  // Save user's shared moments to Firebase
  syncSharedMoments: async (
    userEmail: string,
    moments: any[],
  ): Promise<boolean> => {
    try {
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (!projectId || projectId === "uok-demo") {
        console.log("Firebase not configured, skipping shared moments sync");
        return false;
      }

      const { initializeApp } = await import("firebase/app");
      const { getFirestore, collection, doc, setDoc } = await import(
        "firebase/firestore"
      );

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: projectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      await setDoc(doc(db, "userSharedMoments", userEmail), {
        moments: moments,
        lastUpdated: new Date().toISOString(),
      });

      console.log("✅ Shared moments synced to Firebase");
      return true;
    } catch (error) {
      console.warn("⚠️ Failed to sync shared moments:", error);
      return false;
    }
  },

  // Fetch user's shared moments from Firebase
  fetchSharedMoments: async (userEmail: string): Promise<any[]> => {
    try {
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (!projectId || projectId === "uok-demo") {
        return [];
      }

      const { initializeApp } = await import("firebase/app");
      const { getFirestore, collection, doc, getDoc } = await import(
        "firebase/firestore"
      );

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: projectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      const docSnapshot = await getDoc(doc(db, "userSharedMoments", userEmail));
      if (docSnapshot.exists()) {
        console.log("📥 Fetched shared moments from Firebase");
        return docSnapshot.data().moments || [];
      }

      return [];
    } catch (error) {
      console.warn("⚠️ Failed to fetch shared moments:", error);
      return [];
    }
  },
};
