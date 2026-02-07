import express from "express";
import { z } from "zod";

export const contactRouter = express.Router();

// Validation schema for contact form
const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100)
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, and apostrophes"),
  email: z.string().email("Invalid email address").max(255),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

// Store submissions in memory (in production, use database)
const contactSubmissions: Array<{
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  ipAddress?: string;
}> = [];

// Validation middleware
const validateContactForm = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const validated = contactFormSchema.parse(req.body);
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

// POST /api/contact/submit - Submit contact form
contactRouter.post("/submit", validateContactForm, async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Create submission record
    const submission = {
      id: Date.now().toString(),
      name,
      email,
      message,
      timestamp: new Date().toISOString(),
      ipAddress: req.ip,
    };

    // Store in memory
    contactSubmissions.push(submission);

    // Log the submission
    console.log(`[Contact Form] New submission from ${name} (${email})`);
    console.log(`  Message: ${message.substring(0, 100)}...`);
    console.log(`  Timestamp: ${submission.timestamp}`);

    // In production, you would:
    // 1. Send email via SendGrid, Mailgun, or Resend
    // 2. Store in database (Supabase, MongoDB, etc.)
    // 3. Send Slack notification
    // 4. Save to file storage

    // For now, just log to console and return success
    res.json({
      success: true,
      message: `Thank you for reaching out, ${name}! We received your message and will get back to you soon.`,
      submissionId: submission.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Contact Form Error]", error);
    res.status(500).json({
      error: "Failed to submit contact form",
      ...(process.env.NODE_ENV === "development" && {
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    });
  }
});

// GET /api/contact/submissions - View all submissions (development only)
contactRouter.get("/submissions", (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ error: "Not available in production" });
  }

  res.json({
    total: contactSubmissions.length,
    submissions: contactSubmissions.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      timestamp: s.timestamp,
      message: s.message.substring(0, 50) + "...",
    })),
  });
});
