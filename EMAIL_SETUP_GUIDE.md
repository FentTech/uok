# UOK Email Notifications Setup Guide

Your app is ready to send emails! Here's how to connect it to an actual email service.

## Option 1: Using SendGrid (Recommended - Free tier available)

### Step 1: Create SendGrid Account

1. Go to https://sendgrid.com
2. Sign up for a free account
3. Go to Settings → API Keys
4. Create a new API key (copy it - you'll need it)

### Step 2: Create Backend Email Service

Create a new file `server/routes/emails.js`:

```javascript
const express = require("express");
const sgMail = require("@sendgrid/mail");
const router = express.Router();

// Set your SendGrid API key from environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post("/send", async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    const msg = {
      to: to,
      from: process.env.SENDGRID_FROM_EMAIL, // e.g., 'noreply@uok.app'
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%); color: white; padding: 20px; border-radius: 10px;">
            <h1 style="margin: 0;">UOK - Understand Our Knowing</h1>
          </div>
          <div style="padding: 20px; background: #f8f8f8; border-radius: 10px; margin-top: 10px;">
            <p style="color: #333; line-height: 1.6;">${message}</p>
            <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
              This is an automated message from UOK. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### Step 3: Update Your Backend Server

In your main server file (e.g., `server/index.js`):

```javascript
const express = require("express");
const emailRoutes = require("./routes/emails");
require("dotenv").config();

const app = express();

app.use(express.json());

// Email routes
app.use("/api/emails", emailRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Step 4: Set Environment Variables

Create a `.env` file in your server directory:

```
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Step 5: Update Frontend Code

Update the `sendEmail` function in `client/lib/dataStorage.ts`:

```typescript
export const notificationHelpers = {
  sendEmail: async (
    recipientEmail: string,
    subject: string,
    message: string,
  ): Promise<void> => {
    try {
      const response = await fetch("/api/emails/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: recipientEmail,
          subject: subject,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      const data = await response.json();
      console.log("📧 Email sent successfully:", {
        to: recipientEmail,
        subject,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error sending email:", error);
      // Still add notification even if email fails
      notificationStorage.add({
        type: "checkin",
        message: `Email sending failed for ${recipientEmail}. In-app notification created instead.`,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      });
    }
  },

  // ... rest of your notification helpers
};
```

### Step 6: Install Dependencies

```bash
npm install @sendgrid/mail express dotenv
```

---

## Option 2: Using Mailgun (Also Free tier available)

### Setup Steps:

1. Go to https://www.mailgun.com
2. Sign up and verify domain
3. Get API key from dashboard
4. Create email route similar to SendGrid:

```javascript
const mailgun = require("mailgun.js");
const FormData = require("form-data");
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

router.post("/send", async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `UOK <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: [to],
      subject: subject,
      text: message,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## Option 3: Using Gmail SMTP (Simplest if you have Gmail)

### Setup Steps:

1. Enable 2-factor authentication on your Gmail account
2. Create an "App Password" at https://myaccount.google.com/apppasswords
3. Install nodemailer:

```bash
npm install nodemailer
```

4. Create email route:

```javascript
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD, // Use the App Password, not your regular password
  },
});

router.post("/send", async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: to,
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <p>${message}</p>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

5. Add to `.env`:

```
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password
```

---

## Option 4: Deploy on Netlify Functions (Serverless)

If you're using Netlify, you can use Netlify Functions instead of a separate backend:

### Step 1: Create Function

Create `netlify/functions/send-email.js`:

```javascript
const sgMail = require("@sendgrid/mail");

exports.handler = async (event) => {
  try {
    const { to, subject, message } = JSON.parse(event.body);

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    await sgMail.send({
      to: to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: subject,
      text: message,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

### Step 2: Update Frontend to Call Function

```typescript
const response = await fetch("/.netlify/functions/send-email", {
  method: "POST",
  body: JSON.stringify({
    to: recipientEmail,
    subject: subject,
    message: message,
  }),
});
```

---

## Testing Email Sending

### Test with SendGrid:

1. In browser console, run:

```javascript
fetch("/api/emails/send", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    to: "test@example.com",
    subject: "UOK Test Email",
    message: "This is a test email from UOK",
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

2. Check if email was received (may take 1-2 minutes)

3. If not received, check SendGrid dashboard → Activity → Message Events for errors

---

## Recommended Approach for UOK

**For development/testing:** Use Gmail SMTP (simplest setup)
**For production:** Use SendGrid (more reliable, better deliverability)

Both have free tiers that support thousands of emails per month, which is plenty for your app.

---

## Summary of Changes Needed

1. **Backend Setup** (choose one option above)
2. **Update `client/lib/dataStorage.ts`** - Make `sendEmail` async and call your API
3. **Add Environment Variables** - Store API keys securely
4. **Test** - Send test emails through check-in flow

Once you set this up, whenever users check in or bonded contacts are alerted, real emails will be sent to their registered email addresses!
