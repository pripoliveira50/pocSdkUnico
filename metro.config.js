const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    ...defaultConfig.resolver,
    alias: {
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@data': path.resolve(__dirname, 'src/data'),
      '@presentation': path.resolve(__dirname, 'src/presentation'),
      '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
      '@shared': path.resolve(__dirname, 'src/shared'),
  
      '@': path.resolve(__dirname, 'src'),
    },
    platforms: ['ios', 'android', 'native', 'web'],
  },
  watchFolders: [
    path.resolve(__dirname, 'src'),
  ],
};

module.exports = mergeConfig(defaultConfig, config);