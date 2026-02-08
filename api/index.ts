import serverless from "serverless-http";
import { createServer } from "../server/index";

// Create Express app and wrap it for serverless
const app = createServer();

// Export the serverless handler for Vercel
// This handles all /api/* routes
export default serverless(app);
