import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true,
  
  // Habilitar Webpack build worker para builds mais rápidos
  experimental: {
    webpackBuildWorker: true,
  },
  
  env: {
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_BACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  },
  
  webpack(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Shim native modules that are pulled in by some wallet libs (not needed on web)
      '@react-native-async-storage/async-storage': path.resolve(__dirname, './shims/emptyAsyncStorage.js'),
      'pino-pretty': path.resolve(__dirname, './shims/pinoPretty.js'),
    };
    return config;
  }
};

export default nextConfig;
