import { PermissionRepository } from '@domain/repositories/PermissionRepository';
import { Platform } from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  openSettings,
  request,
} from 'react-native-permissions';

const isIos = Platform.OS === 'ios';

const checkCameraPermissionImpl = async (): Promise<boolean> => {
  const permission = isIos
    ? PERMISSIONS.IOS.CAMERA
    : PERMISSIONS.ANDROID.CAMERA;

  const result = await request(permission);
  return result === RESULTS.GRANTED;
};

const requestCameraPermissionImpl = async (): Promise<boolean> => {
  const permission = isIos
    ? PERMISSIONS.IOS.CAMERA
    : PERMISSIONS.ANDROID.CAMERA;

  const result = await request(permission);
  return result === RESULTS.GRANTED;
};

const openSettingsImpl = async (): Promise<void> => {
  await openSettings();
};

export const permissionRepositoryImpl: PermissionRepository = {
  checkCameraPermission: checkCameraPermissionImpl,
  requestCameraPermission: requestCameraPermissionImpl,
  openSettings: openSettingsImpl,
};

export {
  checkCameraPermissionImpl as checkCameraPermission,
  openSettingsImpl as openSettings,
  requestCameraPermissionImpl as requestCameraPermission,
};
