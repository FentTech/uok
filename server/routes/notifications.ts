import express from "express";

export const notificationsRouter = express.Router();

// POST /api/notifications/send-checkin-email
notificationsRouter.post("/send-checkin-email", async (req, res) => {
  try {
    const { recipientEmail, senderName, senderMood, timestamp } = req.body;

    // Validate inputs
    if (!recipientEmail || !senderName || !senderMood) {
      return res.status(400).json({
        error: "Missing required fields: recipientEmail, senderName, senderMood",
      });
    }

    console.log(`📧 Check-in notification sent to ${recipientEmail}`);
    console.log({
      recipient: recipientEmail,
      sender: senderName,
      mood: senderMood,
      timestamp: timestamp || new Date().toISOString(),
    });

    // In production, you would integrate with email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Gmail SMTP
    // For now, we just log it

    res.json({
      success: true,
      message: `Check-in notification would be sent to ${recipientEmail}`,
      // In production: actually send email via service
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({
      error: "Failed to send notification",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// POST /api/notifications/send-media-shared
notificationsRouter.post("/send-media-shared", async (req, res) => {
  try {
    const { recipientEmail, senderName, mediaType, timestamp } = req.body;

    // Validate inputs
    if (!recipientEmail || !senderName || !mediaType) {
      return res.status(400).json({
        error: "Missing required fields: recipientEmail, senderName, mediaType",
      });
    }

    console.log(
      `📧 Media shared notification sent to ${recipientEmail} for ${mediaType}`
    );

    res.json({
      success: true,
      message: `Media shared notification would be sent to ${recipientEmail}`,
    });
  } catch (error) {
    console.error("Error sending media notification:", error);
    res.status(500).json({
      error: "Failed to send notification",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
