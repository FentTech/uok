import express from "express";
import { z } from "zod";

export const notificationsRouter = express.Router();

// Validation schemas
const emailSchema = z.string().email("Invalid email format").max(255);
const nameSchema = z.string().min(1).max(100).regex(/^[a-zA-Z\s'-]+$/, "Invalid name format");
const moodSchema = z.string().min(1).max(50);
const mediaTypeSchema = z.enum(["photo", "video", "audio"]);

const checkInNotificationSchema = z.object({
  recipientEmail: emailSchema,
  senderName: nameSchema,
  senderMood: moodSchema,
  timestamp: z.string().datetime().optional(),
});

const mediaSharedNotificationSchema = z.object({
  recipientEmail: emailSchema,
  senderName: nameSchema,
  mediaType: mediaTypeSchema,
  timestamp: z.string().datetime().optional(),
});

// Validation middleware
const validateCheckInNotification = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const validated = checkInNotificationSchema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      });
    }
    res.status(400).json({ error: "Invalid request" });
  }
};

const validateMediaSharedNotification = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const validated = mediaSharedNotificationSchema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      });
    }
    res.status(400).json({ error: "Invalid request" });
  }
};

// POST /api/notifications/send-checkin-email
notificationsRouter.post(
  "/send-checkin-email",
  validateCheckInNotification,
  async (req, res) => {
    try {
      const { recipientEmail, senderName, senderMood, timestamp } = req.body;

      console.log(`[Notification] Check-in: ${senderName} → ${recipientEmail} (${senderMood})`);
      console.log({
        recipient: recipientEmail,
        sender: senderName,
        mood: senderMood,
        timestamp: timestamp || new Date().toISOString(),
      });

      // In production, integrate with email service:
      // - SendGrid, Mailgun, AWS SES, Gmail SMTP, Netlify Forms
      // For now, we log it (simulating email sent)

      res.json({
        success: true,
        message: `Check-in notification would be sent to ${recipientEmail}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[Error] Notification send failed:", error);
      res.status(500).json({
        error: "Failed to send notification",
        ...(process.env.NODE_ENV === "development" && {
          details: error instanceof Error ? error.message : "Unknown error",
        }),
      });
    }
  }
);

// POST /api/notifications/send-media-shared
notificationsRouter.post(
  "/send-media-shared",
  validateMediaSharedNotification,
  async (req, res) => {
    try {
      const { recipientEmail, senderName, mediaType, timestamp } = req.body;

      console.log(
        `[Notification] Media shared: ${senderName} → ${recipientEmail} (${mediaType})`
      );

      // In production, integrate with email service
      res.json({
        success: true,
        message: `Media shared notification would be sent to ${recipientEmail}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[Error] Media notification send failed:", error);
      res.status(500).json({
        error: "Failed to send notification",
        ...(process.env.NODE_ENV === "development" && {
          details: error instanceof Error ? error.message : "Unknown error",
        }),
      });
    }
  }
);
