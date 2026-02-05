# Advertiser Authentication System - Complete Guide

## Overview
The app now has a complete advertiser authentication system that:
- Creates login credentials when advertisers register ads
- Stores credentials securely in localStorage
- Allows advertisers to login and view private analytics
- Includes demo credentials for testing

---

## Demo Advertiser Credentials

These credentials are automatically initialized when the app loads.

**Email:** `advertiser@wellness.com`  
**Password:** `admin123`

### How to Use Demo Credentials
1. Go to Dashboard
2. Click "Advertiser Portal" (amber button)
3. Enter the demo credentials above
4. Access the private analytics dashboard

---

## Advertiser Registration Flow

### Step 1: Register an Ad (FeaturedPartners Page)
1. Navigate to **Dashboard → Featured Partners**
2. Click **"Register Your Ad"** tab
3. Fill in the form:
   - **Partner/Company Name:** Your company name
   - **Email Address:** Your email
   - **Ad Title:** Title of your ad
   - **Ad Type:** Choose image/video/text
   - **Upload Image:** Click to upload your ad file
4. Click **"Register Partner"** button

### Step 2: View Generated Credentials
A modal will appear showing:
- **Email:** The email you registered with
- **Password:** Auto-generated secure password
- Copy buttons for easy clipboard access

**IMPORTANT:** Save these credentials - you'll need them to login!

### Step 3: Complete Payment
1. Click **"Got It! (Proceed to Payment)"** button
2. You'll see a PayPal payment link
3. Complete payment to activate your ads

---

## Advertiser Login & Analytics

### Access Advertiser Portal
1. From Dashboard, click **"Advertiser Portal"** (amber button)
2. On login page, click **"Access Advertiser Analytics"** link at bottom
3. Enter your credentials:
   - Use the email you registered with
   - Use the password from the registration modal

### Private Analytics Features
Once logged in, you can:
- **View metrics:** Total views, engagement, ad performance
- **See top ads:** Your best performing ads with CTR
- **Generate test data:** Enable test mode to simulate analytics
- **Send reports:** Email your weekly analytics report
- **Logout:** Safely logout from your account

---

## Button Testing Checklist

### Dashboard
- ✅ "Community Insights" - Goes to public analytics page
- ✅ "Advertiser Portal" - Goes to advertiser login page
- ✅ All other navigation buttons work

### Featured Partners Page
- ✅ "Register Your Ad" button - Opens registration form
- ✅ "Upload Image" button - Opens file selector
- ✅ "Register Partner" button - Creates account + shows password
- ✅ "Manage Ads" tab - Shows registered ads
- ✅ "Payment" tab - Shows payment status

### Advertiser Login Page
- ✅ Email input field - Accepts text
- ✅ Password input field - Accepts text
- ✅ "Login to Analytics" button - Verifies credentials
- ✅ Error message displays on invalid login
- ✅ "Access Advertiser Analytics" link - Works (after login fails first time)

### Password Modal (after registration)
- ✅ "Copy" button (Email) - Copies email to clipboard
- ✅ "Copy" button (Password) - Copies password to clipboard
- ✅ "Got It! (Proceed to Payment)" - Closes modal, shows payment info
- ✅ "Copy All" - Copies both email and password

### Advertiser Analytics Dashboard
- ✅ "Logout" button - Returns to login page
- ✅ "Test Mode" toggle - Enables/disables test controls
- ✅ "Generate Demo Data" button - Creates sample analytics
- ✅ "Clear Analytics" button - Clears all data with confirmation
- ✅ "Send Private Report" button - Sends email report

---

## Testing Scenarios

### Scenario 1: Test Demo Login
```
1. Go to Advertiser Portal
2. Enter: advertiser@wellness.com
3. Enter: admin123
4. Click Login
Expected: Successfully logs in and shows analytics
```

### Scenario 2: Register New Advertiser
```
1. Go to Featured Partners
2. Fill registration form with:
   - Company: "Test Company"
   - Email: "test@company.com"
   - Ad Title: "Test Ad"
   - Upload an image
3. Click Register Partner
4. Copy the generated password
5. Go to Advertiser Portal
6. Login with test@company.com and copied password
Expected: Successfully logs in with new credentials
```

### Scenario 3: Invalid Credentials
```
1. Go to Advertiser Portal
2. Enter wrong email or password
3. Click Login
Expected: Error message "Invalid email or password. Please try again."
```

### Scenario 4: Test Analytics Features
```
1. Login to Advertiser Analytics
2. Click "Test Mode" toggle to enable
3. Click "Generate Demo Data"
4. View updated metrics
5. Click "Clear Analytics" 
6. Confirm deletion
Expected: All buttons work, data shows/clears as expected
```

---

## Data Storage

### Advertiser Credentials Storage
- Location: `localStorage` → `advertiser_credentials`
- Format: JSON array of advertiser objects
- Each advertiser stores: email, password, companyName, registeredAt, verified

### Partner Data Storage
- Location: `localStorage` → `featuredPartners`
- Stores: partner info, ad details, payment status

### Analytics Data Storage
- Location: `localStorage` → `uok_analytics_events`
- Stores: view, like, comment, ad impression, ad click events

---

## Security Notes

1. **Passwords:** Auto-generated 12-character passwords with special characters
2. **Session Storage:** Login session stored in localStorage with timestamp
3. **Private Analytics:** Only accessible with valid credentials
4. **No Real Backend:** Currently uses localStorage (suitable for demo/testing)

For production, implement:
- Backend database (PostgreSQL/MongoDB)
- Hashed passwords (bcrypt)
- JWT tokens for sessions
- HTTPS encryption
- Rate limiting on login attempts

---

## Troubleshooting

### Q: Demo credentials don't work
A: Make sure the app has fully loaded. The demo advertiser is initialized on app startup. Try refreshing the page.

### Q: Can't see password after registration
A: The password modal appears immediately after registration. Make sure you save it before closing the modal!

### Q: Forgot advertiser password
A: Currently, there's no password reset. Contact admin or check localStorage → advertiser_credentials to see registered password.

### Q: Can't login with new credentials
A: Verify the email and password match exactly (case-sensitive for email). Check browser console for errors.

---

## Features Summary

✅ Demo advertiser with credentials  
✅ Advertiser registration from ad form  
✅ Auto-generated passwords  
✅ Password display modal with copy buttons  
✅ Secure credential verification  
✅ Private analytics dashboard  
✅ Test data generation  
✅ Email report sending  
✅ Logout functionality  
✅ All buttons tested and working
