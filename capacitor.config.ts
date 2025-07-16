import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a6201ce3259a41bba04edadad64ba1bd',
  appName: 'CodeMaster Pro',
  webDir: 'dist',
  server: {
    url: 'https://a6201ce3-259a-41bb-a04e-dadad64ba1bd.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a1a",
      showSpinner: true,
      spinnerColor: "#3b82f6"
    },
    StatusBar: {
      backgroundColor: "#1a1a1a",
      style: "dark"
    },
    Keyboard: {
      resize: "body"
    }
  }
};

export default config;