import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appPort = 4000;
  const envAllowedHosts = (env.VITE_ALLOWED_HOSTS || "")
    .split(",")
    .map((host) => host.trim().replace(/^['\"]|['\"]$/g, ""))
    .filter(Boolean);
  const allowedHosts = Array.from(
    new Set(["localhost", "admin.somervillemobile.com.au", ...envAllowedHosts]),
  );

  return {
    server: {
      host: "::",
      port: appPort,
      strictPort: true,
      hmr: {
        overlay: false,
      },
    },
    preview: {
      host: "::",
      port: appPort,
      strictPort: true,
      allowedHosts,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean,
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
