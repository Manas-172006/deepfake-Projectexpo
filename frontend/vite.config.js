import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':  ['react', 'react-dom'],
          'motion':        ['framer-motion'],
          'pdf':           ['jspdf', 'html2canvas'],
          'icons':         ['lucide-react'],
        },
      },
    },
  },
})