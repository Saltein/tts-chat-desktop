import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), svgr()],
    base: "./", // Важно для Electron - используйте относительные пути
    build: {
        outDir: "dist",
        emptyOutDir: true,
        minify: false,
    },
    server: {
        port: 5173,
    },
});
