import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {VitePWA} from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
              name: "BLCC",
              short_name: "BLCC",
              description: "Economic analysis tool",
              theme_color: "#4287f5",
              icons: [
                  {
                      src: 'pwa-192x192.png',
                      sizes: '192x192',
                      type: 'image/png'
                  },
                  {
                      src: 'pwa-512x512.png',
                      sizes: '512x512',
                      type: 'image/png'
                  },
                  {
                      src: 'vite.svg',
                      sizes: 'any',
                      type: 'image/svg'
                  }
              ]
            },
            devOptions: {
                enabled: true
            }
        })
    ]
})