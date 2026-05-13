# UOK App - App Store Deployment Guide

Your app has been configured with Capacitor for native iOS and Android builds. Follow these steps to deploy to the App Store and Google Play.

---

## Prerequisites

### For iOS Deployment
- Mac computer with Xcode installed
- Apple Developer Account ($99/year)
- Provisioning profiles and certificates

### For Android Deployment
- Java Development Kit (JDK) installed
- Android Studio installed
- Google Play Developer Account ($25 one-time)
- Keystore file for signing APKs

---

## Building the Apps

### Step 1: Build the Web App and Sync Capacitor

Run this command to rebuild the web app and sync changes to the native projects:

```bash
pnpm run cap:sync
```

This will:
1. Build the React app
2. Copy web assets to iOS/Android projects
3. Update native configurations

### Step 2: Open the Native Projects

**For iOS (requires Mac):**
```bash
pnpm run cap:open:ios
```
This opens Xcode with the iOS project ready to build and deploy.

**For Android:**
```bash
pnpm run cap:open:android
```
This opens Android Studio with the Android project ready to build and deploy.

---

## iOS App Store Submission

### Step 1: Configure Signing in Xcode

1. Open the iOS project: `pnpm run cap:open:ios`
2. Select "UOK" project in the Project Navigator
3. Select "App" under Targets
4. Go to "Signing & Capabilities" tab
5. Select your Team from the dropdown
6. Let Xcode automatically manage signing

### Step 2: Set App Version

1. In Xcode, go to "General" tab
2. Set Version to match app-metadata.json (e.g., "1.0.0")
3. Set Build number to "1"

### Step 3: Build for Archive

1. In Xcode top menu: Product → Scheme → Select "App"
2. Product → Build For → Running (to test first)
3. Product → Archive

### Step 4: Validate and Submit

1. Go to Window → Organizer
2. Select your archive
3. Click "Validate App"
4. Fix any issues reported
5. Click "Distribute App"
6. Select "App Store Connect"
7. Follow the prompts to submit

### App Store Connect Setup
- Go to https://appstoreconnect.apple.com
- Create new app record with:
  - Bundle ID: `com.uok.app`
  - Name: `UOK - Understand Our Knowing`
  - Primary Language: English
  - Category: Health & Fitness
  - Subcategory: Health & Fitness
- Add app screenshots, description, and privacy policy
- Set pricing tier
- Submit for review

**Review Time:** 1-3 days typically

---

## Android Google Play Submission

### Step 1: Create Signing Key

First, create a keystore file to sign your APK:

```bash
keytool -genkey -v -keystore uok-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias uok
```

Save this keystore file securely - you'll need it for all future updates.

### Step 2: Configure Signing in Android Studio

1. Open the Android project: `pnpm run cap:open:android`
2. Go to Build → Generate Signed Bundle/APK
3. Select "Bundle (Google Play)" for app store submission
4. Select "Create new..."
5. Provide:
   - Key store path: (path to your keystore)
   - Key store password: (password you created)
   - Key alias: `uok`
   - Key password: (same as keystore password)
6. Click "Next" and select "Release" build type
7. Click "Finish" to generate the AAB (Android App Bundle)

### Step 3: Set Up Google Play Console

1. Go to https://play.google.com/console
2. Click "Create App"
3. Fill in:
   - App name: `UOK - Understand Our Knowing`
   - Default language: English
   - App category: Health & Fitness
   - Type: App
   - Free/Paid: Free (or your choice)

### Step 4: Submit for Review

1. In Google Play Console, go to "Releases" → "Production"
2. Click "Create new release"
3. Upload your AAB file (generated in Step 2)
4. Fill in release notes
5. Add content rating (questionnaire)
6. Configure app details:
   - Add short description
   - Add full description from app-metadata.json
   - Add privacy policy URL
   - Set target audience
7. Click "Review"
8. Resolve any issues
9. Click "Rollout to Production"

**Review Time:** Usually 2-3 hours, sometimes up to 24 hours

---

## Environment Variables for Capacitor

Add this to a `.env.capacitor` file (for secure storage in native apps):

```
VITE_APP_NAME=UOK - Understand Our Knowing
VITE_APP_VERSION=1.0.0
VITE_APP_CONTACT_EMAIL=support@uok.app
```

---

## Testing Before Submission

### iOS Testing
1. Connect an iPhone via USB
2. In Xcode: Product → Run
3. Test all features: check-ins, bonding, sharing, ads

### Android Testing
1. Enable USB Debugging on Android device
2. Connect via USB to Android Studio
3. Run the app from Android Studio
4. Test all features thoroughly

---

## Troubleshooting

### iOS Issues

**"Provisioning profile not found"**
- Go to Xcode → Settings → Accounts → Manage Certificates
- Create new certificate if needed

**"Code signing required"**
- Select a development team in Xcode signing settings

### Android Issues

**"Keystore not found"**
- Make sure the keystore file path is correct
- Double-check password

**"Build errors"**
- Run `pnpm run cap:sync` again
- Delete `android/` folder and re-run `pnpm exec cap add android`

---

## After First Submission

### Updates
- Increment version number in app-metadata.json
- Run `pnpm run cap:sync`
- Follow submission steps again (usually faster for updates)

### Managing Ads
- Bonded users' ads are verified via PayPal Transaction IDs
- Ads won't appear until payment verified
- Users can manage ads in FeaturedPartners page

### User Data Privacy
- All user data stored locally (localStorage)
- No data sent to servers
- Users have full control of their information

---

## Support & Resources

- Capacitor Docs: https://capacitorjs.com/docs
- Apple App Store Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Policies: https://play.google.com/about/developer-content-policy/
- Capacitor iOS Guide: https://capacitorjs.com/docs/ios
- Capacitor Android Guide: https://capacitorjs.com/docs/android

---

## Next Steps

1. Build and test locally on devices
2. Fix any compatibility issues
3. Create app store accounts if you haven't already
4. Prepare screenshots and descriptions
5. Submit to both stores
6. Monitor review process
7. Update when reviews are complete

Good luck with your UOK app launch!
