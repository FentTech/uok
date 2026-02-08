import { VercelRequest, VercelResponse } from "@vercel/node";
import { createServer } from "../server/index";

// Create Express app instance (reused across invocations for better performance)
let app: any = null;

function getApp() {
  if (!app) {
    app = createServer();
  }
  return app;
}

// Handler function for Vercel serverless functions
// This handles all /api/* routes
export default function handler(req: VercelRequest, res: VercelResponse) {
  const expressApp = getApp();

  // Express expects the handler to be called directly
  return new Promise((resolve, reject) => {
    expressApp(req, res, (err: any) => {
      if (err) {
        console.error("Express error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Internal server error" });
        }
      }
      resolve(undefined);
    });
  });
}
