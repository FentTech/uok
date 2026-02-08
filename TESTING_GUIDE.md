# UOK Wellness App - Final Testing & Responsive Design Guide

## Overview
This document outlines all the functions that need to be tested and responsive design verification across devices (mobile, tablet, desktop).

---

## Part 1: Function Testing Checklist

### 1. Authentication & User Management
- [ ] **Sign Up**: Create new account with email and password
- [ ] **Login**: Log in with existing credentials
- [ ] **Logout**: Verify logout clears session properly
- [ ] **Session Persistence**: Reload page - user should stay logged in
- [ ] **Invalid Credentials**: Login fails with wrong email/password
- [ ] **Email Validation**: Cannot sign up with invalid email format
- [ ] **Password Validation**: Cannot create account with password < 6 characters

### 2. Wellness Check-In (Dashboard)
- [ ] **Mood Selection**: All 20 emojis display and can be selected
- [ ] **Audio Feedback**: Beep sound plays when mood is selected (Web Audio API)
- [ ] **Mood Suggestions**: Affirmations appear after mood selection
- [ ] **Suggestions Display**: Suggestions stay visible for 15 seconds (increased from 2s)
- [ ] **Close Suggestions**: User can close suggestions with X button
- [ ] **Time Slot Selection**: Morning/Afternoon/Evening options work
- [ ] **Check-In Submission**: Successfully record check-in
- [ ] **Daily Limit**: User can make up to 3 check-ins per day
- [ ] **Check-In History**: View past check-ins in recent activity section

### 3. Media Upload & Persistence
- [ ] **Photo Upload**: Upload photo from device camera/gallery
- [ ] **Video Upload**: Upload video (max 100MB)
- [ ] **Media Persistence (NEW)**: Photos/videos persist after logout and login
  - Upload photo/video
  - Logout from app
  - Log back in
  - Media should still appear in dashboard
- [ ] **Media Storage**: Media stored in IndexedDB (not localStorage blob URLs)
- [ ] **Media Display**: Photos/videos display correctly in media grid
- [ ] **Media Metadata**: Timestamp, mood, and date are correct

### 4. Media Sharing (Shared Memories)
- [ ] **Share to Community**: Share media to public shared memories
- [ ] **Share to Bonded Contacts**: Share with specific contacts only
- [ ] **View Shared Media**: See photos/videos from other users
- [ ] **Like System**: Like/unlike memories, count updates
- [ ] **Comments**: Add and view comments on memories
- [ ] **Delete Comments**: Only comment author can delete own comments
- [ ] **Search**: Filter shared memories by username

### 5. Partner Advertisements
- [ ] **Ad Display**: Pre-roll ads appear before video playback
- [ ] **Ad Duration (NEW)**: Ads display for 20 seconds (not 10)
- [ ] **Ad Skip Option (NEW)**: Skip button appears after 10 seconds
- [ ] **Ad Skip Functionality (NEW)**: Clicking skip immediately shows video
- [ ] **Auto-play**: Video auto-plays after ad completes or is skipped
- [ ] **Ad Analytics**: Ad impressions are tracked

### 6. Bonded Contacts & Notifications
- [ ] **Add Contact**: Create bond with another user
- [ ] **View Contacts**: List of bonded contacts displays
- [ ] **Remove Contact**: Delete bonded contact
- [ ] **Contact Notifications**: Receive notifications when bonded contact checks in
- [ ] **Notification Display**: Unread notifications show count badge
- [ ] **Mark as Read**: Notifications can be marked as read

### 7. Wellness Insights
- [ ] **Weekly Trend**: Charts display mood trends over time
- [ ] **Statistics**: Show check-in frequency and patterns
- [ ] **Mood Distribution**: Visual breakdown of mood selections

### 8. Navigation & General UI
- [ ] **Language Switcher**: Select from 8 languages
- [ ] **Theme Toggle**: Switch between light/dark mode
- [ ] **Navigation Menu**: All menu items navigate correctly
- [ ] **Back Button**: Navigation back works correctly
- [ ] **Links**: All footer links work (Privacy, Terms, About, etc.)

