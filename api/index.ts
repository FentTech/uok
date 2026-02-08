import { VercelRequest, VercelResponse } from "@vercel/node";
import { createServer } from "../server/index";

// Create Express app instance
const app = createServer();

// Handler function for Vercel serverless functions
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for Vercel deployments
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Handle the request through Express
  return new Promise((resolve) => {
    app.handle(req, res);
    // Ensure the promise resolves after Express handles the request
    res.on("finish", () => {
      resolve(undefined);
    });
    res.on("close", () => {
      resolve(undefined);
    });
  });
}
