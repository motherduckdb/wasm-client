import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  experimental: {
    // Ensures asset URLs are relative from index.html
    renderBuiltUrl: (filename) => filename
  },
  plugins: [react()]
})
