import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',             // relative asset paths — required for packaged APK (Capacitor)
  server: {
    host: true,            // listen on 0.0.0.0 so the DevSpaces proxy can reach it
    port: 3000,
    strictPort: true,
    // Allow the DevSpaces proxy host to connect
    allowedHosts: ['.devspaces.amazon.dev'],
    hmr: {
      clientPort: 443,     // HMR works through the https proxy
    },
  },
  preview: {
    host: true,
    port: 3000,
    strictPort: true,
    allowedHosts: ['.devspaces.amazon.dev'],
  },
})
