module.exports = {
  dependencies: {
    'react-native-permissions': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-permissions/android',
          packageImportPath: 'import com.zoontek.rnpermissions.RNPermissionsPackage;',
        },
      },
    },
  },
};
