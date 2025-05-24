import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    laravel({
      input: ["resources/css/app.css", "resources/js/app.jsx"],
      refresh: true,
    }),
    react({
      jsxRuntime: "automatic",
      fastRefresh: true,
    }),
  ],
  resolve: {
    alias: {
      "@": "/resources/js",
    },
  },
  build: {
    outDir: "public/build", 
    emptyOutDir: true,
    manifest: true, 
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        entryFileNames: 'assets/[name]-[hash].js',
      }
    }
  },
  server: {
    host: '0.0.0.0',
    hmr: process.env.NODE_ENV === 'development' ? {
      host: 'localhost',
      protocol: 'ws'
    } : false,
    cors: true
  }
});