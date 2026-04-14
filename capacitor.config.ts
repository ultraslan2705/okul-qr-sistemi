import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.okulqrsistemi.app',
  appName: 'Okul QR Sistemi',
  webDir: 'dist',
  server: {
    url: 'https://okul-qr-sistemi.vercel.app',
    cleartext: false
  }
};

export default config;
