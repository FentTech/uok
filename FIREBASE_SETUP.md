# Firebase Setup for Real-Time Check-in Syncing

Your app is now configured to sync check-ins between bonded family members using Firebase! Follow these steps to connect it.

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Create Project" or "Add Project"
3. Enter project name: `uok-app`
4. Click through (no need to enable analytics)
5. Wait for project to be created

## Step 2: Get Firebase Credentials

1. In Firebase Console, click the **gear icon** (Settings) at the top left
2. Select **Project Settings**
3. Scroll down to "Your apps" section
4. Under "Web apps", click the **</>** (web) icon
5. Copy the config object - it should look like:

```javascript
{
  apiKey: "AIzaSyDxxxxx...",
  authDomain: "uok-app.firebaseapp.com",
  projectId: "uok-app",
  storageBucket: "uok-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
}
```

## Step 3: Create .env.local File

In your **project root** (same level as `package.json`), create a file named `.env.local`:

```
VITE_FIREBASE_API_KEY=AIzaSyDxxxxx...
VITE_FIREBASE_AUTH_DOMAIN=uok-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=uok-app
VITE_FIREBASE_STORAGE_BUCKET=uok-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef...
```

**Copy the values from your Firebase config above!**

## Step 4: Enable Firestore Database

1. In Firebase Console, go to **Build** (left sidebar)
2. Click **Firestore Database**
3. Click **Create Database**
4. Select **Start in test mode** (we'll secure it later)
5. Choose region (closest to you is fine)
6. Click **Create**

## Step 5: Install Firebase SDK

Run this in your terminal:

```bash
npm install firebase
```

## Step 6: Test It Out

1. Restart your dev server: `npm run dev`
2. Go to your app's Dashboard
3. Add bonded contacts (at minimum 2 contacts with different emails)
4. Have **Person A** do a check-in
5. Check **Person B's** Dashboard - the check-in should appear in "Bonded Family Check-ins" within 10 seconds!

---

## What's Happening Now

✅ **When someone checks in:**
- Check-in is saved to their local device (localStorage)
- Check-in is ALSO sent to Firebase database

✅ **Every 10 seconds on each device:**
- App fetches bonded contacts' check-ins from Firebase
- Displays them in "Bonded Family Check-ins" section
- Updates automatically as new check-ins come in

✅ **Offline Support:**
- If Firebase is unavailable, app falls back to local storage
- Check-ins are still saved locally
- Syncs back to Firebase when connection returns

---

## How to Verify It's Working

1. Open Firebase Console → Firestore Database
2. Look for a **"checkins"** collection
3. You should see documents like:
```
{
  date: "Feb 4"
  emoji: "😊"
  mood: "Great"
  timestamp: "09:30 AM"
  userEmail: "albert@example.com"
  userName: "Albert"
  timeSlot: "morning"
  createdAt: <timestamp>
}
```

If you see these documents, **Firebase is working!** ✅

---

## Securing Firebase (Important for Production)

For **testing only**, test mode is fine. Before going live, update security rules:

1. Go to **Firestore Database** → **Rules** tab
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /checkins/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.auth.token.email == request.resource.data.userEmail;
      allow update, delete: if false;
    }
  }
}
```

3. Click **Publish**

This ensures:
- Only authenticated users can read
- Users can only create check-ins for their own email
- Nobody can edit or delete check-ins (maintains integrity)

---

## Troubleshooting

### Check-ins not appearing in "Bonded Family Check-ins"

**Check 1:** Are bonded contacts' emails correct?
- Go to Dashboard → Settings → Manage Profile
- Note the exact email addresses of bonded contacts
- Person A's email must match Person B's bonded contact email

**Check 2:** Is Firebase connected?
- Check browser console for errors
- Look for messages like "✅ Check-in saved to Firebase"

**Check 3:** Is the date matching?
- Firebase stores check-ins with today's date
- Old check-ins (from yesterday) won't show in "today's" section

### Firebase credentials not loading

**Solution:**
1. Delete `.env.local`
2. Recreate it with exact Firebase config values
3. Restart your dev server completely
4. Hard refresh your browser (Ctrl+Shift+R)

### "Firebase not configured yet" message

**This means:**
- `.env.local` file is missing or incorrect
- Environment variables aren't loading
- Check that `.env.local` exists in project root (same level as package.json)

---

## How Check-in Sync Works

```
Person A's Device               Firebase Cloud               Person B's Device
─────────────────              ──────────────                ─────────────────
  Check in                           ↓
     ↓                        Store check-in
  Save locally                       ↓
     ↓                      Available to read
  Send to Firebase ────────→    (Firestore DB)
                                     ↓
                            Person B fetches ←─── Auto-refresh
                                  ↓               every 10 sec
                          Shows in "Bonded
                          Family Check-ins"
```

---

## Next Steps

✅ Set up Firebase with this guide
✅ Test with 2+ bonded contacts
✅ Verify check-ins sync in real-time
✅ Push to GitHub

After testing, you can secure the Firebase rules for production use.

---

## Questions?

If check-ins aren't syncing:
1. Check browser console (F12) for error messages
2. Verify Firebase Database has "checkins" collection
3. Confirm `.env.local` has correct credentials
4. Make sure bonded contacts' emails are correct
5. Try a hard refresh (Ctrl+Shift+R)

The app will work offline and sync when Firebase is available!
