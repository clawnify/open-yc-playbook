import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": {
        // Defaults to the wrangler port; override with API_PORT to run alongside
        // other local template dev servers.
        target: `http://localhost:${process.env.API_PORT || "8787"}`,
        changeOrigin: true,
      },
    },
  },
});
