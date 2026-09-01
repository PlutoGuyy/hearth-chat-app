import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Bundles the whole app into one self-contained dist-standalone/index.html
// (JS + CSS inlined, no separate asset files) so it can be kept around
// and opened directly if chat.plutoguy.net's hosting is ever unreachable.
// It still needs internet access to reach Firebase and Google Fonts —
// this only removes the dependency on that specific hosting.
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  publicDir: false,
  build: {
    outDir: 'dist-standalone',
    cssCodeSplit: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
  },
})
