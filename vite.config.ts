import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import sitemap from "vite-plugin-sitemap";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr(),
    sitemap({
      hostname: "https://www.coursecwk.com",
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "logonguyen.png", "images/**"],
      manifest: {
        name: "Biên tập nghiệp dư",
        short_name: "CourseCWK",
        description: "Học edit video TikTok chuyên nghiệp từ con số 0",
        theme_color: "#ffff00",
        background_color: "#0a0a0a",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/logonguyen.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/logonguyen.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/logonguyen.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Exclude download-zip khỏi cache
            urlPattern: /^https:\/\/.*\/api\/.*\/download-zip/,
            handler: "NetworkOnly",
          },
          {
            urlPattern: /^https:\/\/.*\/api\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 5 },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
