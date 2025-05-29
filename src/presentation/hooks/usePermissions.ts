import { useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  openSettings,
  request,
} from 'react-native-permissions';

export const usePermissions = () => {
  const requestPermissionOrRedirect =
    useCallback(async (): Promise<boolean> => {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA;

      const result = await request(permission);

      if (result !== RESULTS.GRANTED) {
        Alert.alert(
          'Permissão necessária',
          'Para usar a câmera, vá em Ajustes e ative a permissão.',
          [{ text: 'Ir para Ajustes', onPress: () => openSettings() }]
        );
        return false;
      }
      return true;
    }, []);

  return {
    requestPermissionOrRedirect,
  };
};
