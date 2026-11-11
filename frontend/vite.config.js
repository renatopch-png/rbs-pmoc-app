import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "RBS PMOC",
        short_name: "RBS PMOC",
        description:
          "Plano de Manutenção, Operação e Controle — RBS Refrigeração e Elétrica",
        theme_color: "#0B5394",
        background_color: "#EFF6FF",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // cache básico dos arquivos do app; dados do Firestore continuam
        // exigindo internet (não há cache offline de dados neste momento)
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        // PDFs de "Meus Estudos" abrem como arquivo (não como rota do app)
        // e ficam guardados no aparelho depois da primeira abertura.
        navigateFallbackDenylist: [/^\/estudos\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/estudos/") && url.pathname.endsWith(".pdf"),
            handler: "CacheFirst",
            options: {
              cacheName: "estudos-pdf",
              expiration: { maxEntries: 150 },
              rangeRequests: true,
            },
          },
        ],
        // Versão nova assume na hora e apaga os arquivos antigos do cache.
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
