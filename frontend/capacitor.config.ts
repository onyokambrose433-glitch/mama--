import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mamashoppingcenter.app',
  appName: 'Mama Shopping Center',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    StatusBar: {
      backgroundColor: '#E15712',
      style: 'DARK',
    },
  },
};

export default config;