---

## Part 2: Responsive Design Testing

### Device Categories

#### Mobile (Portrait)
- iPhone SE (375px)
- iPhone 12/13 (390px)
- iPhone 14 (430px)
- Android phones (360-412px)
- Test Orientation: Portrait

#### Tablet
- iPad (768px)
- iPad Pro (1024px)
- Test Orientation: Both portrait and landscape

#### Desktop
- Laptop (1366px)
- Large Monitor (1920px+)

### Responsive Design Checklist

#### All Pages - General
- [ ] **Navigation Bar**: Logo and menu items visible and clickable
- [ ] **Horizontal Scrolling**: No horizontal scroll on any device size
- [ ] **Text Readability**: Font sizes appropriate, not too small
- [ ] **Button Sizes**: Buttons are at least 44x44px for touch targets
- [ ] **Spacing**: Padding and margins appropriate for device size
- [ ] **Images**: Scale correctly without distortion
- [ ] **Modals/Overlays**: Full width on mobile, centered on desktop
- [ ] **Dropdowns**: Accessible and usable on all devices

#### Homepage (/)
- [ ] **Hero Section**: Title and subtitle stack on mobile
- [ ] **Feature Cards**: 
  - Mobile: Single column
  - Tablet: 2 columns
  - Desktop: 3 columns
- [ ] **How It Works**: Steps display vertically on mobile
- [ ] **CTA Buttons**: Full width on mobile, normal width on desktop
- [ ] **Footer**: Links stack on mobile, arranged in columns on desktop

#### Dashboard (/dashboard)
- [ ] **Check-In Area**: Full width and usable on all devices
- [ ] **Mood Emoji Grid**: 
  - Mobile: 4-5 per row
  - Tablet: 6-7 per row
  - Desktop: 10 per row
- [ ] **Media Grid**: 
  - Mobile: 1-2 columns
  - Tablet: 3 columns
  - Desktop: 4+ columns
- [ ] **Wellness Circle**: Contacts list scrollable on mobile

#### Shared Memories (/shared-memories)
- [ ] **Memory Cards**: Responsive on all devices
- [ ] **Comment Section**: Accessible and scrollable on mobile
- [ ] **Video Player**: Full-screen works on all devices
- [ ] **Pre-Roll Ad**: Full-screen and readable on all devices
- [ ] **Skip Button**: Easily tappable on mobile (min 44x44px)

#### Contact Page (/contact)
- [ ] **Form Fields**: Full width on mobile
- [ ] **Form Labels**: Stack above inputs on all devices
- [ ] **Submit Button**: Full width on mobile
- [ ] **Form Validation**: Error messages display without breaking layout

#### Authentication Pages (/login, /signup)
- [ ] **Form Container**: Centered and readable on all sizes
- [ ] **Input Fields**: Full width in form on mobile
- [ ] **Password Input**: Show/hide toggle accessible
- [ ] **Links**: Appropriate sizing for all devices

#### Profile & Settings Pages
- [ ] **Lists**: Stack properly on mobile
- [ ] **Toggle Switches**: Easily tappable
- [ ] **Forms**: Responsive on all device sizes

### CSS/Layout Testing

- [ ] **Flexbox**: Wrapping works correctly
- [ ] **Grid**: Responds to media queries
- [ ] **Media Queries**: Breakpoints work (sm: 640px, md: 768px, lg: 1024px)
- [ ] **Overflow**: No content hidden unexpectedly
- [ ] **Viewport Meta**: Correct viewport tag in HTML
- [ ] **Font Scaling**: Text scales proportionally
- [ ] **Mobile SafeArea**: No content under notch (if applicable)

### Touch & Interaction Testing (Mobile/Tablet)

