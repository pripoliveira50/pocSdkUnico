module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@domain': './src/domain',
          '@data': './src/data',
          '@presentation': './src/presentation',
          '@infrastructure': './src/infrastructure',
          '@shared': './src/shared',
          
          '@': './src',
        },
      },
    ],
  ],
};