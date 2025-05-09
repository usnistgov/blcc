import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        proxy: {
            "/api": "http://localhost:8080",
        },
    },
    preview: {
        proxy: {
            "/api": "http://localhost:8080",
        },
    },
    build: {
        assetsInlineLimit: 0,
        //outDir: "../backend/public/dist",
    },
    plugins: [react(), svgr(), tsconfigPaths()],
});
