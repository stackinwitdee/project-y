import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      buffer: path.resolve(__dirname, 'node_modules/buffer'),
    },
  },
  optimizeDeps: {
    include: ['buffer'],
  },
});
