import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const config: any = {
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
        external: (id: string) => {
          // Mark all firebase modules as external
          return id.startsWith("firebase/");
        },
        output: {
          // When externalizing, Rollup expects these as globals
          globals: {
            firebase: "firebase",
          },
        },
        onwarn(warning: any, warn: any) {
          // Only suppress warnings we don't care about
          const message = `${warning.message} ${warning.source || ""}`.toLowerCase();

          // Suppress Firebase-related warnings since it's loaded dynamically
          if (message.includes("firebase")) {
            return;
          }

          // Suppress unresolved import warnings for external modules
          if (
            warning.code === "UNRESOLVED_IMPORT" &&
            message.includes("external")
          ) {
            return;
          }

          // Log other warnings
          warn(warning);
        },
      },
    },
    publicDir: "public",
    plugins: [
      {
        name: "firebase-resolver",
        apply: "build",
        enforce: "pre",
        resolveId(id: string) {
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
  };

  return config;
});

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
