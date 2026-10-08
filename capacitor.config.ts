import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.uyghur.ai.platform',
  appName: 'Uyghur AI',
  webDir: 'public',
  server: {
    url: 'https://uyghur-ai-platform.pages.dev?app_version=1.0.5&build=105',
    cleartext: true
  },
  appendUserAgent: 'UyghurAIApp/1.0.5',
  android: {
    allowMixedContent: true
  }
};

export default config;
