import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Tauri's src-tauri/target is Cargo build output, actively written to
  // during `tauri dev` — Vite's watcher must never touch it, or the two
  // collide over locked files (EBUSY) mid-compile.
  clearScreen: false,
  server: {
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
})
