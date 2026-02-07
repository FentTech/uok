# 🔒 UOK App - Security Implementation & Email Setup Guide

## Overview

This document outlines all security improvements implemented and the email forwarding setup required for the support@youok.fit email address.

---

## ✅ Security Hardening Completed

### 1. **Server Security Middleware**

**Files Modified:** `server/index.ts`

- **Helmet.js**: Sets secure HTTP headers
  - Content Security Policy (CSP) to prevent XSS attacks
  - HSTS to enforce HTTPS
  - Frame guard to prevent clickjacking
  - X-Content-Type-Options to prevent MIME sniffing

- **Rate Limiting**: Prevents DDoS and brute force attacks
  - **General**: 100 requests per 15 minutes per IP
  - **Auth**: 5 attempts per 15 minutes per IP
  - **API**: 30 requests per 1 minute per IP

- **CORS Restriction**: Only allows requests from:
  - https://www.youok.fit
  - https://youok.fit
  - https://youok-5hbm.vercel.app (Vercel preview)
  - Environment-configured domains

- **Request Validation**:
  - Content-Type validation
  - XSS input sanitization (removes dangerous characters)
  - Parameter pollution detection
  - 10KB payload size limit

- **Security Logging**: Audit trail for all security-relevant events

### 2. **Input Validation & Sanitization**

**Files Modified:**

- `server/routes/notifications.ts`
- `server/routes/analytics.ts`

**Implementation:**

- Zod schema validation on all API endpoints
- Type checking for all request fields
- Email validation with proper regex
- Name validation (alphanumeric + spaces only)
- Numeric range validation for metrics
- Date format validation

**Example Validation:**

```typescript
const emailSchema = z.string().email("Invalid email format").max(255);
const nameSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z\s'-]+$/, "Invalid name format");
```

### 3. **Endpoints Protected**

All API endpoints now have strict validation:

- ✅ POST `/api/notifications/send-checkin-email`
- ✅ POST `/api/notifications/send-media-shared`
- ✅ POST `/api/analytics/send-weekly-report`
- ✅ GET `/api/analytics/report-preview`

### 4. **Additional Security Measures Recommended**

#### Supabase Row-Level Security (RLS)

To add RLS policies to Supabase:

1. Go to your Supabase project > SQL Editor
2. Create RLS policies for each table:

```sql
-- For check_ins table
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own check-ins"
  ON check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own check-ins"
  ON check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- For user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

#### Environment Variable Protection

Ensure sensitive variables are in environment, NOT in code:

- ✅ `VITE_SUPABASE_URL` (public)
- ✅ `VITE_SUPABASE_ANON_KEY` (public client key only)
- ✅ `FRONTEND_URL` (for CORS)
- ✅ `PING_MESSAGE` (optional)

Never commit:

- Service role keys
- API secrets
- Passwords
- Private keys

#### Password Security (Future Implementation)

When implementing user authentication:

- Use bcrypt or Argon2 for password hashing
- Implement password reset via secure token flow
- Enforce minimum password requirements
- Never store plaintext passwords
- Use HTTPS-only cookies for sessions

---

## 📧 Email Forwarding Setup (Namecheap)

### Step 1: Log into Namecheap

1. Go to https://www.namecheap.com/
2. Log in to your account
3. Click "Account" → "Dashboard"

### Step 2: Access Email Forwarding

1. Find your domain (youok.fit) in the domain list
2. Click the **down arrow** next to your domain
3. Click "Manage" button

### Step 3: Go to Email Settings

1. Look for the menu on the left sidebar
2. Find and click **"Email Forwarding"** or **"Redirect Email"**

### Step 4: Create Email Forward

1. Click "**Add Email Forward**" or similar button
2. Fill in the following:

| Field            | Value                |
| ---------------- | -------------------- |
| **Forward from** | `support@youok.fit`  |
| **Forward to**   | `afenteng@gmail.com` |

**Important Notes:**

- Keep "Forward to" email as your personal Gmail
- You can add multiple forwarding addresses if needed
- The email is forwarded in real-time, no setup on Gmail needed

### Step 5: Activate the Forward

1. Click "**Save**" or "**Add Email Forward**"
2. Wait for activation (usually instant to a few minutes)
3. You should see green checkmark when active

### Step 6: Test the Forward

1. Send a test email to `support@youok.fit`
2. Check your inbox at `afenteng@gmail.com`
3. Email should arrive within 1-2 minutes

### How It Works

```
Customer/User sends email to:
support@youok.fit
         ↓
    [Namecheap Email Server]
         ↓
Auto-forwards to:
afenteng@gmail.com
         ↓
You receive it in your Gmail inbox
```

### Incoming/Outgoing Emails

**Important:**

- **Incoming**: Emails sent TO `support@youok.fit` will forward to your Gmail
- **Outgoing**: If you want to reply FROM `support@youok.fit`, you'll need to:
  1. Set up Gmail to send as support@youok.fit (not required for basic forwarding)
  2. OR just reply from your personal Gmail (recommended)

### Troubleshooting Email Forwarding

**Issue: Email not forwarding**

- Solution 1: Wait 5-10 minutes for DNS to propagate
- Solution 2: Check spam/junk folder in Gmail
- Solution 3: Verify "Forward to" email is correct
- Solution 4: Check Namecheap dashboard shows "Active" status

**Issue: Too many/duplicate emails**

- Solution: Remove duplicate forwards from Namecheap

**Issue: Recipient says they didn't get reply**

- Solution: Spam filters may block auto-forwarded emails. Ask them to mark as "Not Spam"

---

## 🛡️ Security Checklist

- ✅ Helmet.js security headers configured
- ✅ Rate limiting enabled on all API routes
- ✅ CORS restricted to allowed origins only
- ✅ Input validation with Zod on all endpoints
- ✅ XSS protection via input sanitization
- ✅ Parameter pollution detection
- ✅ Payload size limits enforced
- ✅ Security logging for audit trail
- ✅ HTTPS enforcement (via Helmet HSTS)
- ✅ Email forwarding setup instructions

---

## 🚀 Next Steps

### Required

1. ✅ Email forwarding setup in Namecheap (see above)
2. Install missing npm packages (if needed):
   ```bash
   npm install helmet express-rate-limit
   ```

### Recommended

1. Enable Supabase RLS policies (see SQL above)
2. Add environment variables to Vercel:
   - `FRONTEND_URL=https://www.youok.fit`
   - `NODE_ENV=production`

### Optional

1. Set up email service for Contact form (SendGrid, Mailgun, etc.)
2. Implement password hashing for advertiser credentials
3. Add 2FA for admin accounts
4. Set up monitoring/alerts for suspicious requests

---

## 📝 Notes

- All security implementations use industry-standard practices
- Email forwarding is handled by Namecheap's secure servers
- No personal data is stored beyond what's necessary
- Regular security audits recommended
- Monitor `/api/analytics` logs for suspicious patterns

---

## 📞 Support

If you need help with any of these steps:

- Security questions: Review this document
- Namecheap issues: Contact Namecheap support
- Code issues: Review the server/index.ts and route files

Last updated: 2026-02-07
