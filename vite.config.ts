import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets are loaded correctly in Electron (relative paths)
  build: {
    outDir: 'build', // Output directory matches what electron.js expects
    emptyOutDir: true,
  },
  define: {
    // Prevents code crashing if process.env is accessed in browser mode
    // In Electron, process.env is provided by nodeIntegration
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  }
});