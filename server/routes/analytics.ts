import express from "express";
import { z } from "zod";
import type { WeeklyReport } from "../../client/lib/analytics";

export const analyticsRouter = express.Router();

// Validation schemas
const emailSchema = z.string().email("Invalid email format").max(255);
const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");

const metricsSchema = z.object({
  totalViews: z.number().int().nonnegative(),
  totalLikes: z.number().int().nonnegative(),
  totalComments: z.number().int().nonnegative(),
  totalShares: z.number().int().nonnegative(),
  totalAdImpressions: z.number().int().nonnegative(),
  totalAdClicks: z.number().int().nonnegative(),
  engagementRate: z.number().nonnegative().max(100),
  adClickThroughRate: z.number().nonnegative().max(100),
});

const memorySchema = z.object({
  id: z.string().max(100),
  caption: z.string().max(1000),
  views: z.number().int().nonnegative(),
  likes: z.number().int().nonnegative(),
  comments: z.number().int().nonnegative(),
});

const adSchema = z.object({
  id: z.string().max(100),
  title: z.string().max(255),
  impressions: z.number().int().nonnegative(),
  clicks: z.number().int().nonnegative(),
  ctr: z.number().nonnegative().max(100),
});

const weeklyReportSchema = z.object({
  week: z.string().max(100),
  startDate: dateStringSchema,
  endDate: dateStringSchema,
  metrics: metricsSchema,
  topMemories: z.array(memorySchema),
  topAds: z.array(adSchema),
});

const sendWeeklyReportSchema = z.object({
  userEmail: emailSchema,
  report: weeklyReportSchema,
});

// Validation middleware
const validateWeeklyReport = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const validated = sendWeeklyReportSchema.parse(req.body);
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

// POST /api/analytics/send-weekly-report
analyticsRouter.post("/send-weekly-report", validateWeeklyReport, async (req, res) => {
  try {
    const { userEmail, report } = req.body as z.infer<typeof sendWeeklyReportSchema>;

    // Log the report (in production, send via email service)
    console.log(`\n📊 ===== WEEKLY ANALYTICS REPORT FOR ${userEmail} =====`);
    console.log(`📅 Week: ${report.week}`);
    console.log(`\n📈 METRICS SUMMARY:`);
    console.log(`   Total Views: ${report.metrics.totalViews}`);
    console.log(`   Total Likes: ${report.metrics.totalLikes}`);
    console.log(`   Total Comments: ${report.metrics.totalComments}`);
    console.log(`   Total Shares: ${report.metrics.totalShares}`);
    console.log(
      `   Engagement Rate: ${report.metrics.engagementRate.toFixed(2)}%`,
    );
    console.log(`\n🎯 AD PERFORMANCE:`);
    console.log(
      `   Total Ad Impressions: ${report.metrics.totalAdImpressions}`,
    );
    console.log(`   Total Ad Clicks: ${report.metrics.totalAdClicks}`);
    console.log(
      `   Click-Through Rate: ${report.metrics.adClickThroughRate.toFixed(2)}%`,
    );

    if (report.topMemories.length > 0) {
      console.log(`\n⭐ TOP MEMORIES:`);
      report.topMemories.forEach((memory, index) => {
        console.log(
          `   ${index + 1}. "${memory.caption}" - ${memory.views} views, ${memory.likes} likes, ${memory.comments} comments`,
        );
      });
    }

    if (report.topAds.length > 0) {
      console.log(`\n🎬 TOP ADS:`);
      report.topAds.forEach((ad, index) => {
        console.log(
          `   ${index + 1}. "${ad.title}" - ${ad.impressions} impressions, ${ad.clicks} clicks (${ad.ctr.toFixed(2)}% CTR)`,
        );
      });
    }

    console.log(
      `\n✅ Report generation completed at ${new Date().toISOString()}`,
    );
    console.log(`=====================================================\n`);

    // In production, you would integrate with email service like:
    // - SendGrid API (https://sendgrid.com/)
    // - Mailgun API (https://www.mailgun.com/)
    // - AWS SES (https://aws.amazon.com/ses/)
    // - Gmail SMTP (https://nodemailer.com/)
    // - Resend (https://resend.com/)

    // Example with SendGrid:
    /*
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const emailContent = generateEmailHTML(report, userEmail);
    const msg = {
      to: userEmail,
      from: "noreply@uok.app",
      subject: `Your Weekly Wellness Analytics - ${report.startDate} to ${report.endDate}`,
      html: emailContent,
    };

    await sgMail.send(msg);
    */

    res.json({
      success: true,
      message: `Weekly analytics report sent to ${userEmail}`,
      reportData: {
        week: report.week,
        metricsGenerated: true,
        topMemoriesCount: report.topMemories.length,
        topAdsCount: report.topAds.length,
      },
    });
  } catch (error) {
    console.error("Error sending weekly report:", error);
    res.status(500).json({
      error: "Failed to send weekly report",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/analytics/report-preview
// For testing - returns the current week's report structure
analyticsRouter.get("/report-preview", async (req, res) => {
  try {
    const userEmail = (req.query.email as string) || "demo@example.com";

    // In production, fetch actual analytics from database
    const mockReport: WeeklyReport = {
      week: "2024-01-01 to 2024-01-07",
      startDate: "2024-01-01",
      endDate: "2024-01-07",
      metrics: {
        totalViews: 245,
        totalLikes: 42,
        totalComments: 18,
        totalShares: 12,
        totalAdImpressions: 89,
        totalAdClicks: 7,
        engagementRate: 24.49,
        adClickThroughRate: 7.87,
      },
      topMemories: [
        {
          id: "mem-1",
          caption: "Family gathering at the park",
          views: 145,
          likes: 32,
          comments: 12,
        },
        {
          id: "mem-2",
          caption: "Weekend breakfast",
          views: 89,
          likes: 10,
          comments: 4,
        },
      ],
      topAds: [
        {
          id: "ad-1",
          title: "Premium Wellness Plan",
          impressions: 45,
          clicks: 4,
          ctr: 8.89,
        },
        {
          id: "ad-2",
          title: "Family Safety Features",
          impressions: 44,
          clicks: 3,
          ctr: 6.82,
        },
      ],
    };

    res.json({
      success: true,
      userEmail,
      report: mockReport,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating report preview:", error);
    res.status(500).json({
      error: "Failed to generate report preview",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
