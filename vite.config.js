import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  base: "/SAKINAH/",

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — always needed, never changes
          "vendor-react": ["react", "react-dom"],
          // Routing
          "vendor-router": ["react-router-dom"],
          // State management
          "vendor-state": ["@reduxjs/toolkit", "react-redux", "@tanstack/react-query"],
          // MUI core + icons (largest single chunk without splitting)
          "vendor-mui": [
            "@mui/material",
            "@mui/icons-material",
            "@emotion/react",
            "@emotion/styled",
          ],
          // MUI extended — less frequently loaded
          "vendor-mui-x": ["@mui/x-charts", "@mui/x-date-pickers", "@mui/lab"],
          // Calendar — only loaded on the appointments page
          "vendor-calendar": ["react-big-calendar"],
          // Forms
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "yup"],
          // Utilities
          "vendor-utils": ["date-fns", "uuid", "axios"],
        },
      },
    },
    // Warn on chunks >600kb (down from Vite default 500kb to allow MUI room)
    chunkSizeWarningLimit: 600,
  },
});
