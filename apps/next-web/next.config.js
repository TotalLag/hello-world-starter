/** @type {import('next').NextConfig} */
const { withTamagui } = require('@tamagui/next-plugin');
const { join } = require('path');

const boolVals = {
  true: true,
  false: false,
};

const disableExtraction =
  boolVals[process.env.DISABLE_EXTRACTION] ??
  process.env.NODE_ENV === 'development';

console.log(`Tamagui CSS extraction disabled?`, disableExtraction);

const tamaguiConfig = {
  config: './tamagui.config.ts', // Path relative to this next.config.js
  components: ['tamagui', '@hello-world/ui'], // Include shared UI package
  importsWhitelist: ['constants.js', 'colors.js'],
  logTimings: true,
  disableExtraction,
  shouldExtract: (path) => {
    if (path.includes(join('packages', 'app'))) { // Adjust if your app package name differs
      return true;
    }
  },
  excludeReactNativeWebExports: [
    'Switch',
    'ProgressBar',
    'Picker',
    'CheckBox',
    'Touchable',
  ],
};

const nextConfig = {
  // Recommended settings for Tamagui
  typescript: {
    ignoreBuildErrors: true, // Tamagui types can sometimes cause issues
  },
  modularizeImports: {},
  transpilePackages: [
    'solito',
    'react-native-web',
    'expo-linking',
    'expo-constants',
    'expo-modules-core',
    // Add shared packages that need transpiling
    '@hello-world/ui',
    '@hello-world/config',
    '@hello-world/auth', // If it contains React components/hooks
    '@hello-world/shared', // If it contains React components/hooks
    '@hello-world/dashboard' // Transpile the shared dashboard package
  ],
  experimental: {
    // Recommended for Tamagui
    scrollRestoration: true,
    // optimizeCss: true, // May or may not be needed depending on setup
    // typedRoutes: true, // If using App Router typed routes
  },
};

// Apply Tamagui plugin
module.exports = function (name, { defaultConfig }) {
  let config = {
    ...defaultConfig,
    ...nextConfig,
  };

  const tamaguiPlugin = withTamagui(tamaguiConfig);
  config = tamaguiPlugin(config);

  // Add any other Next.js plugins here if needed

  return config;
};