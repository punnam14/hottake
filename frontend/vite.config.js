import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins:
    [react()],
  server: {
    host: "0.0.0.0",  // Ensure it listens to external requests
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    allowedHosts: ["hottake.pro", "localhost"],  
    hmr: {
      protocol: 'wss',  // Ensure WebSockets use secure protocol
      host: 'hottake.pro',  // Match your deployed domain
      port: 443,  // Match HTTPS port
    }
  },
})