export type PermissionRepository = {
  checkCameraPermission(): Promise<boolean>;
  requestCameraPermission(): Promise<boolean>;
  openSettings(): Promise<void>;
};
