import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

// Firebase configuration
// Get these values from your Firebase Console (Project Settings)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "uok-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "uok-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "uok-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Firebase Check-in Service
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
      // Only save if Firebase is properly configured
      if (!firebaseConfig.projectId || firebaseConfig.projectId === "uok-demo") {
        console.log("Firebase not configured yet, saving locally only");
        return false;
      }

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
      // Only fetch if Firebase is properly configured
      if (!firebaseConfig.projectId || firebaseConfig.projectId === "uok-demo") {
        console.log("Firebase not configured yet, returning empty");
        return [];
      }

      if (bondedEmails.length === 0) {
        return [];
      }

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

      console.log(`📥 Fetched ${checkins.length} bonded check-ins from Firebase`);
      return checkins;
    } catch (error) {
      console.warn("⚠️ Failed to fetch from Firebase:", error);
      return [];
    }
  },
};
