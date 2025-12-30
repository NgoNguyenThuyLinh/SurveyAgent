// Frontend/config-overrides.js
// Customize CRA webpack configuration using react-app-rewired and customize-cra
const { override, addWebpackAlias } = require('customize-cra');
const path = require('path');

module.exports = override(
  addWebpackAlias({
    '@components': path.resolve(__dirname, 'src/components'),
    '@pages': path.resolve(__dirname, 'src/pages'),
    '@routes': path.resolve(__dirname, 'src/routes'),
    '@styles': path.resolve(__dirname, 'src/styles'),
    '@hooks': path.resolve(__dirname, 'src/hooks'),
    '@contexts': path.resolve(__dirname, 'src/contexts'),
    '@utils': path.resolve(__dirname, 'src/utils'),
    // Only enable aliases that exist in the codebase to avoid startup errors.
  }),
);
