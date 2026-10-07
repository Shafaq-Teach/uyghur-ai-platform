import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.uyghur.ai.platform',
  appName: 'ئۇيغۇر AI',
  webDir: 'public',
  server: {
    url: 'https://uyghur-ai-platform.pages.dev?app_version=1.0.1&build=101',
    cleartext: true
  },
  appendUserAgent: 'UyghurAIApp/1.0.1',
  android: {
    allowMixedContent: true
  }
};

export default config;
