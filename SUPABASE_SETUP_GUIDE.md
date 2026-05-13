# Supabase Setup Guide - Firebase to Supabase Migration

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "Create a new project"
4. Fill in:
   - **Project name:** `uok-wellness` (or any name you prefer)
   - **Database password:** Create a strong password
   - **Region:** Choose closest to your users
5. Click "Create new project" and wait for it to be provisioned (2-3 minutes)

## Step 2: Set Up Database Tables

1. Once your project is ready, go to the **SQL Editor** in the Supabase dashboard
2. Click "New query"
3. Open the file `supabase_setup.sql` from your project root
4. Copy all the SQL commands from that file
5. Paste them into the Supabase SQL Editor
6. Click "Run" to execute all commands

**What this does:**

- Creates 9 database tables for your app
- Sets up indexes for faster queries
- Enables Row Level Security
- Creates basic access policies

## Step 3: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL:** (looks like `https://your-project-id.supabase.co`)
   - **Anon Key:** (the public anonymous key)

## Step 4: Update Environment Variables

Add these environment variables to your `.env.local` or environment:

```
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:**

- Never commit these secrets to git
- Use `.env.local` for local development
- Set environment variables in your deployment platform (Netlify, Vercel, etc.)

## Step 5: Verify the Setup

The migration is complete! Here's what changed:

### Files Modified:

- `client/lib/supabase.ts` - New Supabase service (replaces Firebase)
- `client/lib/dataStorage.ts` - Updated to use Supabase
- `client/pages/Dashboard.tsx` - Updated all Firebase imports
- `client/pages/BondContacts.tsx` - Updated all Firebase imports
- `client/pages/SharedMemories.tsx` - Updated all Firebase imports

### Files No Longer Used:

- `client/lib/firebase.ts` (can be deleted)

### What Still Works:

- All localStorage functionality (works as before)
- Analytics tracking (now stored in Supabase)
- Cross-device sync (via Supabase)
- Check-in management
- Bonded contacts
- Shared memories
- Advertiser system

## Step 6: Test the App

1. Start your dev server: `npm run dev`
2. Navigate to `/dashboard`
3. Create a check-in - it should sync to Supabase
4. Add bonded contacts - it should sync to Supabase
5. Share a memory - it should sync to Supabase
6. Check your Supabase dashboard → **Table Editor** to see data being saved

## Troubleshooting

### "Supabase not configured" message

- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart your dev server after updating `.env.local`

### Data not syncing

- Check the browser console for error messages
- Verify API keys are correct in your environment variables
- Ensure Row Level Security policies allow access

### Cross-device sync not working

- Make sure you're using the same email account on both devices
- Wait a moment for sync to complete (usually instant)
- Check Supabase dashboard to see if data is being saved

## Next Steps

1. Remove Firebase from your project: `npm uninstall firebase`
2. Update vite.config.ts to remove Firebase configuration (optional)
3. Delete the unused `client/lib/firebase.ts` file
4. Set up proper Row Level Security policies for production
5. Configure database backups in Supabase settings

## Cost Comparison

**Firebase:**

- Free tier: Limited to 50K reads/day
- After that: ~$5-50/month+

**Supabase:**

- Free tier: 500MB DB + 1GB storage (very generous)
- Pro tier: $25/month for 8GB DB + 100GB storage

**Result:** Save ~$200-600/year with Supabase! ✅

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.io
- GitHub Issues: Include logs and error messages

---

**The migration is now complete!** Your app now uses Supabase instead of Firebase with the same functionality. 🎉
