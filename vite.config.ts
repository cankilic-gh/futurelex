import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // Validate required env vars at build time (production only)
    if (mode === 'production') {
      const required = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID',
      ];
      const missing = required.filter(key => !env[key]);
      if (missing.length > 0) {
        throw new Error(
          `\n\nBuild failed: Missing required environment variables:\n` +
          missing.map(k => `  - ${k}`).join('\n') +
          `\n\nSet these in Vercel project settings or .env.local\n`
        );
      }
    }

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      esbuild: {
        drop: mode === 'production' ? ['debugger'] : [],
        pure: mode === 'production' ? ['console.log', 'console.debug'] : [],
      },
    };
});
