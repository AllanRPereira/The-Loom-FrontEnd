import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
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
