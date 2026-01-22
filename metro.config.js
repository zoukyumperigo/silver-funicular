const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for Windows: disable node externals that cause path issues
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
