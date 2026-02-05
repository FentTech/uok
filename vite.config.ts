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
      onwarn(warning) {
        // Suppress Firebase unresolved import warnings
        // These are safe because Firebase is loaded dynamically at runtime
        if (
          warning.code === "UNRESOLVED_IMPORT" &&
          warning.message?.includes("firebase")
        ) {
          return;
        }
        // Also suppress the external module warnings
        if (warning.message?.includes("externalize")) {
          return;
        }
      },
    },
  },
  publicDir: "public",
  plugins: [
    {
      name: "suppress-firebase-warnings",
      apply: "build",
      enforce: "pre",
      resolveId(id) {
        if (id.startsWith("firebase/")) {
          return id;
        }
      },
    },
    react(),
    expressPlugin(),
  ],
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
