# Bonded Family Check-ins - Backend Setup Guide

## The Issue

The "Bonded Family Check-ins" section shows "No check-ins from bonded members yet today" because the app currently uses **localStorage only** - which stores data locally on each person's device.

### Current Architecture:
- **Person A** checks in → data saved to Person A's browser
- **Person B** checks in → data saved to Person B's browser
- **Person A's dashboard** can only see Person A's check-ins (stored locally)
- **Person A cannot see** Person B's check-ins (they're on Person B's device)

## The Solution

You need a **backend database** to sync check-ins between users. Here's how:

---

## Implementation Steps

### Step 1: Create Backend API for Check-ins

Create `server/routes/checkins.js`:

```javascript
const express = require('express');
const db = require('../database'); // Your database connection
const router = express.Router();

// Save a check-in to database
router.post('/save', async (req, res) => {
  try {
    const { userEmail, userName, emoji, mood, timestamp, date, timeSlot } = req.body;

    const checkIn = {
      userEmail,
      userName,
      emoji,
      mood,
      timestamp,
      date,
      timeSlot,
      createdAt: new Date(),
    };

    // Save to database
    await db.collection('checkins').insertOne(checkIn);

    res.json({ success: true, checkIn });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get check-ins from bonded contacts
router.get('/bonded/:userEmail', async (req, res) => {
  try {
    const userEmail = req.params.userEmail;
    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    // Get user's bonded contacts
    const user = await db.collection('users').findOne({ email: userEmail });
    const bondedEmails = user?.bondedContacts?.map((c) => c.email) || [];

    // Get today's check-ins from bonded contacts
    const checkins = await db
      .collection('checkins')
      .find({
        userEmail: { $in: bondedEmails },
        date: today,
      })
      .toArray();

    res.json({ success: true, checkins });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### Step 2: Update Frontend to Send Check-ins to Backend

Update `client/lib/dataStorage.ts`:

```typescript
export const checkInStorage = {
  // ... existing functions ...

  // Save check-in to BOTH localStorage and backend
  add: async (checkIn: Omit<StoredCheckIn, "id" | "createdAt">): Promise<StoredCheckIn> => {
    // Save to localStorage (offline support)
    const allCheckIns = checkInStorage.getAll();
    const newCheckIn: StoredCheckIn = {
      ...checkIn,
      id: Date.now().toString() + Math.random(),
      createdAt: new Date().toISOString(),
    };
    allCheckIns.push(newCheckIn);
    localStorage.setItem("uok_checkins", JSON.stringify(allCheckIns));

    // Also save to backend for syncing with bonded contacts
    try {
      const response = await fetch("/api/checkins/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkIn),
      });

      if (!response.ok) {
        console.warn("Failed to sync check-in to backend");
      }
    } catch (error) {
      console.log("Backend unavailable, using local storage only");
    }

    return newCheckIn;
  },

  // Fetch bonded contacts' check-ins from backend
  fetchBondedCheckIns: async (userEmail: string): Promise<StoredCheckIn[]> => {
    try {
      const response = await fetch(`/api/checkins/bonded/${userEmail}`);

      if (!response.ok) {
        throw new Error("Failed to fetch bonded check-ins");
      }

      const data = await response.json();
      return data.checkins || [];
    } catch (error) {
      console.log(
        "Cannot fetch bonded check-ins (backend unavailable or not set up)"
      );
      return [];
    }
  },
};
```

### Step 3: Update Dashboard to Fetch from Backend

Update `client/pages/Dashboard.tsx`:

```typescript
// After initialization, fetch bonded check-ins from backend
useEffect(() => {
  if (bondedContacts.length > 0) {
    const userEmail = localStorage.getItem("userEmail") || "user";

    // Fetch from backend
    checkInStorage.fetchBondedCheckIns(userEmail).then((fetchedCheckIns) => {
      setBondedCheckIns(fetchedCheckIns);
    });

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      checkInStorage.fetchBondedCheckIns(userEmail).then((fetchedCheckIns) => {
        setBondedCheckIns(fetchedCheckIns);
      });
    }, 10000);

    return () => clearInterval(interval);
  }
}, [bondedContacts]);
```

---

## Database Schema (MongoDB Example)

### Checkins Collection:

```javascript
{
  _id: ObjectId,
  userEmail: "mom@example.com",
  userName: "Mom",
  emoji: "😊",
  mood: "Great",
  timestamp: "09:30 AM",
  date: "Feb 4",
  timeSlot: "morning",
  createdAt: ISODate("2024-02-04T09:30:00Z")
}
```

### Users Collection:

```javascript
{
  _id: ObjectId,
  email: "albert@example.com",
  name: "Albert",
  bondedContacts: [
    {
      id: "contact1",
      name: "Mom",
      email: "mom@example.com",
      bondCode: "BOND-ABC123",
      status: "bonded"
    },
    {
      id: "contact2",
      name: "Sister",
      email: "sister@example.com",
      bondCode: "BOND-XYZ789",
      status: "bonded"
    }
  ],
  createdAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

## Database Options

### Option 1: Firebase (Easiest)

```typescript
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";

const db = getFirestore();

// Save check-in
await addDoc(collection(db, "checkins"), {
  userEmail,
  userName,
  emoji,
  mood,
  timestamp,
  date,
  timeSlot,
  createdAt: new Date(),
});

// Get bonded check-ins
const q = query(
  collection(db, "checkins"),
  where("userEmail", "in", bondedEmails),
  where("date", "==", today)
);
const snapshot = await getDocs(q);
```

### Option 2: MongoDB Atlas

```javascript
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();

const db = client.db("uok");
const checkins = db.collection("checkins");

// Save check-in
await checkins.insertOne({
  userEmail,
  userName,
  emoji,
  mood,
  timestamp,
  date,
  timeSlot,
  createdAt: new Date(),
});

// Get bonded check-ins
const results = await checkins
  .find({
    userEmail: { $in: bondedEmails },
    date: today,
  })
  .toArray();
```

### Option 3: Supabase (PostgreSQL)

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Save check-in
const { data, error } = await supabase.from("checkins").insert([
  {
    user_email: userEmail,
    user_name: userName,
    emoji,
    mood,
    timestamp,
    date,
    time_slot: timeSlot,
  },
]);

// Get bonded check-ins
const { data: checkins, error: fetchError } = await supabase
  .from("checkins")
  .select("*")
  .in("user_email", bondedEmails)
  .eq("date", today);
```

---

## Testing with Demo Data

For now, I've added a "📋 Add Demo Check-ins (Test)" button in the Bonded Family Check-ins section.

**To test:**
1. Go to Dashboard
2. Click Settings ⚙️ → Add Emergency Contacts
3. Add some bonded contacts (with email addresses)
4. Go back to Dashboard
5. In the "Bonded Family Check-ins" section, click "📋 Add Demo Check-ins (Test)"
6. See sample check-ins from your bonded contacts appear with emoji and mood

This simulates what will happen once the backend is connected!

---

## Summary

| Component | Current | With Backend |
|-----------|---------|--------------|
| Check-in Data | Stored locally on user's device | Stored in shared database |
| Bonded Visibility | User can only see their own | User can see bonded contacts' |
| Real-time Sync | None | Every 10 seconds |
| Works Offline | Yes (local only) | Yes (with sync when online) |
| Multiple Devices | No (data on one device) | Yes (synced across devices) |

**Next Steps:**
1. Choose a database (Firebase/MongoDB/Supabase)
2. Set up backend API endpoints
3. Update frontend to call backend API
4. Deploy both frontend and backend
5. Test with multiple users

Would you like help setting up any of these options?
