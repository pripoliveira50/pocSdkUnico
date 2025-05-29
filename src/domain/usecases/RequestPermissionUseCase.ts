import { PermissionRepository } from '@domain/repositories/PermissionRepository';

export const executeRequestPermission = async (
  permissionRepository: PermissionRepository
): Promise<boolean> => {
  const hasPermission = await permissionRepository.checkCameraPermission();

  if (!hasPermission) {
    return await permissionRepository.requestCameraPermission();
  }

  return true;
};

export const openSettings = async (
  permissionRepository: PermissionRepository
): Promise<void> => {
  await permissionRepository.openSettings();
};

export const createRequestPermissionUseCase = (
  permissionRepository: PermissionRepository
) => ({
  execute: () => executeRequestPermission(permissionRepository),
  openSettings: () => openSettings(permissionRepository),
});
