import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.uyghur.ai.platform',
  appName: 'ئۇيغۇر AI',
  webDir: 'public',
  server: {
    url: 'https://uyghur-ai-platform.pages.dev',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
