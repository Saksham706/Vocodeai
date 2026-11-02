import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-router-dom") || id.includes("react-dom") || id.includes("/react/")) {
              return "vendor-react";
            }
            if (id.includes("@monaco-editor")) {
              return "vendor-monaco";
            }
            if (id.includes("xterm")) {
              return "vendor-xterm";
            }
            if (id.includes("lucide-react") || id.includes("react-icons")) {
              return "vendor-icons";
            }
            if (id.includes("xlsx") || id.includes("mammoth") || id.includes("jszip")) {
              return "vendor-doc-viewers";
            }
            if (id.includes("marked") || id.includes("axios") || id.includes("jwt-decode")) {
              return "vendor-utils";
            }
          }
        },
      },
    },
  },
});
