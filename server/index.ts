import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import { notificationsRouter } from "./routes/notifications";
import { analyticsRouter } from "./routes/analytics";
import { contactRouter } from "./routes/contact";
import { translateRouter } from "./routes/translate";

// Simple in-memory rate limiting (no external package needed)
// Only apply in production to avoid blocking dev requests
interface RateLimitStore {
  [ip: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};

const simpleRateLimit = (maxRequests: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting in development
    if (process.env.NODE_ENV === "development") {
      next();
      return;
    }

    const ip = req.ip || "unknown";
    const now = Date.now();

    if (!rateLimitStore[ip]) {
      rateLimitStore[ip] = { count: 1, resetTime: now + windowMs };
      next();
      return;
    }

    const record = rateLimitStore[ip];

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      next();
      return;
    }

    record.count++;

    if (record.count > maxRequests) {
      res
        .status(429)
        .json({ error: "Too many requests, please try again later" });
      return;
    }

    next();
  };
};

// CORS Configuration: Restrict to your domain only
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    const allowedOrigins = [
      "https://www.youok.fit",
      "https://youok.fit",
      "https://youok-5hbm.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 3600, // Cache preflight for 1 hour
};

// Request validation middleware
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  // Validate Content-Type for POST/PUT requests
  if (["POST", "PUT"].includes(req.method)) {
    if (
      req.is("application/json") === false &&
      Object.keys(req.body).length > 0
    ) {
      return res
        .status(400)
        .json({ error: "Invalid Content-Type. Expected application/json" });
    }
  }

  // Sanitize user inputs to prevent XSS
  const sanitizeString = (str: string): string => {
    if (typeof str !== "string") return str;
    return str.replace(/[<>]/g, "").trim();
  };

  // Deep sanitize all string values in request body
  if (typeof req.body === "object" && req.body !== null) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }

  // Prevent parameter pollution
  if (req.query && typeof req.query === "object") {
    Object.keys(req.query).forEach((key) => {
      if (Array.isArray(req.query[key])) {
        return res
          .status(400)
          .json({ error: "Duplicate query parameters detected" });
      }
    });
  }

  next();
};

// Security logging middleware
const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const isError = res.statusCode >= 400;

    if (isError || req.method !== "GET") {
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`,
      );
    }
  });

  next();
};

// Set security headers manually (without helmet package)
const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );
  next();
};

export function createServer() {
  const app = express();

  // Trust proxy for accurate IP addresses behind Vercel/Netlify
  app.set("trust proxy", 1);

  // Serve static files FIRST (before CORS/security middleware)
  const distPath = path.join(__dirname, "../dist/spa");
  app.use(express.static(distPath, { maxAge: "1h" }));

  // Middleware - ordered by priority
  app.use(securityLogger); // Log all requests for audit trail
  app.use(securityHeaders); // Set security headers
  app.use(simpleRateLimit(100, 15 * 60 * 1000)); // General: 100 requests per 15 minutes
  app.use(cors(corsOptions)); // CORS with strict origin validation
  app.use(express.json({ limit: "10kb" })); // Limit JSON payload to 10KB
  app.use(express.urlencoded({ extended: true, limit: "10kb" })); // Limit URL-encoded payload
  app.use(validateRequest); // Validate and sanitize all inputs

  // Health check endpoint (no auth required)
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Protected API routes with stricter rate limiting
  app.use(
    "/api/notifications",
    simpleRateLimit(30, 60 * 1000),
    notificationsRouter,
  ); // 30 req/min
  app.use("/api/analytics", simpleRateLimit(30, 60 * 1000), analyticsRouter); // 30 req/min
  app.use("/api/contact", simpleRateLimit(10, 60 * 1000), contactRouter); // 10 req/min to prevent spam
  app.use("/api/translate", simpleRateLimit(50, 60 * 1000), translateRouter); // 50 req/min for translations

  // SPA fallback: Serve index.html for all non-API, non-static routes (client-side routing)
  app.use((req: Request, res: Response) => {
    // Don't serve files with extensions - they should have been handled by static middleware
    if (req.path.includes(".")) {
      return res.status(404).json({ error: "Not found" });
    }

    // Don't serve API routes - they should have been handled earlier
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API route not found" });
    }

    // For all other routes, serve index.html for client-side routing
    res.sendFile(path.join(distPath, "index.html"), (err) => {
      if (err) {
        // If index.html doesn't exist (development mode), send basic SPA HTML
        console.log(
          "📄 Serving SPA HTML fallback for route:",
          req.path,
          "(dist not found)",
        );
        res.status(200).set("Content-Type", "text/html").send(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>UOK - Understand Our Knowing</title>
              <link rel="icon" type="image/x-icon" href="/favicon.ico" />
            </head>
            <body>
              <div id="root"></div>
              <script type="module" src="/assets/main.js"></script>
            </body>
          </html>
        `);
      }
    });
  });

  // Error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(`[Error] ${new Date().toISOString()}: ${err.message}`);
    res.status(500).json({
      error: "Internal server error",
      ...(process.env.NODE_ENV === "development" && { details: err.message }),
    });
  });

  return app;
}