- [ ] **Tap Targets**: All buttons/links are 44x44px minimum
- [ ] **Hover States**: No hover-only content on touch devices
- [ ] **Scroll Performance**: Smooth scrolling, no jank
- [ ] **Double-tap Zoom**: Works where appropriate
- [ ] **Long Press**: Context menus work if applicable
- [ ] **Swipe Gestures**: Media carousel swipes work (if applicable)

### Performance Testing

- [ ] **Page Load**: Loads within 3 seconds on 4G
- [ ] **Images**: Optimized for size and format (WebP if available)
- [ ] **Scripts**: Lazy-loaded when possible
- [ ] **Memory**: No memory leaks when uploading media to IndexedDB
- [ ] **Storage**: App indicates storage usage appropriately

---

## Part 3: Bug Fixes & Common Issues

### Known Issues & Fixes

#### Media Persistence (Fixed)
- **Issue**: Photos/videos disappear after logout
- **Fix**: Implemented IndexedDB storage instead of blob URLs
- **Verification**: Upload media → logout → login → media still present

#### Ad Duration (Fixed)  
- **Issue**: Ads only showed for 10 seconds
- **Fix**: Updated to 20-second duration with 10-second skip option
- **Verification**: Watch ad display for full 20s, skip available after 10s

#### Responsive Issues to Check
- [ ] Overflow text in small containers (especially on mobile)
- [ ] Modals not fitting on small screens
- [ ] Buttons too small to tap on touch devices
- [ ] Input fields not fully visible on small screens
- [ ] Excessive padding causing empty spaces on mobile

---

## Part 4: Testing Procedure

### Step-by-Step Testing Flow

#### Pre-Testing Setup
1. Clear browser cache and localStorage
2. Open DevTools and go to Device Emulation
3. Test on Chrome DevTools emulated devices first
4. Then test on real devices if available

#### Test Flow for Each Page
1. **Mobile** (375px): Verify layout, test interactions
2. **Tablet Landscape** (1024px): Verify layout adjustments
3. **Desktop** (1366px): Verify full desktop layout
4. **Desktop XL** (1920px): Verify doesn't stretch excessively

#### Critical User Flows to Test
1. **Sign Up → Check-In → Media Upload → Share → Logout → Login**
2. **View Shared Memory → Watch Ad (20s) → Skip at 10s → Comment → Like**
3. **Add Bonded Contact → Receive Notification → Respond**
4. **Upload Photo → Logout → Login → Photo Still Present**

---

## Part 5: Testing Report Template

```
Date Tested: ____
Device: ____
OS: ____
Browser: ____
Screen Size: ____

Issues Found:
1. [Issue Description] - [Severity: Critical/High/Medium/Low]
2. [Issue Description] - [Severity: Critical/High/Medium/Low]

Functions Passed:
- ✅ Function A
- ✅ Function B

Responsive Design: 
- Layout: ✅ Passes
- Typography: ✅ Passes
- Touch Targets: ✅ Passes

Overall Status: ☐ PASS ☐ NEEDS FIXES
```

---

## Part 6: Success Criteria

### All tests pass when:
- ✅ All 40+ functions work correctly
- ✅ No horizontal scrolling on any device
- ✅ Touch targets are 44x44px minimum
- ✅ Media persists across logout/login sessions
- ✅ Ads display for 20 seconds with skip after 10 seconds
- ✅ App is usable and readable on mobile (320px+), tablet, and desktop
- ✅ No console errors or warnings
- ✅ All pages load in under 3 seconds
- ✅ Navigation works seamlessly across all devices

---

## Part 7: Browser Compatibility

Test on:
- [ ] Chrome (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (Latest)
- [ ] Edge (Latest)
- [ ] Safari Mobile (iOS)
- [ ] Chrome Mobile (Android)

---

## Next Steps After Testing
1. Document any bugs found
2. Fix high-severity issues
3. Re-test fixed areas
4. Prepare for production deployment
5. Create user documentation

---

**Note**: This is the final comprehensive test before production deployment. Ensure all items are verified thoroughly.
