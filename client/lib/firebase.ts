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
    today: string
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
        where("date", "==", today)
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
        `📥 Fetched ${checkins.length} bonded check-ins from Firebase`
      );
      return checkins;
    } catch (error) {
      console.warn("⚠️ Failed to fetch from Firebase:", error);
      return [];
    }
  },
};
