import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { handleDemo } from "./routes/demo";
import { notificationsRouter } from "./routes/notifications";
import { analyticsRouter } from "./routes/analytics";

// Security Middleware: Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Strict limit for auth endpoints (5 attempts per 15 min)
  message: "Too many login attempts, please try again later.",
  skipSuccessfulRequests: true, // Don't count successful logins
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  message: "API rate limit exceeded, please try again later.",
});

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
    return str
      .replace(/[<>]/g, "") // Remove angle brackets
      .trim();
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

export function createServer() {
  const app = express();

  // Trust proxy for accurate IP addresses behind Vercel/Netlify
  app.set("trust proxy", 1);

  // Security: Helmet - Set security HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "cdn.builder.io"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://youok.fit", "*.youok.fit"],
          fontSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'", "data:"],
          frameSrc: ["'self'"],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: "DENY" },
      xssFilter: true,
      noSniff: true,
    }),
  );

  // Middleware - ordered by priority
  app.use(securityLogger); // Log all requests for audit trail
  app.use(generalLimiter); // Apply general rate limit to all routes
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
  app.use("/api/notifications", apiLimiter, notificationsRouter);
  app.use("/api/analytics", apiLimiter, analyticsRouter);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
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
