import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
      onwarn(warning, warn) {
        // Suppress unresolved import and external module warnings
        // These are safe to ignore for Firebase modules
        if (
          (warning.code === "UNRESOLVED_IMPORT" ||
            warning.code === "EXTERNAL_NO_EXTERNAL" ||
            warning.message?.includes("externalize")) &&
          (warning.source?.includes("firebase") ||
            warning.message?.includes("firebase"))
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
  logLevel: "warn",
  publicDir: "public",
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}
