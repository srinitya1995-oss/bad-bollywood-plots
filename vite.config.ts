import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Bad Plots: The Desi Party Game',
        short_name: 'Bad Plots',
        description: 'Terrible plots. Real movies. Guess Bollywood and Tollywood films from hilariously bad descriptions.',
        theme_color: '#1A0F0A',
        background_color: '#1A0F0A',
        display: 'standalone',
        icons: [
          { src: '/assets/logo.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /\.json$/,
            handler: 'StaleWhileRevalidate',
          },
        ],
      },
    }),
  ],
});
