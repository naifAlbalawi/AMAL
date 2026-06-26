/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId: 'com.lifeos.app',
  appName: 'LifeOS',
  webDir: 'dist',
  server: { androidScheme: 'https' },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#F0F2F7',
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#F0F2F7',
    },
  },
};

export default config;

