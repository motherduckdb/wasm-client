import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  experimental: {
    // Ensures URL for motherduck_logo is relative from index.html (i.e. assets/motherduck_logo) instead of absolute
    // (i.e. /assets/motherduck_logo).
    renderBuiltUrl: (filename) => filename
  },
  plugins: [react()],
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    }
  }
})
