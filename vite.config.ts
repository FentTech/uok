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
      external: [/^firebase\/.*/],
      onwarn(warning) {
        // Suppress Firebase-related warnings
        if (
          warning.code === "UNRESOLVED_IMPORT" &&
          warning.source?.includes("firebase")
        ) {
          return;
        }
      },
    },
  },
  publicDir: "public",
  plugins: [
    {
      name: "firebase-resolver",
      apply: "build",
      enforce: "pre",
      resolveId(id) {
        // Mark firebase modules as external to prevent bundling
        if (id.startsWith("firebase/")) {
          return { id, external: true };
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
